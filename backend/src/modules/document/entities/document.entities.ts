import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum DocumentCategory { Policies = 'Policies', MeetingMinutes = 'MeetingMinutes', Forms = 'Forms', Announcements = 'Announcements' }
export enum StorageProvider { GoogleDrive = 'GoogleDrive', S3 = 'S3' }

@Entity('document')
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 200 }) title: string;
  @Column({ type: 'enum', enum: DocumentCategory }) category: DocumentCategory;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ name: 'current_version_id', nullable: true }) currentVersionId: string;
  @Column({ name: 'uploaded_by_user_id' }) uploadedByUserId: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('document_version')
export class DocumentVersionEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'document_id' }) documentId: string;
  @Column({ name: 'version_number' }) versionNumber: number;
  @Column({ name: 'google_drive_file_id', nullable: true }) googleDriveFileId: string;
  @Column({ name: 'google_drive_view_url', nullable: true }) googleDriveViewUrl: string;
  @Column({ name: 'google_drive_download_url', nullable: true }) googleDriveDownloadUrl: string;
  @Column({ name: 's3_key', nullable: true }) s3Key: string;
  @Column({ name: 'storage_provider', type: 'enum', enum: StorageProvider }) storageProvider: StorageProvider;
  @Column({ name: 'file_size_bytes', nullable: true }) fileSizeBytes: number;
  @Column({ name: 'mime_type', nullable: true }) mimeType: string;
  @Column({ name: 'uploaded_by_user_id' }) uploadedByUserId: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
