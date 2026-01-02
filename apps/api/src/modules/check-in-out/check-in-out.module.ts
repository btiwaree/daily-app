import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckInOut } from './entities/check-in-out.entity';
import { CheckInOutService } from './check-in-out.service';
import { CheckInOutController } from './check-in-out.controller';
import { Todo } from '../todos/entities/todos.entities';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([CheckInOut, Todo]), ActivityLogsModule],
  controllers: [CheckInOutController],
  providers: [CheckInOutService],
  exports: [CheckInOutService],
})
export class CheckInOutModule {}
