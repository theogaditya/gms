const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const depts = [
    { name: "Infrastructure", subCategories: [], learnedSubCategories: [], assignedDepartment: "Infrastructure" },
    { name: "Education", subCategories: [], learnedSubCategories: [], assignedDepartment: "Education" },
    { name: "Revenue", subCategories: [], learnedSubCategories: [], assignedDepartment: "Revenue" },
    { name: "Health", subCategories: [], learnedSubCategories: [], assignedDepartment: "Health" },
    { name: "Water Supply & Sanitation", subCategories: [], learnedSubCategories: [], assignedDepartment: "Water Supply & Sanitation" },
    { name: "Electricity & Power", subCategories: [], learnedSubCategories: [], assignedDepartment: "Electricity & Power" },
    { name: "Transportation", subCategories: [], learnedSubCategories: [], assignedDepartment: "Transportation" },
    { name: "Municipal Services", subCategories: [], learnedSubCategories: [], assignedDepartment: "Municipal Services" },
    { name: "Police Services", subCategories: [], learnedSubCategories: [], assignedDepartment: "Police Services" },
    { name: "Environment", subCategories: [], learnedSubCategories: [], assignedDepartment: "Environment" },
    { name: "Housing & Urban Development", subCategories: [], learnedSubCategories: [], assignedDepartment: "Housing & Urban Development" },
    { name: "Social Welfare", subCategories: [], learnedSubCategories: [], assignedDepartment: "Social Welfare" },
    { name: "Public Grievances", subCategories: [], learnedSubCategories: [], assignedDepartment: "Public Grievances" },
  ];

  for (const dept of depts) {
    await prisma.category.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
  }

  console.log(`✅ Seeded ${depts.length} departments`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
