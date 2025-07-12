/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Dependent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Dependent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Dependent" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Dependent_email_key" ON "public"."Dependent"("email");
