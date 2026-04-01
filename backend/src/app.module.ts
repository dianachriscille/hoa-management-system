import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { appConfig } from './config/app.config';
import { AuthModule } from './modules/auth/auth.module';
import { ResidentModule } from './modules/resident/resident.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FileModule } from './modules/file/file.module';
import { HealthController } from './health/health.controller';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RolesGuard } from './common/guards/roles.guard';
import { UserEntity } from './modules/auth/entities/user.entity';
import { RefreshTokenEntity } from './modules/auth/entities/refresh-token.entity';
import { ResidentProfileEntity } from './modules/resident/entities/resident-profile.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('app.dbHost'),
        port: config.get('app.dbPort'),
        username: config.get('app.dbUsername'),
        password: config.get('app.dbPassword'),
        database: config.get('app.dbName'),
        entities: [UserEntity, RefreshTokenEntity, ResidentProfileEntity],
        migrations: ['dist/database/migrations/*.js'],
        migrationsRun: true,
        synchronize: false,
        ssl: config.get('app.nodeEnv') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PassportModule,
    TerminusModule,
    AuthModule,
    ResidentModule,
    NotificationModule,
    FileModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
