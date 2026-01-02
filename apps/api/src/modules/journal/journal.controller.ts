import { CurrentUser } from '@/decorators/current-user.decorator';
import { User } from '@clerk/backend';
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { JournalService } from './journal.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { Journal } from './entities/journal.entity';

@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  @ApiOperation({ summary: 'Create a journal entry' })
  @ApiResponse({
    status: 201,
    description: 'Journal entry created successfully',
    type: Journal,
  })
  @UseGuards(ClerkAuthGuard)
  async create(
    @CurrentUser() user: User,
    @Body() createJournalDto: CreateJournalDto,
  ): Promise<Journal> {
    return this.journalService.create(user.id, createJournalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get journal entries for a given date' })
  @ApiResponse({
    status: 200,
    description: 'Returns journal entries for a given date',
    type: [Journal],
  })
  @UseGuards(ClerkAuthGuard)
  async findAll(
    @CurrentUser() user: User,
    @Query('date') dateString: string,
  ): Promise<Journal[]> {
    const userId = user.id;

    if (!dateString) {
      throw new BadRequestException('Date is required');
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.journalService.findByUserAndDate(userId, date);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a journal entry' })
  @ApiResponse({
    status: 200,
    description: 'Journal entry deleted successfully',
  })
  @UseGuards(ClerkAuthGuard)
  async delete(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.journalService.delete(id, user.id);
    return { message: 'Journal entry deleted successfully' };
  }
}
