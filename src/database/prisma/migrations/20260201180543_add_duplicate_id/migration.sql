-- AlterTable
ALTER TABLE "public"."config_versions" ADD COLUMN     "duplicate_id" UUID;

-- AddForeignKey
ALTER TABLE "public"."config_versions" ADD CONSTRAINT "config_versions_duplicate_id_fkey" FOREIGN KEY ("duplicate_id") REFERENCES "public"."config_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
