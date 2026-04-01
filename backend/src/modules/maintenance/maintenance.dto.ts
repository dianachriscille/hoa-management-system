import { IsString, IsEnum, MinLength, MaxLength, IsArray, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MaintenanceCategory, MaintenanceStatus } from './entities/maintenance.entities';

export class CreateMaintenanceRequestDto {
  @ApiProperty({ enum: MaintenanceCategory }) @IsEnum(MaintenanceCategory) category: MaintenanceCategory;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(1000) description: string;
  @ApiProperty() @IsString() @MaxLength(200) location: string;
  @ApiProperty({ required: false, type: [String] }) @IsOptional() @IsArray() photoKeys?: string[];
}

export class AssignRequestDto {
  @ApiProperty() @IsUUID() assigneeUserId: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() note?: string;
}

export class UpdateStatusDto {
  @ApiProperty({ enum: MaintenanceStatus }) @IsEnum(MaintenanceStatus) status: MaintenanceStatus;
  @ApiProperty({ required: false }) @IsOptional() @IsString() note?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isInternal?: boolean;
}

export class AddNoteDto {
  @ApiProperty() @IsString() @MinLength(1) content: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isInternal?: boolean;
}
