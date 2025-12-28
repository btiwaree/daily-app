import { CurrentUser } from '@/decorators/current-user.decorator';
import { User } from '@clerk/backend';
import {
  Controller,
  Get,
  Post,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { CheckInOutService } from './check-in-out.service';
import { CheckStatusDto } from './dto/check-status.dto';
import { CheckInResponseDto } from './dto/check-in.dto';
import { CheckOutResponseDto } from './dto/check-out.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Todo } from '../todos/entities/todos.entities';

@Controller('check-in-out')
export class CheckInOutController {
  constructor(private readonly checkInOutService: CheckInOutService) {}

  @Post('check-in')
  @ApiOperation({ summary: 'Check in for the day' })
  @ApiResponse({
    status: 201,
    description: 'Check-in successful, returns incomplete todos from yesterday',
    type: CheckInResponseDto,
  })
  @UseGuards(ClerkAuthGuard)
  async checkIn(@CurrentUser() user: User): Promise<CheckInResponseDto> {
    return this.checkInOutService.checkIn(user.id);
  }

  @Post('check-out')
  @ApiOperation({ summary: 'Check out for the day' })
  @ApiResponse({
    status: 200,
    description: 'Check-out successful, returns incomplete todos from today',
    type: CheckOutResponseDto,
  })
  @UseGuards(ClerkAuthGuard)
  async checkOut(@CurrentUser() user: User): Promise<CheckOutResponseDto> {
    return this.checkInOutService.checkOut(user.id);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get check-in/check-out status for a date' })
  @ApiResponse({
    status: 200,
    description: 'Returns check-in/check-out status',
    type: CheckStatusDto,
  })
  @UseGuards(ClerkAuthGuard)
  async getStatus(
    @CurrentUser() user: User,
    @Query('date') dateString: string,
  ): Promise<CheckStatusDto> {
    if (!dateString) {
      throw new BadRequestException('Date is required');
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.checkInOutService.getCheckInStatus(user.id, date);
  }

  @Get('incomplete-yesterday')
  @ApiOperation({
    summary: 'Get incomplete todos from yesterday (for check-in flow)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns incomplete todos from yesterday',
    type: [Todo],
  })
  @UseGuards(ClerkAuthGuard)
  async getIncompleteYesterday(@CurrentUser() user: User): Promise<Todo[]> {
    return this.checkInOutService.getIncompleteTodosFromYesterday(user.id);
  }

  @Get('incomplete-today')
  @ApiOperation({
    summary: 'Get incomplete todos from today (for check-out flow)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns incomplete todos from today',
    type: [Todo],
  })
  @UseGuards(ClerkAuthGuard)
  async getIncompleteToday(@CurrentUser() user: User): Promise<Todo[]> {
    return this.checkInOutService.getIncompleteTodosFromToday(user.id);
  }
}
