import prisma from './src/lib/prisma';

async function main() {
  try {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        phoneNumber: true
      }
    });
    console.log('Query successful, user:', user);
  } catch (err) {
    console.error('Query failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
