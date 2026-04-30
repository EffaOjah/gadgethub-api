import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

// Ensure env variables are loaded if this file is imported early
dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for connecting to Render PostgreSQL externally
  }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
