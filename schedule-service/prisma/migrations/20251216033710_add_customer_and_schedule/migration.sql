/*
  Warnings:

  - The primary key for the `Doctor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `specialty` on the `Doctor` table. All the data in the column will be lost.
  - The primary key for the `Schedule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `endTime` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Schedule` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Doctor` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `customerId` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `objective` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduledAt` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `doctorId` on the `Schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_doctorId_fkey";

-- AlterTable
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_pkey",
DROP COLUMN "specialty",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_pkey",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "customerId" UUID NOT NULL,
ADD COLUMN     "objective" TEXT NOT NULL,
ADD COLUMN     "scheduledAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "doctorId",
ADD COLUMN     "doctorId" UUID NOT NULL,
ADD CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Schedule_customerId_idx" ON "Schedule"("customerId");

-- CreateIndex
CREATE INDEX "Schedule_doctorId_idx" ON "Schedule"("doctorId");

-- CreateIndex
CREATE INDEX "Schedule_scheduledAt_idx" ON "Schedule"("scheduledAt");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
