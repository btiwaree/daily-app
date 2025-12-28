import { ApiProperty } from '@nestjs/swagger';
import { Todo } from '../../todos/entities/todos.entities';

export class CheckInResponseDto {
  @ApiProperty({
    description: 'Check-in record',
  })
  checkInOut: {
    id: string;
    userId: string;
    date: Date;
    checkInTime: Date;
    checkOutTime: Date | null;
  };

  @ApiProperty({
    description: 'Incomplete todos from yesterday',
    type: [Todo],
  })
  incompleteTodos: Todo[];
}
