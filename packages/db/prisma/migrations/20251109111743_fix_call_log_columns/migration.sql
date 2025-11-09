/*
  Warnings:

  - You are about to drop the column `createdAt` on the `CallLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CallLog" DROP COLUMN "createdAt",
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "outcome" TEXT,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
