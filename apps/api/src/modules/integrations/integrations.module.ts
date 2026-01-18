import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthIntegration } from './entities/oauth-integration.entity';
import { GoogleCalendarOAuthService } from './services/google-calendar-oauth.service';
import { GoogleCalendarService } from './services/google-calendar.service';
import { GoogleCalendarController } from './controllers/google-calendar.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OAuthIntegration])],
  controllers: [GoogleCalendarController],
  providers: [GoogleCalendarOAuthService, GoogleCalendarService],
  exports: [GoogleCalendarOAuthService, GoogleCalendarService],
})
export class IntegrationsModule {}
