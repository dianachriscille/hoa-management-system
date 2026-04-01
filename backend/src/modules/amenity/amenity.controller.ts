import { Controller, Get, Post, Body, Param, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AmenityService } from './amenity.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/auth.dto';

@ApiTags('amenity')
@ApiBearerAuth()
@Controller('amenity')
export class AmenityController {
  constructor(private amenityService: AmenityService) {}

  @Get() @ApiOperation({ summary: 'List all amenities' })
  getAmenities() { return this.amenityService.getAmenities(); }

  @Get(':id/availability') @ApiOperation({ summary: 'Get availability calendar' })
  getAvailability(@Param('id') id: string) { return this.amenityService.getAvailability(id); }

  @Post('bookings') @ApiOperation({ summary: 'Create booking (Resident)' })
  createBooking(@Body() body: { amenityId: string; bookingDate: string }, @Req() req: any) {
    return this.amenityService.createBooking(req.user.userId, req.user.residentProfileId, body.amenityId, body.bookingDate);
  }

  @Get('bookings/me') @ApiOperation({ summary: 'Get my bookings (Resident)' })
  getMyBookings(@Req() req: any) { return this.amenityService.getMyBookings(req.user.userId); }

  @Get('bookings/pending') @Roles(Role.PropertyManager) @ApiOperation({ summary: 'Get pending bookings (PM)' })
  getPendingBookings() { return this.amenityService.getPendingBookings(); }

  @Post('bookings/:id/approve') @Roles(Role.PropertyManager) @HttpCode(HttpStatus.OK)
  approveBooking(@Param('id') id: string, @Req() req: any) { return this.amenityService.approveBooking(id, req.user.userId); }

  @Post('bookings/:id/reject') @Roles(Role.PropertyManager) @HttpCode(HttpStatus.OK)
  rejectBooking(@Param('id') id: string, @Body() body: { reason: string }, @Req() req: any) { return this.amenityService.rejectBooking(id, req.user.userId, body.reason); }

  @Post('bookings/:id/cancel') @HttpCode(HttpStatus.OK)
  cancelBooking(@Param('id') id: string, @Req() req: any) { return this.amenityService.cancelBooking(id, req.user.userId, req.user.role); }

  @Post(':id/block-dates') @Roles(Role.PropertyManager)
  blockDates(@Param('id') id: string, @Body() body: { dates: string[]; reason: string }, @Req() req: any) { return this.amenityService.blockDates(id, body.dates, body.reason, req.user.userId); }
}
