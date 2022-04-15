import {MigrationInterface, QueryRunner} from "typeorm";

export class addUser1648623447697 implements MigrationInterface {
    name = 'addUser1648623447697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "public"."todo" ("id" SERIAL NOT NULL, "content" character varying(255), "is_done" boolean NOT NULL DEFAULT false, "createdate" TIMESTAMP NOT NULL DEFAULT now(), "updateddate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e87731bafd682f5a84e2449470f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "public"."user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "password" text NOT NULL, "createdate" TIMESTAMP NOT NULL DEFAULT now(), "updateddate" TIMESTAMP NOT NULL DEFAULT now(), "last_login" TIMESTAMP, "hach_refresh_token" character varying, CONSTRAINT "UQ_b67337b7f8aa8406e936c2ff754" UNIQUE ("username"), CONSTRAINT "PK_03b91d2b8321aa7ba32257dc321" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b67337b7f8aa8406e936c2ff75" ON "public"."user" ("username") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_b67337b7f8aa8406e936c2ff75"`);
        await queryRunner.query(`DROP TABLE "public"."user"`);
        await queryRunner.query(`DROP TABLE "public"."todo"`);
    }

}
