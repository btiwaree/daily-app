import { Module } from '@nestjs/common';
import { TodosController } from './todos.controller';
import { Todo } from './entities/todos.entities';
import { TodosService } from './todos.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Todo])],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}
