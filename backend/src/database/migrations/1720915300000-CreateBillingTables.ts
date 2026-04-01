import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBillingTables1720915300000 implements MigrationInterface {
  name = 'CreateBillingTables1720915300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS receipt_number_seq START 1`);

    await queryRunner.query(`
      CREATE TABLE "billing_config" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "monthly_due_amount" decimal(10,2) NOT NULL,
        "due_day_of_month" integer NOT NULL DEFAULT 15,
        "grace_period_days" integer NOT NULL DEFAULT 7,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_billing_config" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "invoice_status_enum" AS ENUM ('Unpaid','PartiallyPaid','Paid','Overdue')
    `);

    await queryRunner.query(`
      CREATE TABLE "invoice" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "invoice_number" character varying NOT NULL,
        "resident_profile_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "billing_period" character varying(7) NOT NULL,
        "amount" decimal(10,2) NOT NULL,
        "status" "invoice_status_enum" NOT NULL DEFAULT 'Unpaid',
        "due_date" date NOT NULL,
        "paid_at" TIMESTAMP,
        "last_reminder_sent_at" TIMESTAMP,
        "reminder_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_invoice_number" UNIQUE ("invoice_number"),
        CONSTRAINT "UQ_invoice_unit_period" UNIQUE ("resident_profile_id","billing_period"),
        CONSTRAINT "PK_invoice" PRIMARY KEY ("id"),
        CONSTRAINT "FK_invoice_user" FOREIGN KEY ("user_id") REFERENCES "user"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "payment_method_enum" AS ENUM ('GCash','Manual')
    `);
    await queryRunner.query(`
      CREATE TYPE "payment_status_enum" AS ENUM ('Pending','Completed','Failed')
    `);

    await queryRunner.query(`
      CREATE TABLE "payment" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "invoice_id" uuid NOT NULL,
        "amount" decimal(10,2) NOT NULL,
        "payment_method" "payment_method_enum" NOT NULL,
        "status" "payment_status_enum" NOT NULL DEFAULT 'Pending',
        "gcash_reference_number" character varying,
        "gcash_payment_id" character varying,
        "gcash_checkout_url" character varying,
        "recorded_by" uuid,
        "notes" character varying,
        "paid_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payment_invoice" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "receipt" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "receipt_number" character varying NOT NULL,
        "invoice_id" uuid NOT NULL,
        "resident_name" character varying NOT NULL,
        "unit_number" character varying NOT NULL,
        "billing_period" character varying NOT NULL,
        "amount_paid" decimal(10,2) NOT NULL,
        "payment_method" "payment_method_enum" NOT NULL,
        "reference_number" character varying,
        "paid_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_receipt_number" UNIQUE ("receipt_number"),
        CONSTRAINT "UQ_receipt_invoice" UNIQUE ("invoice_id"),
        CONSTRAINT "PK_receipt" PRIMARY KEY ("id"),
        CONSTRAINT "FK_receipt_invoice" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_invoice_user_id" ON "invoice" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_invoice_status" ON "invoice" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_invoice_due_date" ON "invoice" ("due_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_invoice_id" ON "payment" ("invoice_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "receipt"`);
    await queryRunner.query(`DROP TABLE "payment"`);
    await queryRunner.query(`DROP TABLE "invoice"`);
    await queryRunner.query(`DROP TABLE "billing_config"`);
    await queryRunner.query(`DROP TYPE "payment_status_enum"`);
    await queryRunner.query(`DROP TYPE "payment_method_enum"`);
    await queryRunner.query(`DROP TYPE "invoice_status_enum"`);
    await queryRunner.query(`DROP SEQUENCE invoice_number_seq`);
    await queryRunner.query(`DROP SEQUENCE receipt_number_seq`);
  }
}
