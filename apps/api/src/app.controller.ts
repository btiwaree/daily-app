import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from '@/decorators/public.decorator';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { User } from '@clerk/backend';
import { ClerkAuthGuard } from '@/modules/auth/guards/clerk-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/me')
  @UseGuards(ClerkAuthGuard)
  getMe(@CurrentUser() user: User) {
    return user;
  }
}
