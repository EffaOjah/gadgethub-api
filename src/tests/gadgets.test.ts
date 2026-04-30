import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';

vi.mock('../lib/prisma', () => import('../__mocks__/prisma'));
import prisma from '../lib/prisma';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockReviews = [
  { id: 'r1', rating: 5, gadgetId: 'g1', userId: 'u1' },
  { id: 'r2', rating: 3, gadgetId: 'g1', userId: 'u2' },
];

const mockGadget = {
  id: 'g1',
  name: 'iPhone 16 Pro',
  categoryId: 'cat-1',
  image: 'https://example.com/iphone.jpg',
  originalPrice: 1800000,
  discount: 5,
  description: 'The latest iPhone with Apple Intelligence.',
  specs: { Display: '6.3" OLED', Chip: 'A18 Pro' },
  badges: ['Trending'],
  dealEndTime: null,
  shortSummary: 'Apple\'s flagship for 2024.',
  pros: ['Great camera'],
  cons: ['Expensive'],
  category: { id: 'cat-1', name: 'Smartphones', image: '', badges: [] },
  prices: { id: 'p1', gadgetId: 'g1', jumia: 1750000, konga: 1800000, slot: 1720000, average: 1756667 },
};

// Gadgets as returned from the list endpoint (reviews stripped, avgRating computed)
const mockGadgetList = [
  {
    ...mockGadget,
    reviewCount: 2,
    avgRating: 4.0,
  },
];

// For getGadgetById, reviews are included in full
const mockGadgetWithReviews = {
  ...mockGadget,
  reviews: mockReviews.map(r => ({
    ...r,
    user: { id: r.userId, name: 'Test User', avatar: null },
    comment: 'Great device!',
    pros: [],
    cons: [],
    isVerifiedPurchase: false,
    helpfulCount: 0,
    image: null,
    isFlagged: false,
    createdAt: new Date().toISOString(),
  })),
};

// ─── GET /api/gadgets ─────────────────────────────────────────────────────────

describe('GET /api/gadgets', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 with a list of gadgets including avgRating', async () => {
    (prisma.gadget.findMany as any).mockResolvedValue([
      { ...mockGadget, reviews: mockReviews },
    ]);

    const res = await request(app).get('/api/gadgets');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('avgRating');
    expect(res.body.data[0]).toHaveProperty('reviewCount', 2);
    // avgRating = (5 + 3) / 2 = 4.0
    expect(res.body.data[0].avgRating).toBe(4.0);
    // Reviews array should be stripped from list response
    expect(res.body.data[0]).not.toHaveProperty('reviews');
  });

  it('returns 200 with an empty array when there are no gadgets', async () => {
    (prisma.gadget.findMany as any).mockResolvedValue([]);

    const res = await request(app).get('/api/gadgets');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('passes the search query param to Prisma', async () => {
    (prisma.gadget.findMany as any).mockResolvedValue([]);

    await request(app).get('/api/gadgets?search=iPhone');

    expect(prisma.gadget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: expect.objectContaining({ contains: 'iPhone' }),
        }),
      })
    );
  });

  it('returns 500 when Prisma throws an error', async () => {
    (prisma.gadget.findMany as any).mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/api/gadgets');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/gadgets/:id ─────────────────────────────────────────────────────

describe('GET /api/gadgets/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 with the gadget, its reviews, and computed avgRating', async () => {
    (prisma.gadget.findUnique as any).mockResolvedValue(mockGadgetWithReviews);

    const res = await request(app).get('/api/gadgets/g1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('g1');
    expect(res.body.data).toHaveProperty('avgRating', 4.0);
    expect(res.body.data).toHaveProperty('reviewCount', 2);
    expect(Array.isArray(res.body.data.reviews)).toBe(true);
  });

  it('returns 404 when the gadget is not found', async () => {
    (prisma.gadget.findUnique as any).mockResolvedValue(null);

    const res = await request(app).get('/api/gadgets/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);
  });

  it('returns 500 when Prisma throws an error', async () => {
    (prisma.gadget.findUnique as any).mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/api/gadgets/g1');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
