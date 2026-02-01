-- AlterTable
ALTER TABLE "public"."config_versions" ALTER COLUMN "changed_lines" DROP NOT NULL,
ALTER COLUMN "changed_lines" DROP DEFAULT;
