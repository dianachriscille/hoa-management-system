import { Controller, Get, Post, Body, Param, Query, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SecurityService } from './security.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/auth.dto';

@ApiTags('security')
@ApiBearerAuth()
@Controller('security')
export class SecurityController {
  constructor(private securityService: SecurityService) {}

  @Post('visitor-passes') @ApiOperation({ summary: 'Create visitor pass (Resident)' })
  createPass(@Body() b: any, @Req() req: any) { return this.securityService.createVisitorPass(req.user.userId, req.user.residentProfileId, b.visitorName, b.validDate); }

  @Get('visitor-passes/me') @ApiOperation({ summary: 'Get my visitor passes (Resident)' })
  getMyPasses(@Req() req: any) { return this.securityService.getMyPasses(req.user.userId); }

  @Post('visitor-passes/:id/revoke') @HttpCode(HttpStatus.OK)
  revokePass(@Param('id') id: string, @Req() req: any) { return this.securityService.revokePass(id, req.user.userId); }

  @Get('visitor-passes/verify') @Roles(Role.GateGuard, Role.PropertyManager)
  @ApiOperation({ summary: 'Verify visitor pass (Gate Guard)' })
  verifyPass(@Query('code') code: string, @Query('payload') payload: string) { return this.securityService.verifyPass(code, payload); }

  @Get('visitor-passes/today') @Roles(Role.GateGuard, Role.PropertyManager)
  @ApiOperation({ summary: "Today's visitor list (Gate Guard)" })
  getTodayVisitors() { return this.securityService.getTodayVisitors(); }

  @Get('residents/lookup') @Roles(Role.GateGuard, Role.PropertyManager)
  @ApiOperation({ summary: 'Resident identity lookup by unit (Gate Guard)' })
  lookupResident(@Query('unit') unit: string) { return this.securityService.lookupResident(unit); }

  @Post('incidents') @ApiOperation({ summary: 'Submit incident report' })
  createIncident(@Body() b: any, @Req() req: any) { return this.securityService.createIncidentReport(req.user.userId, b); }

  @Get('incidents/me') @ApiOperation({ summary: 'Get my incident reports (Resident)' })
  getMyIncidents(@Req() req: any) { return this.securityService.getMyIncidents(req.user.userId); }

  @Get('incidents') @Roles(Role.PropertyManager, Role.BoardMember)
  @ApiOperation({ summary: 'Get all incident reports (PM/Board)' })
  getAllIncidents() { return this.securityService.getAllIncidents(); }
}
