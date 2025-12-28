import { CurrentUser } from '@/decorators/current-user.decorator';
import { User } from '@clerk/backend';
import {
  Controller,
  Get,
  Post,
  Patch,
  UseGuards,
  Body,
  Query,
  Param,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { Todo } from './entities/todos.entities';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todos.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  @ApiOperation({ summary: 'Get all todos for a given date' })
  @ApiResponse({
    status: 200,
    description: 'Returns all todos for a given date',
    type: [Todo],
  })
  @UseGuards(ClerkAuthGuard)
  async findAll(
    @CurrentUser() user: User,
    @Query('date') dateString: string,
  ): Promise<Todo[]> {
    const userId = user.id;

    if (!dateString) {
      throw new BadRequestException('Date is required');
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.todosService.findAll(userId, date);
  }

  @Post()
  @ApiOperation({ summary: 'Create a todo' })
  @ApiResponse({ status: 201, description: 'Create a todo', type: Todo })
  @UseGuards(ClerkAuthGuard)
  async create(
    @CurrentUser() user: User,
    @Body() createTodoDto: CreateTodoDto,
  ): Promise<Todo> {
    const userId = user.id;
    return this.todosService.create({ ...createTodoDto, userId });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a todo' })
  @ApiResponse({
    status: 200,
    description: 'Todo updated successfully',
    type: Todo,
  })
  @UseGuards(ClerkAuthGuard)
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    const userId = user.id;
    const todo = await this.todosService.update(id, userId, updateTodoDto);
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    return todo;
  }
}
