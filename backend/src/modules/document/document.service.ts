import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { DocumentEntity, DocumentVersionEntity, DocumentCategory, StorageProvider } from './entities/document.entities';
import { FileService } from '../file/file.service';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class DocumentService {
  private logger = new Logger(DocumentService.name);

  constructor(
    @InjectRepository(DocumentEntity) private docRepo: Repository<DocumentEntity>,
    @InjectRepository(DocumentVersionEntity) private versionRepo: Repository<DocumentVersionEntity>,
    private fileService: FileService,
    private config: ConfigService,
    private dataSource: DataSource,
    private auditService: AuditService,
  ) {}

  async listDocuments(category?: DocumentCategory, search?: string): Promise<DocumentEntity[]> {
    const qb = this.docRepo.createQueryBuilder('d')
      .where('d.is_active = true');
    if (category) qb.andWhere('d.category = :category', { category });
    if (search) qb.andWhere('d.title ILIKE :search', { search: `%${search}%` });
    return qb.orderBy('d.created_at', 'DESC').getMany();
  }

  async getDownloadUrl(documentId: string): Promise<{ url: string; provider: StorageProvider }> {
    const doc = await this.docRepo.findOne({ where: { id: documentId, isActive: true } });
    if (!doc || !doc.currentVersionId) throw new NotFoundException('Document not found');

    const version = await this.versionRepo.findOne({ where: { id: doc.currentVersionId } });
    if (!version) throw new NotFoundException('Document version not found');

    if (version.storageProvider === StorageProvider.GoogleDrive) {
      return { url: version.googleDriveDownloadUrl, provider: StorageProvider.GoogleDrive };
    }
    const url = await this.fileService.generatePresignedDownloadUrl(version.s3Key);
    return { url, provider: StorageProvider.S3 };
  }

  async uploadDocument(userId: string, title: string, category: DocumentCategory, description: string, file: Express.Multer.File, documentId?: string): Promise<DocumentEntity> {
    let storageProvider: StorageProvider;
    let googleDriveFileId: string, googleDriveViewUrl: string, googleDriveDownloadUrl: string, s3Key: string;

    try {
      const result = await this.uploadToGoogleDrive(file);
      googleDriveFileId = result.fileId;
      googleDriveViewUrl = result.viewUrl;
      googleDriveDownloadUrl = result.downloadUrl;
      storageProvider = StorageProvider.GoogleDrive;
    } catch (err) {
      this.logger.warn(`Google Drive upload failed, falling back to S3: ${err.message}`);
      s3Key = await this.uploadToS3Fallback(file);
      storageProvider = StorageProvider.S3;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let doc: DocumentEntity;
      if (documentId) {
        doc = await queryRunner.manager.findOne(DocumentEntity, { where: { id: documentId } });
        if (!doc) throw new NotFoundException('Document not found');
      } else {
        doc = await queryRunner.manager.save(DocumentEntity, queryRunner.manager.create(DocumentEntity, { title, category, description, uploadedByUserId: userId }));
      }

      const lastVersion = await queryRunner.manager.findOne(DocumentVersionEntity, { where: { documentId: doc.id }, order: { versionNumber: 'DESC' } });
      const versionNumber = (lastVersion?.versionNumber ?? 0) + 1;

      const version = await queryRunner.manager.save(DocumentVersionEntity, queryRunner.manager.create(DocumentVersionEntity, {
        documentId: doc.id, versionNumber, storageProvider,
        googleDriveFileId, googleDriveViewUrl, googleDriveDownloadUrl, s3Key,
        fileSizeBytes: file.size, mimeType: file.mimetype, uploadedByUserId: userId,
      }));

      doc.currentVersionId = version.id;
      if (!documentId) { doc.title = title; doc.category = category; doc.description = description; }
      await queryRunner.manager.save(doc);
      await queryRunner.commitTransaction();
      await this.auditService.log({ userId, action: 'DOCUMENT_UPLOADED', entityType: 'Document', entityId: doc.id, metadata: { versionNumber, storageProvider } });
      return doc;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteDocument(documentId: string, userId: string): Promise<void> {
    const doc = await this.docRepo.findOne({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');
    doc.isActive = false;
    await this.docRepo.save(doc);
    await this.auditService.log({ userId, action: 'DOCUMENT_DELETED', entityType: 'Document', entityId: documentId });
  }

  async getVersionHistory(documentId: string): Promise<DocumentVersionEntity[]> {
    return this.versionRepo.find({ where: { documentId }, order: { versionNumber: 'DESC' } });
  }

  private async uploadToGoogleDrive(file: Express.Multer.File): Promise<{ fileId: string; viewUrl: string; downloadUrl: string }> {
    const clientId = this.config.get('app.googleDriveClientId');
    const clientSecret = this.config.get('app.googleDriveClientSecret');
    const tokens = JSON.parse(this.config.get('app.googleDriveTokens') || '{}');

    const auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth });

    const stream = new Readable(); stream.push(file.buffer); stream.push(null);
    const res = await drive.files.create({
      requestBody: { name: file.originalname, mimeType: file.mimetype },
      media: { mimeType: file.mimetype, body: stream },
      fields: 'id,webViewLink,webContentLink',
    });

    await drive.permissions.create({ fileId: res.data.id, requestBody: { role: 'reader', type: 'anyone' } });
    return { fileId: res.data.id, viewUrl: res.data.webViewLink, downloadUrl: res.data.webContentLink };
  }

  private async uploadToS3Fallback(file: Express.Multer.File): Promise<string> {
    const { key, url } = await this.fileService.generatePresignedUploadUrl('documents', file.mimetype);
    const { default: axios } = await import('axios');
    await axios.put(url, file.buffer, { headers: { 'Content-Type': file.mimetype } });
    return key;
  }
}
