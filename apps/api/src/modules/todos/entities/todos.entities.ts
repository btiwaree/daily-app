import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { LinkType } from '../enums/todos.enum';

@Entity('todos')
export class Todo {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Todo title', example: 'Complete project' })
  @Column()
  title: string;

  @ApiProperty({
    description: 'Todo description',
    example: 'Finish the API documentation',
  })
  @Column()
  description: string;

  @ApiProperty({ description: 'Completion status', example: false })
  @Column()
  completed: boolean;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Deletion date',
    nullable: true,
    required: false,
  })
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;

  @ApiProperty({ description: 'Due date', example: '2024-12-31T23:59:59.000Z' })
  @Column({ name: 'due_date', type: 'timestamptz' })
  dueDate: Date;

  @ApiProperty({ description: 'Link URL', example: 'https://example.com' })
  @Column({ name: 'link_url' })
  linkUrl: string;

  @ApiProperty({
    description: 'Link type',
    enum: LinkType,
    example: LinkType.UNKNOWN,
  })
  @Column({
    type: 'enum',
    enum: LinkType,
    default: LinkType.UNKNOWN,
  })
  linkType: LinkType;

  @ApiProperty({ description: 'User ID', example: 'user_123' })
  @Column({ name: 'user_id' })
  userId: string;
}
