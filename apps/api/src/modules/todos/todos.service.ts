import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todos.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todos.entities';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private todosRepository: Repository<Todo>,
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
    const dueDate = new Date(createTodoDto.dueDate);
    // set hour to 23:59:59
    dueDate.setHours(23, 59, 59, 999);
    createTodoDto.dueDate = dueDate;

    const todo = this.todosRepository.create(createTodoDto);
    return this.todosRepository.save(todo);
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

    if (updateTodoDto.completed !== undefined) {
      todo.completed = updateTodoDto.completed;
    }

    if (updateTodoDto.dueDate !== undefined) {
      const dueDate = new Date(updateTodoDto.dueDate);
      // set hour to 23:59:59
      dueDate.setHours(23, 59, 59, 999);
      todo.dueDate = dueDate;
    }

    return this.todosRepository.save(todo);
  }
}
