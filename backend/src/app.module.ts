import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { appConfig } from './config/app.config';
import { AuthModule } from './modules/auth/auth.module';
import { ResidentModule } from './modules/resident/resident.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FileModule } from './modules/file/file.module';
import { BillingModule } from './modules/billing/billing.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { AmenityModule } from './modules/amenity/amenity.module';
import { DocumentModule } from './modules/document/document.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { SecurityModule } from './modules/security/security.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
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
        url: process.env.DATABASE_URL || undefined,
        host: process.env.DATABASE_URL ? undefined : config.get('app.dbHost'),
        port: process.env.DATABASE_URL ? undefined : config.get('app.dbPort'),
        username: process.env.DATABASE_URL ? undefined : config.get('app.dbUsername'),
        password: process.env.DATABASE_URL ? undefined : config.get('app.dbPassword'),
        database: process.env.DATABASE_URL ? undefined : config.get('app.dbName'),
        entities: [__dirname + '/**/*.entity{.ts,.js}', __dirname + '/**/entities/*.entities{.ts,.js}'],
        migrations: ['dist/database/migrations/*.js'],
        migrationsRun: false,
        synchronize: true,
        ssl: { rejectUnauthorized: false },
        extra: process.env.DATABASE_URL ? { ssl: { rejectUnauthorized: false } } : {},
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get('app.redisUrl');
        const isTls = url?.startsWith('rediss://');
        return {
          connection: {
            url,
            tls: isTls ? { rejectUnauthorized: false } : undefined,
            family: 0,
            maxRetriesPerRequest: null,
          },
        };
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    ResidentModule,
    NotificationModule,
    FileModule,
    BillingModule,
    MaintenanceModule,
    AmenityModule,
    DocumentModule,
    CommunicationModule,
    SecurityModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
