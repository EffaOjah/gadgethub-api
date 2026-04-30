import prisma from './src/lib/prisma';

async function main() {
  console.log('🚀 Starting manual database migration via raw SQL...');
  try {
    // 1. phoneNumber
    console.log('Adding phoneNumber column...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT`);
    
    // 2. location
    console.log('Adding location column...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "location" TEXT`);
    
    // 3. bio
    console.log('Adding bio column...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT`);
    
    // 4. techPresence
    console.log('Adding techPresence column...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "techPresence" TEXT`);
    
    // 5. isVerified
    console.log('Adding isVerified column...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false`);
    
    // 6. joinDate
    console.log('Adding joinDate column...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "joinDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`);

    console.log('✅ Manual migration completed successfully!');
  } catch (err) {
    console.error('❌ Manual migration failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
