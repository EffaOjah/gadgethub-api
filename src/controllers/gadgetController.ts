import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getGadgets = async (req: Request, res: Response) => {
  try {
    const { search, categoryId, sort } = req.query;

    const where: any = {};
    if (search) {
      where.name = { contains: String(search), mode: 'insensitive' };
    }
    if (categoryId) {
      where.categoryId = String(categoryId);
    }

    let orderBy: any = undefined;
    if (sort === 'price_asc') orderBy = { originalPrice: 'asc' };
    if (sort === 'price_desc') orderBy = { originalPrice: 'desc' };

    const gadgets = await prisma.gadget.findMany({
      where,
      orderBy,
      include: {
        prices: true,
        category: true,
        reviews: { select: { rating: true } }
      }
    });

    // Compute avgRating and reviewCount, then strip the reviews array
    const data = gadgets.map(({ reviews, ...g }) => ({
      ...g,
      reviewCount: reviews.length,
      avgRating: reviews.length
        ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
        : 0
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error fetching gadgets' });
  }
};

export const getTrendingGadgets = async (req: Request, res: Response) => {
  try {
    const gadgets = await prisma.gadget.findMany({
      where: {
        badges: {
          hasSome: ['Trending', '🔥 Most Popular', 'Best Seller', '🔥 Ultimate Flagship']
        }
      },
      take: 6,
      include: {
        prices: true,
        category: true,
        reviews: { select: { rating: true } }
      }
    });

    const data = gadgets.map(({ reviews, ...g }) => ({
      ...g,
      reviewCount: reviews.length,
      avgRating: reviews.length
        ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
        : 0
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching trending gadgets' });
  }
};

export const getDeals = async (req: Request, res: Response) => {
  try {
    const gadgets = await prisma.gadget.findMany({
      where: {
        discount: { gt: 0 }
      },
      take: 6,
      include: {
        prices: true,
        category: true,
        reviews: { select: { rating: true } }
      }
    });

    const data = gadgets.map(({ reviews, ...g }) => ({
      ...g,
      reviewCount: reviews.length,
      avgRating: reviews.length
        ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
        : 0
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching deals' });
  }
};

export const getGadgetById = async (req: Request, res: Response) => {
  try {
    const gadget = await prisma.gadget.findUnique({
      where: { id: String(req.params.id) },
      include: {
        prices: true,
        category: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          }
        },
        sellers: true
      }
    });

    if (!gadget) {
      res.status(404).json({ success: false, message: 'Gadget not found' });
      return;
    }

    // Compute avgRating from the already-included reviews
    const avgRating = gadget.reviews.length
      ? parseFloat((gadget.reviews.reduce((sum, r) => sum + r.rating, 0) / gadget.reviews.length).toFixed(1))
      : 0;

    res.json({ success: true, data: { ...gadget, avgRating, reviewCount: gadget.reviews.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching gadget' });
  }
};

// Admin Endpoints
import { z } from 'zod';

const createGadgetSchema = z.object({
  name: z.string().min(2),
  categoryId: z.string().uuid(),
  image: z.string(),
  originalPrice: z.number().positive().optional(),
  discount: z.number().int().min(0).max(100).optional().default(0),
  description: z.string().min(10),
  specs: z.record(z.string(), z.any()), // Validates JSON object structure
  badges: z.array(z.string()).optional().default([]),
  dealEndTime: z.string().datetime().optional(), // Accepts ISO datetime strings
  shortSummary: z.string().optional(),
  pros: z.array(z.string()).optional().default([]),
  cons: z.array(z.string()).optional().default([]),
});

export const createGadget = async (req: Request, res: Response) => {
  try {
    const validatedData = createGadgetSchema.parse(req.body);

    const gadget = await prisma.gadget.create({
      data: {
        ...validatedData,
        dealEndTime: validatedData.dealEndTime ? new Date(validatedData.dealEndTime) : undefined,
      } as any
    });
    res.status(201).json({ success: true, data: gadget });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Invalid data', errors: error.format() });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error creating gadget' });
  }
};
