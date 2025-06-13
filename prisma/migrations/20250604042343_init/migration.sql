/*
  Warnings:

  - The `urgency` column on the `Complaint` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `sub_category_mappings` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[seq]` on the table `Complaint` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `department` on the `Agent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `locality` on table `complaint_locations` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `department` on the `department_municipal_admins` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `department` on the `department_state_admins` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "userStatus" AS ENUM ('ACTIVE', 'DELETED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('INFRASTRUCTURE', 'EDUCATION', 'REVENUE', 'HEALTH', 'WATER_SUPPLY_SANITATION', 'ELECTRICITY_POWER', 'TRANSPORTATION', 'MUNICIPAL_SERVICES', 'POLICE_SERVICES', 'ENVIRONMENT', 'HOUSING_URBAN_DEVELOPMENT', 'SOCIAL_WELFARE', 'PUBLIC_GRIEVANCES');

-- CreateEnum
CREATE TYPE "ComplaintUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- DropForeignKey
ALTER TABLE "sub_category_mappings" DROP CONSTRAINT "sub_category_mappings_categoryId_fkey";

-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "department",
ADD COLUMN     "department" "Department" NOT NULL;

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "seq" SERIAL NOT NULL,
DROP COLUMN "urgency",
ADD COLUMN     "urgency" "ComplaintUrgency" NOT NULL DEFAULT 'LOW',
ALTER COLUMN "isPublic" SET DEFAULT true;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "status",
ADD COLUMN     "status" "userStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "complaint_locations" ALTER COLUMN "locality" SET NOT NULL;

-- AlterTable
ALTER TABLE "department_municipal_admins" DROP COLUMN "department",
ADD COLUMN     "department" "Department" NOT NULL;

-- AlterTable
ALTER TABLE "department_state_admins" DROP COLUMN "department",
ADD COLUMN     "department" "Department" NOT NULL;

-- DropTable
DROP TABLE "sub_category_mappings";

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_seq_key" ON "Complaint"("seq");
