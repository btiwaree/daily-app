import { ApiProperty } from '@nestjs/swagger';
import { Todo } from '../../todos/entities/todos.entities';

export class CheckOutResponseDto {
  @ApiProperty({
    description: 'Check-out record',
  })
  checkInOut: {
    id: string;
    userId: string;
    date: Date;
    checkInTime: Date;
    checkOutTime: Date;
  };

  @ApiProperty({
    description: 'Incomplete todos from today',
    type: [Todo],
  })
  incompleteTodos: Todo[];
}

