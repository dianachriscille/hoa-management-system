import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFoundationTables1720915200000 implements MigrationInterface {
  name = 'CreateFoundationTables1720915200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('Resident', 'BoardMember', 'PropertyManager', 'GateGuard')
    `);

    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying(255) NOT NULL,
        "password_hash" character varying NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'Resident',
        "is_email_verified" boolean NOT NULL DEFAULT false,
        "email_verification_token" character varying,
        "password_reset_token" character varying,
        "password_reset_expires_at" TIMESTAMP,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "UQ_user_email" UNIQUE ("email"),
        CONSTRAINT "PK_user" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "resident_profile" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "unit_number" character varying(20) NOT NULL,
        "first_name" character varying(100) NOT NULL,
        "last_name" character varying(100) NOT NULL,
        "contact_number" character varying(20) NOT NULL,
        "vehicle_plate_1" character varying(20),
        "vehicle_plate_2" character varying(20),
        "emergency_contact_name" character varying(200),
        "emergency_contact_number" character varying(20),
        "profile_photo_key" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_resident_profile_user_id" UNIQUE ("user_id"),
        CONSTRAINT "UQ_resident_profile_unit_number" UNIQUE ("unit_number"),
        CONSTRAINT "PK_resident_profile" PRIMARY KEY ("id"),
        CONSTRAINT "FK_resident_profile_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "consent_type_enum" AS ENUM ('DataCollection', 'DataProcessing', 'Marketing')
    `);

    await queryRunner.query(`
      CREATE TABLE "consent_record" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "consent_type" "consent_type_enum" NOT NULL,
        "consent_given" boolean NOT NULL,
        "ip_address" character varying NOT NULL,
        "user_agent" character varying,
        "consent_text" text NOT NULL,
        "given_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_consent_record" PRIMARY KEY ("id"),
        CONSTRAINT "FK_consent_record_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "data_request_type_enum" AS ENUM ('Access', 'Correction', 'Deletion')
    `);
    await queryRunner.query(`
      CREATE TYPE "data_request_status_enum" AS ENUM ('Pending', 'InProgress', 'Completed')
    `);

    await queryRunner.query(`
      CREATE TABLE "data_request" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "request_type" "data_request_type_enum" NOT NULL,
        "status" "data_request_status_enum" NOT NULL DEFAULT 'Pending',
        "requested_at" TIMESTAMP NOT NULL DEFAULT now(),
        "completed_at" TIMESTAMP,
        "handled_by" uuid,
        "notes" text,
        CONSTRAINT "PK_data_request" PRIMARY KEY ("id"),
        CONSTRAINT "FK_data_request_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_log" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "action" character varying NOT NULL,
        "entity_type" character varying NOT NULL,
        "entity_id" uuid,
        "ip_address" character varying,
        "metadata" jsonb,
        "performed_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_log" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "refresh_token" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "token_hash" character varying NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "is_revoked" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_token" PRIMARY KEY ("id"),
        CONSTRAINT "FK_refresh_token_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE INDEX "IDX_user_email" ON "user" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_refresh_token_user_id" ON "refresh_token" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_log_user_id" ON "audit_log" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_log_performed_at" ON "audit_log" ("performed_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "refresh_token"`);
    await queryRunner.query(`DROP TABLE "audit_log"`);
    await queryRunner.query(`DROP TABLE "data_request"`);
    await queryRunner.query(`DROP TABLE "consent_record"`);
    await queryRunner.query(`DROP TABLE "resident_profile"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "data_request_status_enum"`);
    await queryRunner.query(`DROP TYPE "data_request_type_enum"`);
    await queryRunner.query(`DROP TYPE "consent_type_enum"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
