import { Controller, Get, Post, Body, Param, Query, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommunicationService } from './communication.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/auth.dto';
import { RsvpStatus } from './entities/communication.entities';

@ApiTags('communication')
@ApiBearerAuth()
@Controller('communication')
export class CommunicationController {
  constructor(private commService: CommunicationService) {}

  // Announcements
  @Get('announcements') getAnnouncements() { return this.commService.getAnnouncements(); }
  @Post('announcements') @Roles(Role.BoardMember, Role.PropertyManager)
  createAnnouncement(@Body() b: any, @Req() req: any) { return this.commService.createAnnouncement(req.user.userId, b.title, b.body, b.sendPush); }
  @Post('announcements/:id/read') @HttpCode(HttpStatus.OK)
  markRead(@Param('id') id: string, @Req() req: any) { return this.commService.markAnnouncementRead(id, req.user.userId); }

  // Polls
  @Get('polls') getPolls(@Req() req: any) { return this.commService.getPolls(req.user.userId); }
  @Post('polls') @Roles(Role.BoardMember, Role.PropertyManager)
  createPoll(@Body() b: any, @Req() req: any) { return this.commService.createPoll(req.user.userId, b.question, b.options, b.closingDate); }
  @Post('polls/:id/vote') @HttpCode(HttpStatus.OK)
  vote(@Param('id') id: string, @Body() b: any, @Req() req: any) { return this.commService.submitVote(id, b.optionId, req.user.userId); }

  // Feedback Forms
  @Get('forms') getForms() { return this.commService.getForms(); }
  @Post('forms/:id/respond') @HttpCode(HttpStatus.CREATED)
  submitFeedback(@Param('id') id: string, @Body() b: any, @Req() req: any) { return this.commService.submitFeedback(id, req.user.userId, b.answers); }

  // Events
  @Get('events') getEvents() { return this.commService.getEvents(); }
  @Post('events') @Roles(Role.BoardMember, Role.PropertyManager)
  createEvent(@Body() b: any, @Req() req: any) { return this.commService.createEvent(req.user.userId, b); }
  @Post('events/:id/rsvp') @HttpCode(HttpStatus.OK)
  rsvp(@Param('id') id: string, @Body() b: { status: RsvpStatus }, @Req() req: any) { return this.commService.submitRsvp(id, req.user.userId, b.status); }
  @Get('events/:id/rsvp') getRsvpSummary(@Param('id') id: string) { return this.commService.getEventRsvpSummary(id); }

  // Device Tokens + Metrics
  @Post('device-token') @HttpCode(HttpStatus.OK)
  registerToken(@Body() b: any, @Req() req: any) { return this.commService.registerDeviceToken(req.user.userId, b.token, b.platform); }
  @Get('metrics') @Roles(Role.BoardMember, Role.PropertyManager)
  getMetrics(@Query('startDate') s: string, @Query('endDate') e: string) { return this.commService.getEngagementMetrics(s, e); }
}
