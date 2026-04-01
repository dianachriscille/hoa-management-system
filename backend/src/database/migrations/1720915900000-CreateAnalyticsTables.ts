import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnalyticsTables1720915900000 implements MigrationInterface {
  name = 'CreateAnalyticsTables1720915900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "monthly_budget" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "period" character varying(7) NOT NULL,
        "budget_amount" decimal(10,2) NOT NULL,
        "created_by_user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_monthly_budget_period" UNIQUE ("period"),
        CONSTRAINT "PK_monthly_budget" PRIMARY KEY ("id"),
        CONSTRAINT "FK_monthly_budget_user" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "monthly_budget"`);
  }
}
