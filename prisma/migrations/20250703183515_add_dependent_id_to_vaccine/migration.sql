-- DropForeignKey
ALTER TABLE "public"."Vaccine" DROP CONSTRAINT "Vaccine_profileId_fkey";

-- AlterTable
ALTER TABLE "public"."Vaccine" ADD COLUMN     "dependentId" UUID,
ALTER COLUMN "profileId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Vaccine" ADD CONSTRAINT "Vaccine_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vaccine" ADD CONSTRAINT "Vaccine_dependentId_fkey" FOREIGN KEY ("dependentId") REFERENCES "public"."Dependent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
