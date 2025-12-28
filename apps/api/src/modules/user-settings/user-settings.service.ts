import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSettings } from './entities/user-settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private userSettingsRepository: Repository<UserSettings>,
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

    return this.userSettingsRepository.save(settings);
  }
}

