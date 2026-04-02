import { Controller, Get, Post, Body, Param, Query, Req, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { GenerateInvoicesDto, ManualPaymentDto, SubmitGcashPaymentDto } from './billing.dto';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/auth.dto';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get('gcash-info')
  @ApiOperation({ summary: 'Get GCash QR code and account info' })
  getGcashInfo() {
    return this.billingService.getGcashInfo();
  }

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

  @Post('invoices/:id/gcash-payment')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('screenshot'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Submit GCash payment with screenshot' })
  submitGcashPayment(@Param('id') id: string, @Body() dto: SubmitGcashPaymentDto, @UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) throw new Error('Screenshot is required');
    return this.billingService.submitGcashPayment(id, req.user.userId, dto.gcashReferenceNumber, file, dto.notes);
  }

  @Get('payments/pending')
  @Roles(Role.PropertyManager)
  @ApiOperation({ summary: 'Get pending GCash payments for verification (PM only)' })
  getPendingPayments() {
    return this.billingService.getPendingPayments();
  }

  @Post('payments/:id/verify')
  @Roles(Role.PropertyManager)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve or reject a GCash payment (PM only)' })
  verifyPayment(@Param('id') id: string, @Body('approved') approved: boolean, @Req() req: any) {
    return this.billingService.verifyPayment(id, approved, req.user.userId);
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
}
