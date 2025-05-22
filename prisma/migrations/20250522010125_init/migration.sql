-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('REGISTERED', 'UNDER_PROCESSING', 'FORWARDED', 'ON_HOLD', 'COMPLETED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "aadhaarId" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'English',
    "disability" TEXT DEFAULT 'None',
    "consentDataCollection" BOOLEAN NOT NULL DEFAULT true,
    "dateOfCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_locations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "locality" TEXT,
    "street" TEXT,
    "municipal" TEXT,

    CONSTRAINT "user_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "officialEmail" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "autonomyLevel" TEXT NOT NULL,
    "accessLevel" TEXT NOT NULL,
    "workloadLimit" INTEGER NOT NULL DEFAULT 10,
    "currentWorkload" INTEGER NOT NULL DEFAULT 0,
    "availabilityStatus" TEXT NOT NULL DEFAULT 'At Work',
    "dateOfCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "lastLogin" TIMESTAMP(3),
    "resolutionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgResolutionTime" TEXT,
    "collaborationMetric" INTEGER NOT NULL DEFAULT 0,
    "managedByMunicipalId" TEXT,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_municipal_admins" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "officialEmail" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "accessLevel" TEXT NOT NULL,
    "dateOfCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "lastLogin" TIMESTAMP(3),
    "resolutionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "slaComplianceRate" DOUBLE PRECISION DEFAULT 0,
    "escalationCount" INTEGER NOT NULL DEFAULT 0,
    "managedByStateAdminId" TEXT,
    "managedBySuperMunicipalId" TEXT,

    CONSTRAINT "department_municipal_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "super_municipal_admins" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "officialEmail" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "municipality" TEXT NOT NULL,
    "accessLevel" TEXT NOT NULL,
    "dateOfCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "lastLogin" TIMESTAMP(3),
    "municipalityResolutionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "crossDepartmentSuccess" INTEGER NOT NULL DEFAULT 0,
    "managedBySuperStateId" TEXT,

    CONSTRAINT "super_municipal_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_state_admins" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "officialEmail" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "department" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "accessLevel" TEXT NOT NULL,
    "dateOfCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "lastLogin" TIMESTAMP(3),
    "stateResolutionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "systemicIssuesIdentified" INTEGER NOT NULL DEFAULT 0,
    "managedMunicipalities" TEXT[],
    "managedBySuperStateId" TEXT,

    CONSTRAINT "department_state_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "super_state_admins" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "officialEmail" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "password" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "accessLevel" TEXT NOT NULL,
    "dateOfCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "lastLogin" TIMESTAMP(3),
    "stateResolutionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "crossDepartmentSuccess" INTEGER NOT NULL DEFAULT 0,
    "managedBySuperAdminId" TEXT,

    CONSTRAINT "super_state_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "super_admins" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "officialEmail" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "password" TEXT NOT NULL,
    "accessLevel" TEXT NOT NULL,
    "dateOfCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "super_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subCategories" TEXT[],
    "learnedSubCategories" TEXT[],
    "assignedDepartment" TEXT NOT NULL,
    "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdBySuperAdminId" TEXT,
    "managedByDeptStateAdminId" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_category_mappings" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "originalSubCategory" TEXT NOT NULL,
    "standardizedSubCategory" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_category_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "complainantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subCategory" TEXT NOT NULL,
    "standardizedSubCategory" TEXT,
    "description" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "assignedDepartment" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'REGISTERED',
    "sla" TEXT,
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL,
    "escalationLevel" TEXT,
    "dateOfResolution" TIMESTAMP(3),
    "assignedAgentId" TEXT,
    "managedByMunicipalAdminId" TEXT,
    "moderatedByMunicipalAdminId" TEXT,
    "crossDeptIssueSuperMunicipalId" TEXT,
    "escalatedToStateAdminId" TEXT,
    "escalatedToSuperStateAdminId" TEXT,
    "managedBySuperAdminId" TEXT,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_locations" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "locality" TEXT,
    "street" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "complaint_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upvotes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upvotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_updates" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "news_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "complaintId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regional_workflows" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "municipality" TEXT,
    "category" TEXT NOT NULL,
    "sla" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "regional_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CoAssignedAgentComplaints" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CoAssignedAgentComplaints_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "user_locations_userId_key" ON "user_locations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_email_key" ON "Agent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_employeeId_key" ON "Agent"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_officialEmail_key" ON "Agent"("officialEmail");

-- CreateIndex
CREATE UNIQUE INDEX "department_municipal_admins_adminId_key" ON "department_municipal_admins"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "department_municipal_admins_officialEmail_key" ON "department_municipal_admins"("officialEmail");

-- CreateIndex
CREATE UNIQUE INDEX "super_municipal_admins_adminId_key" ON "super_municipal_admins"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "super_municipal_admins_officialEmail_key" ON "super_municipal_admins"("officialEmail");

-- CreateIndex
CREATE UNIQUE INDEX "department_state_admins_adminId_key" ON "department_state_admins"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "department_state_admins_officialEmail_key" ON "department_state_admins"("officialEmail");

-- CreateIndex
CREATE UNIQUE INDEX "super_state_admins_adminId_key" ON "super_state_admins"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "super_state_admins_officialEmail_key" ON "super_state_admins"("officialEmail");

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_adminId_key" ON "super_admins"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_officialEmail_key" ON "super_admins"("officialEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sub_category_mappings_categoryId_originalSubCategory_key" ON "sub_category_mappings"("categoryId", "originalSubCategory");

-- CreateIndex
CREATE UNIQUE INDEX "complaint_locations_complaintId_key" ON "complaint_locations"("complaintId");

-- CreateIndex
CREATE UNIQUE INDEX "upvotes_userId_complaintId_key" ON "upvotes"("userId", "complaintId");

-- CreateIndex
CREATE INDEX "_CoAssignedAgentComplaints_B_index" ON "_CoAssignedAgentComplaints"("B");

-- AddForeignKey
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_managedByMunicipalId_fkey" FOREIGN KEY ("managedByMunicipalId") REFERENCES "department_municipal_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_municipal_admins" ADD CONSTRAINT "department_municipal_admins_managedByStateAdminId_fkey" FOREIGN KEY ("managedByStateAdminId") REFERENCES "department_state_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_municipal_admins" ADD CONSTRAINT "department_municipal_admins_managedBySuperMunicipalId_fkey" FOREIGN KEY ("managedBySuperMunicipalId") REFERENCES "super_municipal_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "super_municipal_admins" ADD CONSTRAINT "super_municipal_admins_managedBySuperStateId_fkey" FOREIGN KEY ("managedBySuperStateId") REFERENCES "super_state_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_state_admins" ADD CONSTRAINT "department_state_admins_managedBySuperStateId_fkey" FOREIGN KEY ("managedBySuperStateId") REFERENCES "super_state_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "super_state_admins" ADD CONSTRAINT "super_state_admins_managedBySuperAdminId_fkey" FOREIGN KEY ("managedBySuperAdminId") REFERENCES "super_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_createdBySuperAdminId_fkey" FOREIGN KEY ("createdBySuperAdminId") REFERENCES "super_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_managedByDeptStateAdminId_fkey" FOREIGN KEY ("managedByDeptStateAdminId") REFERENCES "department_state_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_category_mappings" ADD CONSTRAINT "sub_category_mappings_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_complainantId_fkey" FOREIGN KEY ("complainantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_managedByMunicipalAdminId_fkey" FOREIGN KEY ("managedByMunicipalAdminId") REFERENCES "department_municipal_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_moderatedByMunicipalAdminId_fkey" FOREIGN KEY ("moderatedByMunicipalAdminId") REFERENCES "department_municipal_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_crossDeptIssueSuperMunicipalId_fkey" FOREIGN KEY ("crossDeptIssueSuperMunicipalId") REFERENCES "super_municipal_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_escalatedToStateAdminId_fkey" FOREIGN KEY ("escalatedToStateAdminId") REFERENCES "department_state_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_escalatedToSuperStateAdminId_fkey" FOREIGN KEY ("escalatedToSuperStateAdminId") REFERENCES "super_state_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_managedBySuperAdminId_fkey" FOREIGN KEY ("managedBySuperAdminId") REFERENCES "super_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_locations" ADD CONSTRAINT "complaint_locations_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upvotes" ADD CONSTRAINT "upvotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upvotes" ADD CONSTRAINT "upvotes_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_updates" ADD CONSTRAINT "news_updates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "department_municipal_admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regional_workflows" ADD CONSTRAINT "regional_workflows_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "department_state_admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoAssignedAgentComplaints" ADD CONSTRAINT "_CoAssignedAgentComplaints_A_fkey" FOREIGN KEY ("A") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoAssignedAgentComplaints" ADD CONSTRAINT "_CoAssignedAgentComplaints_B_fkey" FOREIGN KEY ("B") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
