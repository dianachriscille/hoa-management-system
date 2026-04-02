import { IsString, IsNumber, IsPositive, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

export class SubmitGcashPaymentDto {
  @ApiProperty() @IsString() gcashReferenceNumber: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}
