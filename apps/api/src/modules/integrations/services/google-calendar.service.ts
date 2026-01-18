import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { google } from 'googleapis';
import { GoogleCalendarOAuthService } from './google-calendar-oauth.service';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  htmlLink?: string;
  meetLink?: string;
}

@Injectable()
export class GoogleCalendarService {
  constructor(private readonly oauthService: GoogleCalendarOAuthService) {}

  /**
   * Lists calendar events for a user within a time range
   */
  async listEvents(
    userId: string,
    timeMin: Date,
    timeMax: Date,
    maxResults: number = 50,
  ): Promise<CalendarEvent[]> {
    // Get authenticated OAuth2Client for the user
    const oauth2Client = await this.oauthService.getClientForUser(userId);

    // Create calendar API client
    const calendarClient = google.calendar({
      version: 'v3',
      auth: oauth2Client,
    });

    try {
      // Fetch events from primary calendar
      const response = await calendarClient.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      // Normalize events to our interface
      const events: CalendarEvent[] = (response.data.items || []).map(
        (event) => {
          // Extract Google Meet link from conferenceData
          let meetLink: string | undefined;
          if (event.conferenceData?.entryPoints) {
            const videoEntryPoint = event.conferenceData.entryPoints.find(
              (entry) => entry.entryPointType === 'video',
            );
            if (videoEntryPoint?.uri) {
              meetLink = videoEntryPoint.uri;
            }
          }
          // Fallback to hangoutLink if available (deprecated but still used)
          if (!meetLink && event.hangoutLink) {
            meetLink = event.hangoutLink;
          }

          return {
            id: event.id || '',
            summary: event.summary || 'No title',
            description: event.description || undefined,
            start: {
              dateTime: event.start?.dateTime || undefined,
              date: event.start?.date || undefined,
              timeZone: event.start?.timeZone || undefined,
            },
            end: {
              dateTime: event.end?.dateTime || undefined,
              date: event.end?.date || undefined,
              timeZone: event.end?.timeZone || undefined,
            },
            location: event.location || undefined,
            htmlLink: event.htmlLink || undefined,
            meetLink,
          };
        },
      );

      return events;
    } catch (error: any) {
      // Handle Google API errors
      if (error.code === 401 || error.code === 403) {
        throw new UnauthorizedException(
          'Google Calendar access revoked. Please reconnect your account.',
        );
      }

      if (error.code === 400) {
        throw new BadRequestException('Invalid request parameters');
      }

      // Log the error but don't expose internal details
      console.error('Google Calendar API error:', error.message);
      throw new BadRequestException('Failed to fetch calendar events');
    }
  }
}
