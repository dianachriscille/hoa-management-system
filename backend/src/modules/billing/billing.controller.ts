import { Controller, Get, Post, Body, Param, Query, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { GenerateInvoicesDto, ManualPaymentDto } from './billing.dto';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/auth.dto';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get('invoices/me')
  @ApiOperation({ summary: 'Get my invoices (Resident)' })
  getMyInvoices(@Req() req: any) {
    return this.billingService.getMyInvoices(req.user.userId);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice detail' })
  getInvoice(@Param('id') id: string, @Req() req: any) {
    return this.billingService.getInvoice(id, req.user.userId, req.user.role);
  }

  @Post('invoices/:id/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate GCash/Maya payment' })
  initiatePayment(@Param('id') id: string, @Req() req: any) {
    return this.billingService.initiateMayaPayment(id, req.user.userId);
  }

  @Post('invoices/:id/manual-payment')
  @Roles(Role.PropertyManager)
  @ApiOperation({ summary: 'Record manual payment (PM only)' })
  recordManualPayment(@Param('id') id: string, @Body() dto: ManualPaymentDto, @Req() req: any) {
    return this.billingService.recordManualPayment(id, dto, req.user.userId);
  }

  @Post('invoices/generate')
  @Roles(Role.PropertyManager)
  @ApiOperation({ summary: 'Generate invoices for a billing period (PM only)' })
  generateInvoices(@Body() dto: GenerateInvoicesDto, @Req() req: any) {
    return this.billingService.generateInvoices(dto.billingPeriod, req.user.userId);
  }

  @Get('dashboard')
  @Roles(Role.PropertyManager, Role.BoardMember)
  @ApiOperation({ summary: 'Get billing dashboard (PM + Board)' })
  getDashboard(@Query('period') period: string, @Req() req: any) {
    return this.billingService.getDashboard(period, req.user.role);
  }

  @Public()
  @Post('webhooks/maya')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Maya payment webhook (public)' })
  mayaWebhook(@Body() payload: any) {
    return this.billingService.handleMayaWebhook(payload);
  }
}
