import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todos.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todos.entities';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActionType } from '../activity-logs/enums/action-type.enum';
import { EntityType } from '../activity-logs/enums/entity-type.enum';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private todosRepository: Repository<Todo>,
    private activityLogsService: ActivityLogsService,
  ) {}

  async findAll(userId: string, date: Date): Promise<Todo[]> {
    const dateStr = date.toISOString().split('T')[0];

    return this.todosRepository.find({
      where: {
        userId,
        dueDate: Raw((alias) => `DATE(${alias}) = DATE(:date)`, {
          date: dateStr,
        }),
      },
    });
  }

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    // Handle both date strings (YYYY-MM-DD) and ISO strings
    let dueDate: Date;
    if (typeof createTodoDto.dueDate === 'string') {
      // If it's a date string like "2025-12-28", parse it and set to end of day in UTC
      const dateStr = createTodoDto.dueDate.split('T')[0]; // Extract date part if ISO string
      const [year, month, day] = dateStr.split('-').map(Number);
      // Create date in UTC at 23:59:59.999
      dueDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    } else {
      dueDate = new Date(createTodoDto.dueDate);
      // set hour to 23:59:59 in UTC
      dueDate.setUTCHours(23, 59, 59, 999);
    }
    createTodoDto.dueDate = dueDate;

    const todo = this.todosRepository.create(createTodoDto);
    const savedTodo = await this.todosRepository.save(todo);

    // Log the creation
    await this.activityLogsService.createLog({
      userId: savedTodo.userId,
      actionType: ActionType.CREATE,
      entityType: EntityType.TODO,
      entityId: savedTodo.id,
      entityTitle: savedTodo.title,
    });

    return savedTodo;
  }

  async update(
    id: string,
    userId: string,
    updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    const todo = await this.todosRepository.findOne({
      where: { id, userId },
    });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    const previousCompleted = todo.completed;
    const previousDueDate = todo.dueDate;

    if (updateTodoDto.completed !== undefined) {
      todo.completed = updateTodoDto.completed;
    }

    if (updateTodoDto.dueDate !== undefined) {
      // Handle both date strings (YYYY-MM-DD) and ISO strings
      let dueDate: Date;
      if (typeof updateTodoDto.dueDate === 'string') {
        // If it's a date string like "2025-12-28", parse it and set to end of day in UTC
        const dateStr = updateTodoDto.dueDate.split('T')[0]; // Extract date part if ISO string
        const [year, month, day] = dateStr.split('-').map(Number);
        // Create date in UTC at 23:59:59.999
        dueDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
      } else {
        dueDate = new Date(updateTodoDto.dueDate);
        // set hour to 23:59:59 in UTC
        dueDate.setUTCHours(23, 59, 59, 999);
      }
      todo.dueDate = dueDate;
    }

    const savedTodo = await this.todosRepository.save(todo);

    // Log completion status change
    if (
      updateTodoDto.completed !== undefined &&
      previousCompleted !== savedTodo.completed
    ) {
      await this.activityLogsService.createLog({
        userId: savedTodo.userId,
        actionType: ActionType.UPDATE_COMPLETED,
        entityType: EntityType.TODO,
        entityId: savedTodo.id,
        entityTitle: savedTodo.title,
        metadata: {
          previousValue: previousCompleted,
          newValue: savedTodo.completed,
        },
      });
    }

    // Log due date change
    if (
      updateTodoDto.dueDate !== undefined &&
      previousDueDate.getTime() !== savedTodo.dueDate.getTime()
    ) {
      await this.activityLogsService.createLog({
        userId: savedTodo.userId,
        actionType: ActionType.UPDATE_DUE_DATE,
        entityType: EntityType.TODO,
        entityId: savedTodo.id,
        entityTitle: savedTodo.title,
        metadata: {
          previousValue: previousDueDate.toISOString(),
          newValue: savedTodo.dueDate.toISOString(),
        },
      });
    }

    return savedTodo;
  }
}
