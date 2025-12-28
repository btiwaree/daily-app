import { Module } from '@nestjs/common';
import { TodosController } from './todos.controller';
import { Todo } from './entities/todos.entities';
import { TodosService } from './todos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo]),
    ActivityLogsModule,
  ],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}
