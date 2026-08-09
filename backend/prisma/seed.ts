import { PrismaClient } from '@prisma/client';
import * as PrismaModule from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// Resilient Role Enum lookup (supports both UserRole and Role definitions)
const RoleEnum: any = (PrismaModule as any).UserRole || (PrismaModule as any).Role || {
  ADMIN: 'ADMIN',
  SALES: 'SALES',
  WAREHOUSE: 'WAREHOUSE',
  ACCOUNTS: 'ACCOUNTS'
};

export interface DemoAccount {
  name: string;
  email: string;
  passwordRaw: string;
  role: any;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: 'System Administrator',
    email: 'admin@erp.local',
    passwordRaw: process.env.ADMIN_SEED_PASSWORD || 'AdminPass123!',
    role: RoleEnum.ADMIN
  },
  {
    name: 'Sales Representative',
    email: 'sales@erp.local',
    passwordRaw: process.env.SALES_SEED_PASSWORD || 'SalesPass123!',
    role: RoleEnum.SALES
  },
  {
    name: 'Warehouse Manager',
    email: 'warehouse@erp.local',
    passwordRaw: process.env.WAREHOUSE_SEED_PASSWORD || 'WarehousePass123!',
    role: RoleEnum.WAREHOUSE
  },
  {
    name: 'Financial Accountant',
    email: 'accounts@erp.local',
    passwordRaw: process.env.ACCOUNTS_SEED_PASSWORD || 'AccountsPass123!',
    role: RoleEnum.ACCOUNTS
  }
];

async function main() {
  console.log('🌱 Starting Phase 3 Development Role Accounts Seeding...');

  try {
    for (const account of DEMO_ACCOUNTS) {
      const passwordHash = await bcrypt.hash(account.passwordRaw, SALT_ROUNDS);

      const user = await (prisma.user as any).upsert({
        where: { email: account.email },
        update: {
          name: account.name,
          password: passwordHash,
          role: account.role
        },
        create: {
          name: account.name,
          email: account.email,
          password: passwordHash,
          role: account.role
        }
      });

      console.log(`✅ Seeded Role Account [${account.role}]: ${user.email} (ID: ${user.id})`);
    }

    console.log('🌱 All 4 Development Role Test Accounts seeded successfully.');
  } catch (e: any) {
    console.warn('⚠️ Could not connect to PostgreSQL database to seed test accounts.');
    console.warn(`Reason: ${e.message ? e.message.split('\n')[0] : e}`);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
