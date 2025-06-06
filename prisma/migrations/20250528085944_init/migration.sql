/*
  Warnings:

  - The `lastUpdated` column on the `Agent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
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
  - Made the column `locality` on table `user_locations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `street` on table `user_locations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `municipal` on table `user_locations` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('SUPER_ADMIN', 'SUPER_MUNICIPAL_ADMIN', 'SUPER_STATE_ADMIN', 'DEPT_MUNICIPAL_ADMIN', 'DEPT_STATE_ADMIN');

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
ALTER TABLE "Agent" DROP COLUMN "lastUpdated",
ADD COLUMN     "lastUpdated" "Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "department_municipal_admins" ADD COLUMN     "currentWorkload" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "workloadLimit" INTEGER NOT NULL DEFAULT 10,
DROP COLUMN "accessLevel",
ADD COLUMN     "accessLevel" "AccessLevel" NOT NULL DEFAULT 'DEPT_MUNICIPAL_ADMIN',
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "department_state_admins" DROP COLUMN "systemicIssuesIdentified",
ADD COLUMN     "escalationCount" INTEGER NOT NULL DEFAULT 0,
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

-- AlterTable
ALTER TABLE "user_locations" ALTER COLUMN "locality" SET NOT NULL,
ALTER COLUMN "street" SET NOT NULL,
ALTER COLUMN "municipal" SET NOT NULL;
