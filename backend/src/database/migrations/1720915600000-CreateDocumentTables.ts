import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocumentTables1720915600000 implements MigrationInterface {
  name = 'CreateDocumentTables1720915600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "document_category_enum" AS ENUM ('Policies','MeetingMinutes','Forms','Announcements')`);
    await queryRunner.query(`CREATE TYPE "storage_provider_enum" AS ENUM ('GoogleDrive','S3')`);

    await queryRunner.query(`
      CREATE TABLE "document" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(200) NOT NULL,
        "category" "document_category_enum" NOT NULL,
        "description" text,
        "current_version_id" uuid,
        "uploaded_by_user_id" uuid NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_document" PRIMARY KEY ("id"),
        CONSTRAINT "FK_document_user" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "user"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "document_version" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "document_id" uuid NOT NULL,
        "version_number" integer NOT NULL,
        "google_drive_file_id" character varying,
        "google_drive_view_url" character varying,
        "google_drive_download_url" character varying,
        "s3_key" character varying,
        "storage_provider" "storage_provider_enum" NOT NULL,
        "file_size_bytes" integer,
        "mime_type" character varying,
        "uploaded_by_user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_document_version" PRIMARY KEY ("id"),
        CONSTRAINT "FK_document_version_document" FOREIGN KEY ("document_id") REFERENCES "document"("id")
      )
    `);

    await queryRunner.query(`ALTER TABLE "document" ADD CONSTRAINT "FK_document_current_version" FOREIGN KEY ("current_version_id") REFERENCES "document_version"("id") DEFERRABLE INITIALLY DEFERRED`);
    await queryRunner.query(`CREATE INDEX "IDX_document_category" ON "document" ("category")`);
    await queryRunner.query(`CREATE INDEX "IDX_document_title" ON "document" ("title")`);
    await queryRunner.query(`CREATE INDEX "IDX_document_version_document_id" ON "document_version" ("document_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "document_version"`);
    await queryRunner.query(`DROP TABLE "document"`);
    await queryRunner.query(`DROP TYPE "storage_provider_enum"`);
    await queryRunner.query(`DROP TYPE "document_category_enum"`);
  }
}
