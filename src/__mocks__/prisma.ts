import { vi } from 'vitest';

// Shared Prisma mock object
const prismaMock = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
  gadget: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  category: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  review: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
};

// We export the mock object directly
export default prismaMock;
