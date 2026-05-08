import prisma from '../src/lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  const email = 'admin@gadgethub.ng';
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      status: 'ACTIVE'
    },
    create: {
      email,
      name: 'System Admin',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  console.log('Admin user created/updated:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
