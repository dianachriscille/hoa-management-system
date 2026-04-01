import { Controller, Get, Post, Body, Query, Req, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/auth.dto';

@ApiTags('analytics')
@ApiBearerAuth()
@Roles(Role.BoardMember, Role.PropertyManager)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('budget') @ApiOperation({ summary: 'Set monthly budget (PM)' })
  setBudget(@Body() b: { period: string; amount: number }, @Req() req: any) {
    return this.analyticsService.setBudget(b.period, b.amount, req.user.userId);
  }

  @Get('financial') @ApiOperation({ summary: 'Financial dashboard' })
  getFinancial(@Query('period') period: string) {
    return this.analyticsService.getFinancialDashboard(period || new Date().toISOString().slice(0, 7));
  }

  @Get('maintenance') @ApiOperation({ summary: 'Maintenance analytics' })
  getMaintenance(@Query('startDate') start: string, @Query('endDate') end: string) {
    const now = new Date();
    return this.analyticsService.getMaintenanceDashboard(
      start || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
      end || now.toISOString().split('T')[0],
    );
  }

  @Get('engagement') @ApiOperation({ summary: 'Engagement metrics' })
  getEngagement(@Query('startDate') start: string, @Query('endDate') end: string) {
    const now = new Date();
    return this.analyticsService.getEngagementDashboard(
      start || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
      end || now.toISOString().split('T')[0],
    );
  }

  @Get('export') @ApiOperation({ summary: 'Export report as PDF or CSV' })
  exportReport(@Query('type') type: string, @Query('period') period: string, @Query('format') format: string, @Res() res: Response) {
    return this.analyticsService.exportReport(type || 'financial', period || new Date().toISOString().slice(0, 7), format || 'pdf', res);
  }
}
