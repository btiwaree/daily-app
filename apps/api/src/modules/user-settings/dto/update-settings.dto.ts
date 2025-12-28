import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiProperty({
    description: 'Preferred check-in time in HH:mm format',
    example: '08:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'preferredCheckInTime must be in HH:mm format',
  })
  preferredCheckInTime?: string;

  @ApiProperty({
    description: 'Preferred check-out time in HH:mm format',
    example: '20:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'preferredCheckOutTime must be in HH:mm format',
  })
  preferredCheckOutTime?: string;
}

