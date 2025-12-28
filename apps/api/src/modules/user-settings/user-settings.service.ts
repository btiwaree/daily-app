import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSettings } from './entities/user-settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActionType } from '../activity-logs/enums/action-type.enum';
import { EntityType } from '../activity-logs/enums/entity-type.enum';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private userSettingsRepository: Repository<UserSettings>,
    private activityLogsService: ActivityLogsService,
  ) {}

  async getSettings(userId: string): Promise<UserSettings> {
    let settings = await this.userSettingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      // Create default settings
      settings = this.userSettingsRepository.create({
        userId,
        preferredCheckInTime: '09:00',
        preferredCheckOutTime: '17:00',
      });
      settings = await this.userSettingsRepository.save(settings);
    }

    return settings;
  }

  async updateSettings(
    userId: string,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<UserSettings> {
    let settings = await this.userSettingsRepository.findOne({
      where: { userId },
    });

    const previousCheckInTime = settings?.preferredCheckInTime;
    const previousCheckOutTime = settings?.preferredCheckOutTime;

    if (!settings) {
      settings = this.userSettingsRepository.create({
        userId,
        preferredCheckInTime: updateSettingsDto.preferredCheckInTime || '09:00',
        preferredCheckOutTime:
          updateSettingsDto.preferredCheckOutTime || '17:00',
      });
    } else {
      if (updateSettingsDto.preferredCheckInTime !== undefined) {
        settings.preferredCheckInTime = updateSettingsDto.preferredCheckInTime;
      }
      if (updateSettingsDto.preferredCheckOutTime !== undefined) {
        settings.preferredCheckOutTime =
          updateSettingsDto.preferredCheckOutTime;
      }
    }

    const savedSettings = await this.userSettingsRepository.save(settings);

    // Log settings update if any changes were made
    const hasChanges =
      (updateSettingsDto.preferredCheckInTime !== undefined &&
        previousCheckInTime !== savedSettings.preferredCheckInTime) ||
      (updateSettingsDto.preferredCheckOutTime !== undefined &&
        previousCheckOutTime !== savedSettings.preferredCheckOutTime);

    if (hasChanges) {
      await this.activityLogsService.createLog({
        userId: savedSettings.userId,
        actionType: ActionType.UPDATE_SETTINGS,
        entityType: EntityType.USER_SETTINGS,
        entityId: savedSettings.id,
        entityTitle: 'User Settings',
        metadata: {
          previousCheckInTime: previousCheckInTime,
          newCheckInTime: savedSettings.preferredCheckInTime,
          previousCheckOutTime: previousCheckOutTime,
          newCheckOutTime: savedSettings.preferredCheckOutTime,
        },
      });
    }

    return savedSettings;
  }
}

