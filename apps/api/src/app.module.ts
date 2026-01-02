import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from '@/modules/auth/auth.module';
import { LinksModule } from '@/modules/links/links.module';

import { ClerkAuthGuard } from '@/modules/auth/guards/clerk-auth.guard';
import { TodosModule } from '@/modules/todos/todos.module';
import { CheckInOutModule } from '@/modules/check-in-out/check-in-out.module';
import { UserSettingsModule } from '@/modules/user-settings/user-settings.module';
import { ActivityLogsModule } from '@/modules/activity-logs/activity-logs.module';
import { JournalModule } from '@/modules/journal/journal.module';
import { ClerkClientProvider } from '@/providers/clerk-client.provider';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Todo } from './modules/todos/entities/todos.entities';
import { CheckInOut } from './modules/check-in-out/entities/check-in-out.entity';
import { UserSettings } from './modules/user-settings/entities/user-settings.entity';
import { ActivityLog } from './modules/activity-logs/entities/activity-log.entity';
import { Journal } from './modules/journal/entities/journal.entity';
import { UserThrottlerGuard } from './guards/user-throttler.guard';

@Module({
  imports: [
    LinksModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'], // Try .env.local first, fallback to .env
      ignoreEnvFile: false, // Still use process.env even if files don't exist
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute in milliseconds
        limit: 30, // 30 requests per minute
      },
    ]),
    AuthModule,
    TodosModule,
    CheckInOutModule,
    UserSettingsModule,
    ActivityLogsModule,
    JournalModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Todo, CheckInOut, UserSettings, ActivityLog, Journal],
      synchronize: true,
      retryAttempts: 3,
      retryDelay: 3000,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ClerkClientProvider,
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UserThrottlerGuard,
    },
  ],
})
export class AppModule {}
