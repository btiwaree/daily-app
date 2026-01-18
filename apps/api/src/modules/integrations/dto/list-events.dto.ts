import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ListEventsDto {
  @ApiProperty({
    description: "Lower bound (exclusive) for an event's start time",
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  timeMin: string;

  @ApiProperty({
    description: "Upper bound (exclusive) for an event's end time",
    example: '2024-01-31T23:59:59Z',
  })
  @IsDateString()
  timeMax: string;

  @ApiProperty({
    description: 'Maximum number of events to return',
    example: 50,
    required: false,
    default: 50,
    minimum: 1,
    maximum: 2500,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2500)
  maxResults?: number = 50;
}
