import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { MonthlyBudgetEntity } from './entities/analytics.entities';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MonthlyBudgetEntity]),
    AuditModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
