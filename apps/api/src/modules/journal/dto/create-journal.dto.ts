import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJournalDto {
  @ApiProperty({
    description: 'Journal entry description',
    example: 'Today I learned about TypeScript...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description:
      'Date for the journal entry (YYYY-MM-DD). Defaults to today if not provided',
    example: '2024-01-01',
    required: false,
  })
  @IsString()
  @IsOptional()
  date?: string;
}
