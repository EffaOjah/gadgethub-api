import prisma from './src/lib/prisma';

async function main() {
  try {
    const count = await prisma.user.count();
    console.log('Connection successful via adapter, user count:', count);
  } catch (err) {
    console.error('Connection failed via adapter:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
