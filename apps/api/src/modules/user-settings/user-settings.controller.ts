import { CurrentUser } from '@/decorators/current-user.decorator';
import { User } from '@clerk/backend';
import { Controller, Get, Patch, UseGuards, Body } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { UserSettingsService } from './user-settings.service';
import { UserSettings } from './entities/user-settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user settings' })
  @ApiResponse({
    status: 200,
    description: 'Returns user settings',
    type: UserSettings,
  })
  @UseGuards(ClerkAuthGuard)
  async getSettings(@CurrentUser() user: User): Promise<UserSettings> {
    return this.userSettingsService.getSettings(user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update user settings' })
  @ApiResponse({
    status: 200,
    description: 'Settings updated successfully',
    type: UserSettings,
  })
  @UseGuards(ClerkAuthGuard)
  async updateSettings(
    @CurrentUser() user: User,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ): Promise<UserSettings> {
    return this.userSettingsService.updateSettings(user.id, updateSettingsDto);
  }
}

