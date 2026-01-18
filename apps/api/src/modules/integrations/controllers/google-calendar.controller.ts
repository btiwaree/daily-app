import { CurrentUser } from '@/decorators/current-user.decorator';
import { Public } from '@/decorators/public.decorator';
import { ClerkAuthGuard } from '@/modules/auth/guards/clerk-auth.guard';
import { User } from '@clerk/backend';
import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { ListEventsDto } from '../dto/list-events.dto';
import { GoogleCalendarOAuthService } from '../services/google-calendar-oauth.service';
import {
  CalendarEvent,
  GoogleCalendarService,
} from '../services/google-calendar.service';

interface StateTokenPayload {
  userId: string;
  nonce: string;
  iat: number;
  exp: number;
}

@ApiTags('Google Calendar Integration')
@Controller('integrations/google-calendar')
export class GoogleCalendarController {
  private readonly jwtSecret: string;
  private readonly appWebUrl: string;

  constructor(
    private readonly oauthService: GoogleCalendarOAuthService,
    private readonly calendarService: GoogleCalendarService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET');
    this.appWebUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET is required');
    }
  }

  @Get('connect')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Initiate Google Calendar OAuth connection' })
  @ApiResponse({
    status: 200,
    description: 'Returns the Google OAuth URL',
    schema: {
      type: 'object',
      properties: {
        authUrl: { type: 'string' },
      },
    },
  })
  async connect(@CurrentUser() user: User) {
    const authUrl = this.oauthService.getAuthUrl(user.id);
    return { authUrl };
  }

  @Get('callback')
  @Public()
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend with connection status',
  })
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    // Handle OAuth errors
    if (error) {
      const redirectUrl = `${this.appWebUrl}/settings?googleCalendar=error&error=${encodeURIComponent(error)}`;
      return res.redirect(redirectUrl);
    }

    if (!code || !state) {
      const redirectUrl = `${this.appWebUrl}/settings?googleCalendar=error&error=missing_parameters`;
      return res.redirect(redirectUrl);
    }

    // Validate and extract userId from state token
    let userId: string;
    try {
      const statePayload = jwt.verify(
        state,
        this.jwtSecret,
      ) as StateTokenPayload;
      userId = statePayload.userId;
    } catch (error) {
      const redirectUrl = `${this.appWebUrl}/settings?googleCalendar=error&error=invalid_state`;
      return res.redirect(redirectUrl);
    }

    try {
      await this.oauthService.handleCallback(userId, code, state);
      const redirectUrl = `${this.appWebUrl}/settings?googleCalendar=connected`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('OAuth callback error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'unknown_error';
      const redirectUrl = `${this.appWebUrl}/settings?googleCalendar=error&error=${encodeURIComponent(errorMessage)}`;
      res.redirect(redirectUrl);
    }
  }

  @Get('status')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Get Google Calendar connection status' })
  @ApiResponse({
    status: 200,
    description: 'Returns connection status and scopes',
    schema: {
      type: 'object',
      properties: {
        connected: { type: 'boolean' },
        scopes: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async getStatus(@CurrentUser() user: User) {
    return this.oauthService.getStatus(user.id);
  }

  @Post('disconnect')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Disconnect Google Calendar integration' })
  @ApiResponse({
    status: 200,
    description: 'Integration disconnected successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
      },
    },
  })
  async disconnect(@CurrentUser() user: User) {
    await this.oauthService.disconnect(user.id);
    return { success: true };
  }

  @Get('events')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'List Google Calendar events' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of calendar events',
    type: [Object] as any,
  })
  async listEvents(
    @CurrentUser() user: User,
    @Query() query: ListEventsDto,
  ): Promise<CalendarEvent[]> {
    const { timeMin, timeMax, maxResults } = query;

    if (!timeMin || !timeMax) {
      throw new BadRequestException('timeMin and timeMax are required');
    }

    const timeMinDate = new Date(timeMin);
    const timeMaxDate = new Date(timeMax);

    if (isNaN(timeMinDate.getTime()) || isNaN(timeMaxDate.getTime())) {
      throw new BadRequestException(
        'Invalid date format for timeMin or timeMax',
      );
    }

    if (timeMinDate >= timeMaxDate) {
      throw new BadRequestException('timeMin must be before timeMax');
    }

    return this.calendarService.listEvents(
      user.id,
      timeMinDate,
      timeMaxDate,
      maxResults,
    );
  }
}
