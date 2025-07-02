-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "lastName" TEXT,
    "documentId" TEXT,
    "country" TEXT,
    "birthDate" TIMESTAMP(3),
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "public"."Profile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_documentId_key" ON "public"."Profile"("documentId");
