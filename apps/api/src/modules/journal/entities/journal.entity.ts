import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('journal')
@Index(['userId', 'date'])
export class Journal {
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
    description: 'Journal entry description',
    example: 'Today I learned about TypeScript...',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: 'Date of the journal entry',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Column({ type: 'timestamptz' })
  date: Date;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Deletion date',
    nullable: true,
    required: false,
  })
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date | null;
}
