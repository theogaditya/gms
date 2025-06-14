/*
  Warnings:

  - You are about to drop the column `autonomyLevel` on the `Agent` table. All the data in the column will be lost.
  - The `accessLevel` column on the `Agent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Agent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `accessLevel` column on the `department_municipal_admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `department_municipal_admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `systemicIssuesIdentified` on the `department_state_admins` table. All the data in the column will be lost.
  - The `accessLevel` column on the `department_state_admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `department_state_admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `accessLevel` column on the `super_admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `super_admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `accessLevel` column on the `super_municipal_admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `super_municipal_admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `accessLevel` column on the `super_state_admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `super_state_admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `department` on the `Agent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `department` on the `department_municipal_admins` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `department` on the `department_state_admins` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "userStatus" AS ENUM ('ACTIVE', 'DELETED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('SUPER_ADMIN', 'SUPER_MUNICIPAL_ADMIN', 'SUPER_STATE_ADMIN', 'DEPT_MUNICIPAL_ADMIN', 'DEPT_STATE_ADMIN', 'AGENT');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('INFRASTRUCTURE', 'EDUCATION', 'REVENUE', 'HEALTH', 'WATER_SUPPLY_SANITATION', 'ELECTRICITY_POWER', 'TRANSPORTATION', 'MUNICIPAL_SERVICES', 'POLICE_SERVICES', 'ENVIRONMENT', 'HOUSING_URBAN_DEVELOPMENT', 'SOCIAL_WELFARE', 'PUBLIC_GRIEVANCES');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ComplaintStatus" ADD VALUE 'ESCALATED_TO_MUNICIPAL_LEVEL';
ALTER TYPE "ComplaintStatus" ADD VALUE 'ESCALATED_TO_STATE_LEVEL';

-- DropIndex
DROP INDEX "Complaint_complainantId_key";

-- DropIndex
DROP INDEX "department_municipal_admins_adminId_key";

-- DropIndex
DROP INDEX "department_state_admins_adminId_key";

-- DropIndex
DROP INDEX "super_admins_adminId_key";

-- DropIndex
DROP INDEX "super_municipal_admins_adminId_key";

-- DropIndex
DROP INDEX "super_state_admins_adminId_key";

-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "autonomyLevel",
DROP COLUMN "department",
ADD COLUMN     "department" "Department" NOT NULL,
DROP COLUMN "accessLevel",
ADD COLUMN     "accessLevel" "AccessLevel" NOT NULL DEFAULT 'AGENT',
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Complaint" ALTER COLUMN "status" SET DEFAULT 'UNDER_PROCESSING',
ALTER COLUMN "isPublic" SET DEFAULT true;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "status",
ADD COLUMN     "status" "userStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "department_municipal_admins" ADD COLUMN     "currentWorkload" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "workloadLimit" INTEGER NOT NULL DEFAULT 10,
DROP COLUMN "department",
ADD COLUMN     "department" "Department" NOT NULL,
DROP COLUMN "accessLevel",
ADD COLUMN     "accessLevel" "AccessLevel" NOT NULL DEFAULT 'DEPT_MUNICIPAL_ADMIN',
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "department_state_admins" DROP COLUMN "systemicIssuesIdentified",
ADD COLUMN     "escalationCount" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "department",
ADD COLUMN     "department" "Department" NOT NULL,
DROP COLUMN "accessLevel",
ADD COLUMN     "accessLevel" "AccessLevel" NOT NULL DEFAULT 'DEPT_STATE_ADMIN',
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "managedMunicipalities" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "super_admins" DROP COLUMN "accessLevel",
ADD COLUMN     "accessLevel" "AccessLevel" NOT NULL DEFAULT 'SUPER_ADMIN',
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "super_municipal_admins" DROP COLUMN "accessLevel",
ADD COLUMN     "accessLevel" "AccessLevel" NOT NULL DEFAULT 'SUPER_MUNICIPAL_ADMIN',
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "super_state_admins" DROP COLUMN "accessLevel",
ADD COLUMN     "accessLevel" "AccessLevel" NOT NULL DEFAULT 'SUPER_STATE_ADMIN',
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';
