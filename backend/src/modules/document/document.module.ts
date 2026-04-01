import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { DocumentEntity, DocumentVersionEntity } from './entities/document.entities';
import { FileModule } from '../file/file.module';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentEntity, DocumentVersionEntity]),
    FileModule,
    AuditModule,
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
