/*
  Warnings:

  - Made the column `credential_id` on table `devices` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."devices" DROP CONSTRAINT "devices_credential_id_fkey";

-- AlterTable
ALTER TABLE "public"."devices" ALTER COLUMN "credential_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."devices" ADD CONSTRAINT "devices_credential_id_fkey" FOREIGN KEY ("credential_id") REFERENCES "public"."credentials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
