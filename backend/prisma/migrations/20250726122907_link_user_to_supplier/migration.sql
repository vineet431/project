/*
  Warnings:

  - A unique constraint covering the columns `[supplierId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "supplierId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_supplierId_key" ON "User"("supplierId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
