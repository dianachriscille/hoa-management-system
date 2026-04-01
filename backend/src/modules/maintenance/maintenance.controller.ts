import { Controller, Get, Post, Patch, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceRequestDto, AssignRequestDto, UpdateStatusDto, AddNoteDto } from './maintenance.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/auth.dto';

@ApiTags('maintenance')
@ApiBearerAuth()
@Controller('maintenance')
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Post('requests')
  @ApiOperation({ summary: 'Submit maintenance request (Resident)' })
  create(@Body() dto: CreateMaintenanceRequestDto, @Req() req: any) {
    return this.maintenanceService.createRequest(req.user.userId, req.user.residentProfileId, dto);
  }

  @Get('requests/me')
  @ApiOperation({ summary: 'Get my maintenance requests (Resident)' })
  getMyRequests(@Req() req: any) {
    return this.maintenanceService.getMyRequests(req.user.userId);
  }

  @Get('requests')
  @Roles(Role.PropertyManager, Role.BoardMember)
  @ApiOperation({ summary: 'Get all maintenance requests (PM + Board)' })
  getAllRequests(@Query('status') status: any, @Query('category') category: any) {
    return this.maintenanceService.getAllRequests({ status, category });
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get request detail' })
  getRequest(@Param('id') id: string, @Req() req: any) {
    return this.maintenanceService.getRequest(id, req.user.userId, req.user.role);
  }

  @Patch('requests/:id/assign')
  @Roles(Role.PropertyManager)
  @ApiOperation({ summary: 'Assign request to staff (PM only)' })
  assignRequest(@Param('id') id: string, @Body() dto: AssignRequestDto, @Req() req: any) {
    return this.maintenanceService.assignRequest(id, dto, req.user.userId);
  }

  @Patch('requests/:id/status')
  @ApiOperation({ summary: 'Update request status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto, @Req() req: any) {
    return this.maintenanceService.updateStatus(id, dto, req.user.userId, req.user.role);
  }

  @Post('requests/:id/confirm')
  @ApiOperation({ summary: 'Resident confirms resolution' })
  confirmResolution(@Param('id') id: string, @Req() req: any) {
    return this.maintenanceService.confirmResolution(id, req.user.userId);
  }

  @Post('requests/:id/reopen')
  @ApiOperation({ summary: 'Resident reopens resolved request (within 7 days)' })
  reopenRequest(@Param('id') id: string, @Req() req: any) {
    return this.maintenanceService.reopenRequest(id, req.user.userId);
  }

  @Post('requests/:id/notes')
  @ApiOperation({ summary: 'Add note to request' })
  addNote(@Param('id') id: string, @Body() dto: AddNoteDto, @Req() req: any) {
    return this.maintenanceService.addNote(id, dto, req.user.userId);
  }

  @Get('analytics')
  @Roles(Role.PropertyManager, Role.BoardMember)
  @ApiOperation({ summary: 'Get maintenance analytics (PM + Board)' })
  getAnalytics(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.maintenanceService.getAnalytics(startDate, endDate);
  }
}
