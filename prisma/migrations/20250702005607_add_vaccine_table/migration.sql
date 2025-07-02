-- CreateTable
CREATE TABLE "public"."Vaccine" (
    "id" UUID NOT NULL,
    "vaccineName" TEXT NOT NULL,
    "dose" TEXT NOT NULL,
    "vaccinationDate" TIMESTAMP(3) NOT NULL,
    "vaccinationPlace" TEXT NOT NULL,
    "healthProfessional" TEXT NOT NULL,
    "vaccineLot" TEXT,
    "vaccineProofUrl" TEXT,
    "profileId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vaccine_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Vaccine" ADD CONSTRAINT "Vaccine_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
