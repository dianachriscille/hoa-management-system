import { IsString, IsNumber, IsPositive, IsOptional, IsEnum, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from './entities/billing.entities';

export class GenerateInvoicesDto {
  @ApiProperty({ example: '2025-07' })
  @IsString() @Matches(/^\d{4}-\d{2}$/) billingPeriod: string;
}

export class ManualPaymentDto {
  @ApiProperty() @IsNumber() @IsPositive() amount: number;
  @ApiProperty({ enum: ['Cash', 'Cheque'] }) @IsString() paymentMethod: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() referenceNumber?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}

export class MayaWebhookDto {
  id: string;
  isPaid: boolean;
  status: string;
  referenceNumber: string;
  receiptNumber: string;
  requestReferenceNumber: string;
  metadata?: Record<string, any>;
}
