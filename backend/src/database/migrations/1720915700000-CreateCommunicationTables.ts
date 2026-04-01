import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommunicationTables1720915700000 implements MigrationInterface {
  name = 'CreateCommunicationTables1720915700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "announcement_status_enum" AS ENUM ('Draft','Published')`);
    await queryRunner.query(`CREATE TYPE "poll_status_enum" AS ENUM ('Active','Closed')`);
    await queryRunner.query(`CREATE TYPE "rsvp_status_enum" AS ENUM ('Attending','NotAttending')`);
    await queryRunner.query(`CREATE TYPE "device_platform_enum" AS ENUM ('Web','Android','iOS')`);

    await queryRunner.query(`CREATE TABLE "announcement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),"title" varchar(200) NOT NULL,"body" text NOT NULL,"status" "announcement_status_enum" NOT NULL DEFAULT 'Draft',"send_push" boolean NOT NULL DEFAULT false,"send_sms" boolean NOT NULL DEFAULT false,"published_at" TIMESTAMP,"created_by_user_id" uuid NOT NULL,"created_at" TIMESTAMP NOT NULL DEFAULT now(),"updated_at" TIMESTAMP NOT NULL DEFAULT now(),CONSTRAINT "PK_announcement" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "announcement_read" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),"announcement_id" uuid NOT NULL,"user_id" uuid NOT NULL,"read_at" TIMESTAMP NOT NULL DEFAULT now(),CONSTRAINT "UQ_announcement_read" UNIQUE ("announcement_id","user_id"),CONSTRAINT "PK_announcement_read" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "poll" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),"question" varchar(500) NOT NULL,"status" "poll_status_enum" NOT NULL DEFAULT 'Active',"closing_date" date NOT NULL,"created_by_user_id" uuid NOT NULL,"created_at" TIMESTAMP NOT NULL DEFAULT now(),"updated_at" TIMESTAMP NOT NULL DEFAULT now(),CONSTRAINT "PK_poll" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "poll_option" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),"poll_id" uuid NOT NULL,"option_text" varchar(200) NOT NULL,"display_order" integer NOT NULL,CONSTRAINT "PK_poll_option" PRIMARY KEY ("id"),CONSTRAINT "FK_poll_option_poll" FOREIGN KEY ("poll_id") REFERENCES "poll"("id") ON DELETE CASCADE)`);
    await queryRunner.query(`CREATE TABLE "poll_vote" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),"poll_id" uuid NOT NULL,"option_id" uuid NOT NULL,"user_id" uuid NOT NULL,"voted_at" TIMESTAMP NOT NULL DEFAULT now(),CONSTRAINT "UQ_poll_vote" UNIQUE ("poll_id","user_id"),CONSTRAINT "PK_poll_vote" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "feedback_form" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),"title" varchar(200) NOT NULL,"description" text,"is_active" boolean NOT NULL DEFAULT true,"created_by_user_id" uuid NOT NULL,"created_at" TIMESTAMP NOT NULL DEFAULT now(),CONSTRAINT "PK_feedback_form" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "feedback_question" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),"form_id" uuid NOT NULL,"question_text" varchar(500) NOT NULL,"is_required" boolean NOT NULL DEFAULT true,"display_order" integer NOT NULL,CONSTRAINT "PK_feedback_question" PRIMARY KEY ("id"),CONSTRAINT "FK_feedback_question_form" FOREIGN KEY ("form_id") REFERENCES "feedback_form"("id") ON DELETE CASCADE)`);
    await queryRunner.query(`CREATE TABLE "feedback_response" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),"form_id" uuid NOT NULL,"user_id" uuid NOT NULL,"answers" jsonb NOT NULL,"submitted_at" TIMESTAMP NOT NULL DEFAULT now(),CONSTRAINT "UQ_feedback_response" UNIQUE ("form_id","user_id"),CONSTRAINT "PK_feedback_response" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),"title" varchar(200) NOT NULL,"description" text,"location" varchar(200),"event_date" date NOT NULL,"start_time" time,"end_time" time,"created_by_user_id" uuid NOT NULL,"created_at" TIMESTAMP NOT NULL DEFAULT now(),"updated_at" TIMESTAMP NOT NULL DEFAULT now(),CONSTRAINT "PK_event" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "event_rsvp" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),"event_id" uuid NOT NULL,"user_id" uuid NOT NULL,"status" "rsvp_status_enum" NOT NULL,"responded_at" TIMESTAMP NOT NULL DEFAULT now(),CONSTRAINT "UQ_event_rsvp" UNIQUE ("event_id","user_id"),CONSTRAINT "PK_event_rsvp" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "device_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),"user_id" uuid NOT NULL,"token" varchar NOT NULL,"platform" "device_platform_enum" NOT NULL DEFAULT 'Web',"created_at" TIMESTAMP NOT NULL DEFAULT now(),"updated_at" TIMESTAMP NOT NULL DEFAULT now(),CONSTRAINT "UQ_device_token" UNIQUE ("user_id","token"),CONSTRAINT "PK_device_token" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = ['device_token','event_rsvp','event','feedback_response','feedback_question','feedback_form','poll_vote','poll_option','poll','announcement_read','announcement'];
    for (const t of tables) await queryRunner.query(`DROP TABLE "${t}"`);
    await queryRunner.query(`DROP TYPE "device_platform_enum"`);
    await queryRunner.query(`DROP TYPE "rsvp_status_enum"`);
    await queryRunner.query(`DROP TYPE "poll_status_enum"`);
    await queryRunner.query(`DROP TYPE "announcement_status_enum"`);
  }
}
