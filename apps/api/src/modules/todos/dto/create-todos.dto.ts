import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LinkType } from '../enums/todos.enum';

export class CreateTodoDto {
  @ApiProperty({ description: 'Todo title', example: 'Complete project' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Todo description',
    example: 'Finish the API documentation',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Completion status', example: false })
  @IsBoolean()
  completed: boolean;

  @ApiProperty({ description: 'Due date', example: '2024-12-31T23:59:59.000Z' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: Date;

  @ApiProperty({ description: 'Link URL', example: 'https://example.com' })
  @IsString()
  @IsNotEmpty()
  linkUrl: string;

  @ApiProperty({
    description: 'Link type',
    enum: LinkType,
    example: LinkType.UNKNOWN,
  })
  @IsEnum(LinkType)
  @IsNotEmpty()
  linkType: LinkType;

  @ApiProperty({ description: 'User ID', example: 'user_123' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
