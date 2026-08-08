import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting minimal development database seed...');

  // Sample Admin User for development testing only
  const adminEmail = 'admin.dev@distro.local';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const adminUser = await prisma.user.create({
      data: {
        name: 'Development System Admin',
        email: adminEmail,
        // Hashed placeholder for dev verification only - not for production use
        password: '$2b$10$DevPlaceholderPasswordHashForPhase2SchemaTestOnly',
        role: Role.ADMIN
      }
    });
    console.log(`✅ Sample Dev Admin user created: ${adminUser.email} (ID: ${adminUser.id})`);
  } else {
    console.log(`ℹ️ Dev Admin user already exists: ${existingAdmin.email}`);
  }

  console.log('🌱 Development seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
