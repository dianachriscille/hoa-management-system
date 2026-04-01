import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAmenityTables1720915500000 implements MigrationInterface {
  name = 'CreateAmenityTables1720915500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS booking_number_seq START 1`);

    await queryRunner.query(`
      CREATE TABLE "amenity" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "description" text,
        "location" character varying(200),
        "capacity" integer,
        "booking_fee" decimal(10,2),
        "deposit_amount" decimal(10,2),
        "max_advance_days" integer NOT NULL DEFAULT 7,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_amenity_name" UNIQUE ("name"),
        CONSTRAINT "PK_amenity" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "booking_status_enum" AS ENUM ('Pending','Confirmed','Rejected','Cancelled')
    `);

    await queryRunner.query(`
      CREATE TABLE "booking" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "booking_number" character varying NOT NULL,
        "amenity_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "resident_profile_id" uuid NOT NULL,
        "booking_date" date NOT NULL,
        "status" "booking_status_enum" NOT NULL DEFAULT 'Pending',
        "booking_fee_amount" decimal(10,2),
        "deposit_amount" decimal(10,2),
        "pm_notes" text,
        "reminder_sent_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_booking_number" UNIQUE ("booking_number"),
        CONSTRAINT "PK_booking" PRIMARY KEY ("id"),
        CONSTRAINT "FK_booking_amenity" FOREIGN KEY ("amenity_id") REFERENCES "amenity"("id"),
        CONSTRAINT "FK_booking_user" FOREIGN KEY ("user_id") REFERENCES "user"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "blocked_date" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "amenity_id" uuid NOT NULL,
        "blocked_date" date NOT NULL,
        "reason" character varying(200),
        "blocked_by_user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_blocked_date_amenity_date" UNIQUE ("amenity_id","blocked_date"),
        CONSTRAINT "PK_blocked_date" PRIMARY KEY ("id"),
        CONSTRAINT "FK_blocked_date_amenity" FOREIGN KEY ("amenity_id") REFERENCES "amenity"("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_booking_amenity_date" ON "booking" ("amenity_id","booking_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_booking_user_id" ON "booking" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_booking_status" ON "booking" ("status")`);

    // Seed amenities
    await queryRunner.query(`INSERT INTO "amenity" (name, description, booking_fee, deposit_amount, max_advance_days) VALUES ('Clubhouse', 'Community clubhouse for events and gatherings', 500.00, 1000.00, 7), ('Basketball Court', 'Outdoor basketball court', null, null, 7)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "blocked_date"`);
    await queryRunner.query(`DROP TABLE "booking"`);
    await queryRunner.query(`DROP TABLE "amenity"`);
    await queryRunner.query(`DROP TYPE "booking_status_enum"`);
    await queryRunner.query(`DROP SEQUENCE booking_number_seq`);
  }
}
