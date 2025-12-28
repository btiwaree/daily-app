import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ActionType } from '../enums/action-type.enum';
import { EntityType } from '../enums/entity-type.enum';

@Entity('activity_logs')
export class ActivityLog {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID', example: 'user_123' })
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({
    description: 'Action type',
    enum: ActionType,
    example: ActionType.CREATE,
  })
  @Column({
    type: 'enum',
    enum: ActionType,
    name: 'action_type',
  })
  actionType: ActionType;

  @ApiProperty({
    description: 'Entity type',
    enum: EntityType,
    example: EntityType.TODO,
  })
  @Column({
    type: 'enum',
    enum: EntityType,
    name: 'entity_type',
  })
  entityType: EntityType;

  @ApiProperty({
    description: 'Entity ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
    required: false,
  })
  @Column({ name: 'entity_id', nullable: true })
  entityId: string | null;

  @ApiProperty({
    description: 'Entity title',
    example: 'Complete project',
    nullable: true,
    required: false,
  })
  @Column({ name: 'entity_title', nullable: true })
  entityTitle: string | null;

  @ApiProperty({
    description: 'Additional metadata',
    example: { completed: true, previousValue: false },
    nullable: true,
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

