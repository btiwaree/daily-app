import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('check_in_out')
export class CheckInOut {
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
    description: 'Date of check-in/out',
    example: '2024-01-01',
  })
  @Column({ type: 'date' })
  date: Date;

  @ApiProperty({
    description: 'Check-in timestamp',
    example: '2024-01-01T08:00:00.000Z',
  })
  @Column({ name: 'check_in_time', type: 'timestamptz' })
  checkInTime: Date;

  @ApiProperty({
    description: 'Check-out timestamp',
    example: '2024-01-01T20:00:00.000Z',
    nullable: true,
    required: false,
  })
  @Column({ name: 'check_out_time', type: 'timestamptz', nullable: true })
  checkOutTime: Date | null;

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
}
