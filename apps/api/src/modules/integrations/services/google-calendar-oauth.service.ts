import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { OAuthIntegration } from '../entities/oauth-integration.entity';
import { IntegrationProvider } from '../enums/integration-provider.enum';
import { encryptToken, decryptToken } from '../utils/token-encryption.util';

interface StateTokenPayload {
  userId: string;
  nonce: string;
  iat: number;
  exp: number;
}

@Injectable()
export class GoogleCalendarOAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly encryptionKey: string;
  private readonly jwtSecret: string;
  private readonly scopes = [
    'https://www.googleapis.com/auth/calendar.events.readonly',
  ];

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(OAuthIntegration)
    private readonly oauthIntegrationRepository: Repository<OAuthIntegration>,
  ) {
    this.clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    this.redirectUri = this.configService.get<string>(
      'GOOGLE_OAUTH_REDIRECT_URI',
    );
    this.encryptionKey = this.configService.get<string>(
      'INTEGRATION_TOKEN_ENCRYPTION_KEY',
    );
    this.jwtSecret = this.configService.get<string>('JWT_SECRET');

    if (
      !this.clientId ||
      !this.clientSecret ||
      !this.redirectUri ||
      !this.encryptionKey ||
      !this.jwtSecret
    ) {
      throw new Error('Missing required Google Calendar OAuth configuration');
    }
  }

  /**
   * Generates a Google OAuth authorization URL with a signed state token
   */
  getAuthUrl(userId: string): string {
    // Generate a random nonce for CSRF protection
    const nonce = crypto.randomBytes(16).toString('hex');

    // Create a signed JWT state token
    const stateToken = jwt.sign(
      {
        userId,
        nonce,
      },
      this.jwtSecret,
      {
        expiresIn: '10m', // 10 minute expiry
      },
    );

    const oauth2Client = new OAuth2Client(
      this.clientId,
      this.clientSecret,
      this.redirectUri,
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Required to get refresh token
      prompt: 'consent', // Force consent screen to ensure refresh token
      scope: this.scopes,
      state: stateToken,
    });

    return authUrl;
  }

  /**
   * Handles the OAuth callback, exchanges code for tokens, and stores encrypted refresh token
   */
  async handleCallback(
    userId: string,
    code: string,
    state: string,
  ): Promise<void> {
    // Validate state token
    let statePayload: StateTokenPayload;
    try {
      statePayload = jwt.verify(state, this.jwtSecret) as StateTokenPayload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired state token');
    }

    // Verify userId matches
    if (statePayload.userId !== userId) {
      throw new UnauthorizedException('State token userId mismatch');
    }

    // Exchange code for tokens
    const oauth2Client = new OAuth2Client(
      this.clientId,
      this.clientSecret,
      this.redirectUri,
    );

    let tokenResponse;
    try {
      tokenResponse = await oauth2Client.getToken(code);
    } catch (error) {
      throw new BadRequestException(
        'Failed to exchange authorization code for tokens',
      );
    }

    const { refresh_token, access_token } = tokenResponse.tokens;

    if (!refresh_token) {
      throw new BadRequestException(
        'No refresh token received. Please ensure prompt=consent is used and the user grants offline access.',
      );
    }

    // Encrypt the refresh token
    const encryptedRefreshToken = encryptToken(
      refresh_token,
      this.encryptionKey,
    );

    // Upsert the integration record
    const existingIntegration = await this.oauthIntegrationRepository.findOne({
      where: {
        userId,
        provider: IntegrationProvider.GOOGLE_CALENDAR,
      },
    });

    if (existingIntegration) {
      existingIntegration.refreshTokenEncrypted = encryptedRefreshToken;
      existingIntegration.scopes = this.scopes;
      existingIntegration.updatedAt = new Date();
      await this.oauthIntegrationRepository.save(existingIntegration);
    } else {
      const newIntegration = this.oauthIntegrationRepository.create({
        userId,
        provider: IntegrationProvider.GOOGLE_CALENDAR,
        refreshTokenEncrypted: encryptedRefreshToken,
        scopes: this.scopes,
      });
      await this.oauthIntegrationRepository.save(newIntegration);
    }
  }

  /**
   * Gets an authenticated OAuth2Client for a user, configured with their refresh token
   */
  async getClientForUser(userId: string): Promise<OAuth2Client> {
    const integration = await this.oauthIntegrationRepository.findOne({
      where: {
        userId,
        provider: IntegrationProvider.GOOGLE_CALENDAR,
      },
    });

    if (!integration || !integration.refreshTokenEncrypted) {
      throw new UnauthorizedException(
        'Google Calendar not connected for this user',
      );
    }

    // Decrypt the refresh token
    let refreshToken: string;
    try {
      refreshToken = decryptToken(
        integration.refreshTokenEncrypted,
        this.encryptionKey,
      );
    } catch (error) {
      throw new UnauthorizedException('Failed to decrypt refresh token');
    }

    // Create and configure OAuth2Client
    const oauth2Client = new OAuth2Client(
      this.clientId,
      this.clientSecret,
      this.redirectUri,
    );

    // Set credentials with refresh token
    // The client will automatically refresh access tokens when needed
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    return oauth2Client;
  }

  /**
   * Gets the connection status for a user
   */
  async getStatus(
    userId: string,
  ): Promise<{ connected: boolean; scopes: string[] }> {
    const integration = await this.oauthIntegrationRepository.findOne({
      where: {
        userId,
        provider: IntegrationProvider.GOOGLE_CALENDAR,
      },
    });

    if (!integration || !integration.refreshTokenEncrypted) {
      return {
        connected: false,
        scopes: [],
      };
    }

    return {
      connected: true,
      scopes: integration.scopes || [],
    };
  }

  /**
   * Disconnects Google Calendar integration for a user
   */
  async disconnect(userId: string): Promise<void> {
    const integration = await this.oauthIntegrationRepository.findOne({
      where: {
        userId,
        provider: IntegrationProvider.GOOGLE_CALENDAR,
      },
    });

    if (!integration) {
      return; // Already disconnected
    }

    // Optionally revoke the refresh token via Google API
    if (integration.refreshTokenEncrypted) {
      try {
        const refreshToken = decryptToken(
          integration.refreshTokenEncrypted,
          this.encryptionKey,
        );
        const oauth2Client = new OAuth2Client(
          this.clientId,
          this.clientSecret,
          this.redirectUri,
        );
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        await oauth2Client.revokeCredentials();
      } catch (error) {
        // Log but don't fail if revocation fails
        console.error('Failed to revoke Google refresh token:', error);
      }
    }

    // Delete the integration record
    await this.oauthIntegrationRepository.remove(integration);
  }
}
