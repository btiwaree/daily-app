import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ActionType } from '../enums/action-type.enum';
import { EntityType } from '../enums/entity-type.enum';

export class CreateActivityLogDto {
  @ApiProperty({
    description: 'User ID',
    example: 'user_123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Action type',
    enum: ActionType,
    example: ActionType.CREATE,
  })
  @IsEnum(ActionType)
  @IsNotEmpty()
  actionType: ActionType;

  @ApiProperty({
    description: 'Entity type',
    enum: EntityType,
    example: EntityType.TODO,
  })
  @IsEnum(EntityType)
  @IsNotEmpty()
  entityType: EntityType;

  @ApiProperty({
    description: 'Entity ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  entityId?: string;

  @ApiProperty({
    description: 'Entity title',
    example: 'Complete project',
    required: false,
  })
  @IsString()
  @IsOptional()
  entityTitle?: string;

  @ApiProperty({
    description: 'Additional metadata',
    example: { completed: true, previousValue: false },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
