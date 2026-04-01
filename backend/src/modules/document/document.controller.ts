import { Controller, Get, Post, Delete, Body, Param, Query, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { DocumentService } from './document.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/auth.dto';
import { DocumentCategory } from './entities/document.entities';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Get()
  @ApiOperation({ summary: 'List documents' })
  listDocuments(@Query('category') category: DocumentCategory, @Query('search') search: string) {
    return this.documentService.listDocuments(category, search);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get document download URL' })
  getDownloadUrl(@Param('id') id: string) {
    return this.documentService.getDownloadUrl(id);
  }

  @Get(':id/versions')
  @Roles(Role.PropertyManager, Role.BoardMember)
  @ApiOperation({ summary: 'Get version history (PM/Board)' })
  getVersionHistory(@Param('id') id: string) {
    return this.documentService.getVersionHistory(id);
  }

  @Post()
  @Roles(Role.PropertyManager, Role.BoardMember)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload new document (PM/Board)' })
  uploadDocument(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Req() req: any) {
    return this.documentService.uploadDocument(req.user.userId, body.title, body.category, body.description, file);
  }

  @Post(':id/version')
  @Roles(Role.PropertyManager, Role.BoardMember)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload new version of existing document (PM/Board)' })
  uploadNewVersion(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() body: any, @Req() req: any) {
    return this.documentService.uploadDocument(req.user.userId, body.title, body.category, body.description, file, id);
  }

  @Delete(':id')
  @Roles(Role.PropertyManager, Role.BoardMember)
  @ApiOperation({ summary: 'Delete document (soft delete, PM/Board)' })
  deleteDocument(@Param('id') id: string, @Req() req: any) {
    return this.documentService.deleteDocument(id, req.user.userId);
  }
}
