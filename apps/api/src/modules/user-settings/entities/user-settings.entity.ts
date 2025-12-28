import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user_settings')
@Unique(['userId'])
export class UserSettings {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID', example: 'user_123' })
  @Column({ name: 'user_id', unique: true })
  userId: string;

  @ApiProperty({
    description: 'Preferred check-in time',
    example: '09:00',
  })
  @Column({ name: 'preferred_check_in_time', default: '09:00' })
  preferredCheckInTime: string;

  @ApiProperty({
    description: 'Preferred check-out time',
    example: '17:00',
  })
  @Column({ name: 'preferred_check_out_time', default: '17:00' })
  preferredCheckOutTime: string;

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
