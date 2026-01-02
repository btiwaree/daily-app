import { CurrentUser } from '@/decorators/current-user.decorator';
import { User } from '@clerk/backend';
import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLog } from './entities/activity-log.entity';

@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get activity logs for a given date' })
  @ApiResponse({
    status: 200,
    description: 'Returns activity logs for a given date',
    type: [ActivityLog],
  })
  @UseGuards(ClerkAuthGuard)
  async getLogs(
    @CurrentUser() user: User,
    @Query('date') dateString: string,
  ): Promise<ActivityLog[]> {
    const userId = user.id;

    if (!dateString) {
      throw new BadRequestException('Date is required');
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.activityLogsService.getLogsByUserAndDate(userId, date);
  }
}
