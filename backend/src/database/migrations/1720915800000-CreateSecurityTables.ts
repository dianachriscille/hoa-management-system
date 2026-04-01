import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSecurityTables1720915800000 implements MigrationInterface {
  name = 'CreateSecurityTables1720915800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS incident_report_seq START 1`);
    await queryRunner.query(`CREATE TYPE "incident_category_enum" AS ENUM ('UnauthorizedEntry','Vandalism','NoiseComplaint','SuspiciousActivity','Accident','Other')`);
    await queryRunner.query(`CREATE TYPE "incident_status_enum" AS ENUM ('Open','UnderReview','Resolved')`);

    await queryRunner.query(`
      CREATE TABLE "visitor_pass" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "pass_code" character varying(8) NOT NULL,
        "user_id" uuid NOT NULL,
        "resident_profile_id" uuid NOT NULL,
        "visitor_name" character varying(200) NOT NULL,
        "valid_date" date NOT NULL,
        "is_revoked" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_visitor_pass_code" UNIQUE ("pass_code"),
        CONSTRAINT "PK_visitor_pass" PRIMARY KEY ("id"),
        CONSTRAINT "FK_visitor_pass_user" FOREIGN KEY ("user_id") REFERENCES "user"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "incident_report" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "report_number" character varying NOT NULL,
        "reported_by_user_id" uuid NOT NULL,
        "category" "incident_category_enum" NOT NULL,
        "description" text NOT NULL,
        "location" character varying(200),
        "incident_date" date NOT NULL,
        "incident_time" time,
        "photo_key" character varying,
        "status" "incident_status_enum" NOT NULL DEFAULT 'Open',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_incident_report_number" UNIQUE ("report_number"),
        CONSTRAINT "PK_incident_report" PRIMARY KEY ("id"),
        CONSTRAINT "FK_incident_report_user" FOREIGN KEY ("reported_by_user_id") REFERENCES "user"("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_visitor_pass_user_id" ON "visitor_pass" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_visitor_pass_valid_date" ON "visitor_pass" ("valid_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_incident_report_status" ON "incident_report" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "incident_report"`);
    await queryRunner.query(`DROP TABLE "visitor_pass"`);
    await queryRunner.query(`DROP TYPE "incident_status_enum"`);
    await queryRunner.query(`DROP TYPE "incident_category_enum"`);
    await queryRunner.query(`DROP SEQUENCE incident_report_seq`);
  }
}
