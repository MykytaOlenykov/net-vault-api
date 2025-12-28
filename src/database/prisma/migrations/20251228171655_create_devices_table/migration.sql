/*
  Warnings:

  - The primary key for the `password_reset` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `password_reset` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."BackupStatus" AS ENUM ('Success', 'Failed', 'Running');

-- AlterTable
ALTER TABLE "public"."password_reset" DROP CONSTRAINT "password_reset_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "password_reset_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "public"."device_types" (
    "id" UUID NOT NULL,
    "vendor" TEXT NOT NULL,
    "config_command" TEXT NOT NULL,

    CONSTRAINT "device_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."credentials" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "secret_ref" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."devices" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "ip_address" INET NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 22,
    "device_type_id" UUID NOT NULL,
    "credential_id" UUID,
    "backup_schedule" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."config_versions" (
    "id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "status" "public"."BackupStatus" NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "config_text" TEXT,
    "config_hash" TEXT,
    "changed_lines" INTEGER NOT NULL DEFAULT 0,
    "is_duplicate" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,

    CONSTRAINT "config_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."device_tags" (
    "device_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_tags_pkey" PRIMARY KEY ("device_id","tag_id")
);

-- CreateTable
CREATE TABLE "public"."tags" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "devices_is_active_idx" ON "public"."devices"("is_active");

-- CreateIndex
CREATE INDEX "devices_device_type_id_idx" ON "public"."devices"("device_type_id");

-- CreateIndex
CREATE INDEX "devices_credential_id_idx" ON "public"."devices"("credential_id");

-- CreateIndex
CREATE UNIQUE INDEX "devices_ip_address_port_key" ON "public"."devices"("ip_address", "port");

-- CreateIndex
CREATE INDEX "config_versions_device_id_started_at_idx" ON "public"."config_versions"("device_id", "started_at");

-- CreateIndex
CREATE INDEX "config_versions_device_id_finished_at_idx" ON "public"."config_versions"("device_id", "finished_at");

-- CreateIndex
CREATE INDEX "config_versions_device_id_status_idx" ON "public"."config_versions"("device_id", "status");

-- CreateIndex
CREATE INDEX "config_versions_device_id_config_hash_idx" ON "public"."config_versions"("device_id", "config_hash");

-- CreateIndex
CREATE UNIQUE INDEX "config_versions_device_id_version_number_key" ON "public"."config_versions"("device_id", "version_number");

-- CreateIndex
CREATE INDEX "device_tags_tag_id_idx" ON "public"."device_tags"("tag_id");

-- CreateIndex
CREATE INDEX "device_tags_device_id_idx" ON "public"."device_tags"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "public"."tags"("name");

-- AddForeignKey
ALTER TABLE "public"."devices" ADD CONSTRAINT "devices_device_type_id_fkey" FOREIGN KEY ("device_type_id") REFERENCES "public"."device_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."devices" ADD CONSTRAINT "devices_credential_id_fkey" FOREIGN KEY ("credential_id") REFERENCES "public"."credentials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."config_versions" ADD CONSTRAINT "config_versions_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."device_tags" ADD CONSTRAINT "device_tags_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."device_tags" ADD CONSTRAINT "device_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
