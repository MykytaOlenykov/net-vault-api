-- CreateEnum
CREATE TYPE "public"."Protocol" AS ENUM ('SSH', 'Telnet');

-- AlterTable
ALTER TABLE "public"."devices" ADD COLUMN     "protocol" "public"."Protocol" NOT NULL DEFAULT 'SSH';
