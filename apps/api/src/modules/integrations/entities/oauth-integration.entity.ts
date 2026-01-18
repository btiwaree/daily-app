import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IntegrationProvider } from '../enums/integration-provider.enum';

@Entity('oauth_integrations')
@Unique(['userId', 'provider'])
@Index(['userId'])
export class OAuthIntegration {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID', example: 'user_123' })
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({
    description: 'Integration provider',
    enum: IntegrationProvider,
    example: IntegrationProvider.GOOGLE_CALENDAR,
  })
  @Column({
    type: 'enum',
    enum: IntegrationProvider,
  })
  provider: IntegrationProvider;

  @ApiProperty({
    description: 'Encrypted refresh token',
    nullable: true,
    required: false,
  })
  @Column({ name: 'refresh_token_encrypted', type: 'text', nullable: true })
  refreshTokenEncrypted: string | null;

  @ApiProperty({
    description: 'OAuth scopes granted',
    example: ['calendar.events.readonly'],
  })
  @Column({ type: 'jsonb', default: [] })
  scopes: string[];

  @ApiProperty({
    description: 'Connection date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'connected_at', type: 'timestamptz' })
  connectedAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
