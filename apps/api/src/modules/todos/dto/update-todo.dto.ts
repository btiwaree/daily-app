import {
  IsBoolean,
  IsOptional,
  IsString,
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
    description: 'Due date (YYYY-MM-DD or ISO string)',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsString()
  dueDate?: string | Date;
}

