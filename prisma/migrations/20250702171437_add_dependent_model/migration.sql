-- CreateTable
CREATE TABLE "public"."Dependent" (
    "id" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "mainAccountId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dependent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dependent_documentId_key" ON "public"."Dependent"("documentId");

-- AddForeignKey
ALTER TABLE "public"."Dependent" ADD CONSTRAINT "Dependent_mainAccountId_fkey" FOREIGN KEY ("mainAccountId") REFERENCES "public"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
