import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { CheckInOut } from './entities/check-in-out.entity';
import { Todo } from '../todos/entities/todos.entities';
import { CheckStatusDto } from './dto/check-status.dto';
import { CheckInResponseDto } from './dto/check-in.dto';
import { CheckOutResponseDto } from './dto/check-out.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActionType } from '../activity-logs/enums/action-type.enum';
import { EntityType } from '../activity-logs/enums/entity-type.enum';

@Injectable()
export class CheckInOutService {
  constructor(
    @InjectRepository(CheckInOut)
    private checkInOutRepository: Repository<CheckInOut>,
    @InjectRepository(Todo)
    private todosRepository: Repository<Todo>,
    private activityLogsService: ActivityLogsService,
  ) {}

  async checkIn(userId: string): Promise<CheckInResponseDto> {
    // Get today's date in UTC
    const now = new Date();
    const todayUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const todayStr = todayUTC.toISOString().split('T')[0];

    // Check if already checked in today
    const existingCheckIn = await this.checkInOutRepository.findOne({
      where: {
        userId,
        date: Raw((alias) => `DATE(${alias}) = DATE(:date)`, {
          date: todayStr,
        }),
      },
    });

    if (existingCheckIn) {
      throw new BadRequestException('Already checked in today');
    }

    // Check if checked out yesterday (in UTC)
    const yesterdayUTC = new Date(todayUTC);
    yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);
    const yesterdayStr = yesterdayUTC.toISOString().split('T')[0];

    const yesterdayCheckOut = await this.checkInOutRepository.findOne({
      where: {
        userId,
        date: Raw((alias) => `DATE(${alias}) = DATE(:date)`, {
          date: yesterdayStr,
        }),
      },
    });

    if (yesterdayCheckOut && !yesterdayCheckOut.checkOutTime) {
      throw new BadRequestException(
        'Must complete check-out from previous day before checking in',
      );
    }

    // Get incomplete todos from yesterday
    const incompleteTodos = await this.getIncompleteTodosFromYesterday(userId);

    // Create check-in record
    const checkInOut = this.checkInOutRepository.create({
      userId,
      date: todayUTC,
      checkInTime: new Date(),
      checkOutTime: null,
    });

    const savedCheckInOut = await this.checkInOutRepository.save(checkInOut);

    // Log check-in action
    await this.activityLogsService.createLog({
      userId: savedCheckInOut.userId,
      actionType: ActionType.CHECK_IN,
      entityType: EntityType.CHECK_IN_OUT,
      entityId: savedCheckInOut.id,
      entityTitle: 'Check-in',
    });

    return {
      checkInOut: {
        id: savedCheckInOut.id,
        userId: savedCheckInOut.userId,
        date: savedCheckInOut.date,
        checkInTime: savedCheckInOut.checkInTime,
        checkOutTime: savedCheckInOut.checkOutTime,
      },
      incompleteTodos,
    };
  }

  async checkOut(userId: string): Promise<CheckOutResponseDto> {
    // Get today's date in UTC
    const now = new Date();
    const todayUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const todayStr = todayUTC.toISOString().split('T')[0];

    // Find today's check-in record
    const checkInOut = await this.checkInOutRepository.findOne({
      where: {
        userId,
        date: Raw((alias) => `DATE(${alias}) = DATE(:date)`, {
          date: todayStr,
        }),
      },
    });

    if (!checkInOut) {
      throw new NotFoundException('Must check in before checking out');
    }

    if (checkInOut.checkOutTime) {
      throw new BadRequestException('Already checked out today');
    }

    // Get incomplete todos from today
    const incompleteTodos = await this.getIncompleteTodosFromToday(userId);

    // Update check-out time
    checkInOut.checkOutTime = new Date();
    const updatedCheckInOut = await this.checkInOutRepository.save(checkInOut);

    // Log check-out action
    await this.activityLogsService.createLog({
      userId: updatedCheckInOut.userId,
      actionType: ActionType.CHECK_OUT,
      entityType: EntityType.CHECK_IN_OUT,
      entityId: updatedCheckInOut.id,
      entityTitle: 'Check-out',
    });

    return {
      checkInOut: {
        id: updatedCheckInOut.id,
        userId: updatedCheckInOut.userId,
        date: updatedCheckInOut.date,
        checkInTime: updatedCheckInOut.checkInTime,
        checkOutTime: updatedCheckInOut.checkOutTime,
      },
      incompleteTodos,
    };
  }

  async getCheckInStatus(userId: string, date: Date): Promise<CheckStatusDto> {
    const dateStr = date.toISOString().split('T')[0];

    const checkInOut = await this.checkInOutRepository.findOne({
      where: {
        userId,
        date: Raw((alias) => `DATE(${alias}) = DATE(:date)`, {
          date: dateStr,
        }),
      },
    });

    if (!checkInOut) {
      return {
        hasCheckedIn: false,
        hasCheckedOut: false,
        checkInTime: null,
        checkOutTime: null,
      };
    }

    return {
      hasCheckedIn: true,
      hasCheckedOut: !!checkInOut.checkOutTime,
      checkInTime: checkInOut.checkInTime,
      checkOutTime: checkInOut.checkOutTime,
    };
  }

  async hasCheckedInToday(userId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const status = await this.getCheckInStatus(userId, today);
    return status.hasCheckedIn;
  }

  async hasCheckedOutToday(userId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const status = await this.getCheckInStatus(userId, today);
    return status.hasCheckedOut;
  }

  async getIncompleteTodosFromYesterday(userId: string): Promise<Todo[]> {
    // Get today's date in UTC
    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );

    // Calculate yesterday in UTC
    const yesterdayUTC = new Date(todayUTC);
    yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);
    const yesterdayStr = yesterdayUTC.toISOString().split('T')[0];

    return this.todosRepository.find({
      where: {
        userId,
        completed: false,
        dueDate: Raw((alias) => `DATE(${alias}) = DATE(:date)`, {
          date: yesterdayStr,
        }),
      },
    });
  }

  async getIncompleteTodosFromToday(userId: string): Promise<Todo[]> {
    // Get today's date in UTC
    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
    const todayStr = todayUTC.toISOString().split('T')[0];

    return this.todosRepository.find({
      where: {
        userId,
        completed: false,
        dueDate: Raw((alias) => `DATE(${alias}) = DATE(:date)`, {
          date: todayStr,
        }),
      },
    });
  }
}
