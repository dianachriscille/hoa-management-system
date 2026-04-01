import { Controller, Get, Patch, Body, Req, Query, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ResidentService } from './resident.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/auth.dto';

@ApiTags('residents')
@ApiBearerAuth()
@Controller('residents')
export class ResidentController {
  constructor(private residentService: ResidentService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get own profile' })
  getMyProfile(@Req() req: any) {
    return this.residentService.getMyProfile(req.user.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update own profile' })
  updateProfile(@Req() req: any, @Body() body: any) {
    return this.residentService.updateProfile(req.user.userId, body);
  }

  @Get()
  @Roles(Role.PropertyManager)
  @ApiOperation({ summary: 'Get resident directory (PM only)' })
  getDirectory(@Query('search') search: string, @Query('page') page: number) {
    return this.residentService.getDirectory(search, page);
  }
}
