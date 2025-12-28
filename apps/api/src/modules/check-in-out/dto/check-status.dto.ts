import { ApiProperty } from '@nestjs/swagger';

export class CheckStatusDto {
  @ApiProperty({
    description: 'Whether user has checked in',
    example: true,
  })
  hasCheckedIn: boolean;

  @ApiProperty({
    description: 'Whether user has checked out',
    example: false,
  })
  hasCheckedOut: boolean;

  @ApiProperty({
    description: 'Check-in timestamp',
    example: '2024-01-01T08:00:00.000Z',
    nullable: true,
    required: false,
  })
  checkInTime: Date | null;

  @ApiProperty({
    description: 'Check-out timestamp',
    example: '2024-01-01T20:00:00.000Z',
    nullable: true,
    required: false,
  })
  checkOutTime: Date | null;
}
