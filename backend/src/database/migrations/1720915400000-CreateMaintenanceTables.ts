import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMaintenanceTables1720915400000 implements MigrationInterface {
  name = 'CreateMaintenanceTables1720915400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS maintenance_request_seq START 1`);

    await queryRunner.query(`
      CREATE TYPE "maintenance_category_enum" AS ENUM ('Plumbing','Electrical','Structural','Landscaping','Other')
    `);
    await queryRunner.query(`
      CREATE TYPE "maintenance_status_enum" AS ENUM ('Submitted','Assigned','InProgress','Resolved','Closed')
    `);

    await queryRunner.query(`
      CREATE TABLE "maintenance_request" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "request_number" character varying NOT NULL,
        "user_id" uuid NOT NULL,
        "resident_profile_id" uuid NOT NULL,
        "category" "maintenance_category_enum" NOT NULL,
        "description" text NOT NULL,
        "location" character varying(200) NOT NULL,
        "status" "maintenance_status_enum" NOT NULL DEFAULT 'Submitted',
        "assigned_to_user_id" uuid,
        "assigned_at" TIMESTAMP,
        "resolved_at" TIMESTAMP,
        "closed_at" TIMESTAMP,
        "resident_confirmed_at" TIMESTAMP,
        "reopen_deadline" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_maintenance_request_number" UNIQUE ("request_number"),
        CONSTRAINT "PK_maintenance_request" PRIMARY KEY ("id"),
        CONSTRAINT "FK_maintenance_request_user" FOREIGN KEY ("user_id") REFERENCES "user"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "status_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "request_id" uuid NOT NULL,
        "from_status" "maintenance_status_enum",
        "to_status" "maintenance_status_enum" NOT NULL,
        "changed_by_user_id" uuid NOT NULL,
        "note" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_status_history" PRIMARY KEY ("id"),
        CONSTRAINT "FK_status_history_request" FOREIGN KEY ("request_id") REFERENCES "maintenance_request"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "request_photo" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "request_id" uuid NOT NULL,
        "s3_key" character varying NOT NULL,
        "uploaded_by_user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_request_photo" PRIMARY KEY ("id"),
        CONSTRAINT "FK_request_photo_request" FOREIGN KEY ("request_id") REFERENCES "maintenance_request"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "request_note" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "request_id" uuid NOT NULL,
        "author_user_id" uuid NOT NULL,
        "content" text NOT NULL,
        "is_internal" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_request_note" PRIMARY KEY ("id"),
        CONSTRAINT "FK_request_note_request" FOREIGN KEY ("request_id") REFERENCES "maintenance_request"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_maintenance_request_user_id" ON "maintenance_request" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_maintenance_request_status" ON "maintenance_request" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_status_history_request_id" ON "status_history" ("request_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "request_note"`);
    await queryRunner.query(`DROP TABLE "request_photo"`);
    await queryRunner.query(`DROP TABLE "status_history"`);
    await queryRunner.query(`DROP TABLE "maintenance_request"`);
    await queryRunner.query(`DROP TYPE "maintenance_status_enum"`);
    await queryRunner.query(`DROP TYPE "maintenance_category_enum"`);
    await queryRunner.query(`DROP SEQUENCE maintenance_request_seq`);
  }
}
