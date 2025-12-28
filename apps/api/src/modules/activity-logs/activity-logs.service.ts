import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogsRepository: Repository<ActivityLog>,
  ) {}

  async createLog(createLogDto: CreateActivityLogDto): Promise<ActivityLog> {
    const log = this.activityLogsRepository.create(createLogDto);
    return this.activityLogsRepository.save(log);
  }

  async getLogsByUserAndDate(
    userId: string,
    date: Date,
  ): Promise<ActivityLog[]> {
    const dateStr = date.toISOString().split('T')[0];

    return this.activityLogsRepository.find({
      where: {
        userId,
        createdAt: Raw((alias) => `DATE(${alias}) = DATE(:date)`, {
          date: dateStr,
        }),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}

