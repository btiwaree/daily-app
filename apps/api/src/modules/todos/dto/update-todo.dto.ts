import {
  IsBoolean,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTodoDto {
  @ApiProperty({
    description: 'Completion status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiProperty({
    description: 'Due date',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;
}

