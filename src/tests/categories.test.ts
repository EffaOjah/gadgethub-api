import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';

vi.mock('../lib/prisma', () => import('../__mocks__/prisma'));
import prisma from '../lib/prisma';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockCategories = [
  { id: 'cat-1', name: 'Smartphones', image: 'https://example.com/phones.jpg', badges: ['Hot'], discount: 10 },
  { id: 'cat-2', name: 'Laptops & PCs', image: 'https://example.com/laptops.jpg', badges: [], discount: null },
];

// ─── GET /api/categories ──────────────────────────────────────────────────────

describe('GET /api/categories', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 with an array of categories', async () => {
    (prisma.category.findMany as any).mockResolvedValue(mockCategories);

    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].name).toBe('Smartphones');
  });

  it('returns 200 with an empty array when no categories exist', async () => {
    (prisma.category.findMany as any).mockResolvedValue([]);

    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns 500 when Prisma throws an error', async () => {
    (prisma.category.findMany as any).mockRejectedValue(new Error('DB connection lost'));

    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/server error/i);
  });
});
