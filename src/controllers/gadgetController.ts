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
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'random') {
      // For random sort in findMany, we'll handle it via raw query or stay with default if complex
      // But for simplicity in the main list, we'll keep the logic and just add the option
    }

    const gadgets = await prisma.gadget.findMany({
      where,
      orderBy,
      include: {
        prices: true,
        category: true,
        reviews: { select: { rating: true } }
      }
    });

    if (sort === 'random') {
      gadgets.sort(() => Math.random() - 0.5);
    }

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
    // Use raw query for RANDOM() as Prisma doesn't support it natively
    const gadgets: any[] = await prisma.$queryRaw`
      SELECT g.*, 
             c.name as "categoryName",
             (SELECT json_agg(p.*) FROM "NigerianPrices" p WHERE p."gadgetId" = g.id) as prices,
             CAST(COUNT(r.id) AS INTEGER) as "reviewCount",
             CAST(COALESCE(AVG(r.rating), 0) AS FLOAT) as "avgRating"
      FROM "Gadget" g
      LEFT JOIN "Category" c ON g."categoryId" = c.id
      LEFT JOIN "Review" r ON r."gadgetId" = g.id
      GROUP BY g.id, c.name
      ORDER BY "reviewCount" DESC, "avgRating" DESC, RANDOM()
      LIMIT 6
    `;

    // Map raw results to match Prisma include structure
    const data = gadgets.map(g => ({
      ...g,
      category: { name: g.categoryName }
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching trending gadgets' });
  }
};

export const getDeals = async (req: Request, res: Response) => {
  try {
    const gadgets: any[] = await prisma.$queryRaw`
      SELECT g.*, 
             c.name as "categoryName",
             (SELECT json_agg(p.*) FROM "Price" p WHERE p."gadgetId" = g.id) as prices
      FROM "Gadget" g
      LEFT JOIN "Category" c ON g."categoryId" = c.id
      ORDER BY RANDOM()
      LIMIT 6
    `;

    const data = gadgets.map(g => ({
      ...g,
      category: { name: g.categoryName },
      reviewCount: 0,
      avgRating: 0
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching deals' });
  }
};

export const getGadgetById = async (req: Request, res: Response) => {
  try {
    const param = String(req.params.id);
    const gadget = await prisma.gadget.findFirst({
      where: {
        OR: [
          { id: param },
          { slug: param }
        ]
      },
      include: {
        prices: true,
        category: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          }
        }
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
  brand: z.string().min(1),
  price: z.number().min(0),
  categoryId: z.string(),
  image: z.string(),
  description: z.string().min(10),
  specs: z.record(z.string(), z.any()).optional().default({}),
});

const generateSlug = async (name: string, excludeId?: string): Promise<string> => {
  let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.gadget.findUnique({ where: { slug } });
    if (!existing || (excludeId && existing.id === excludeId)) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

export const createGadget = async (req: Request, res: Response) => {
  try {
    const validatedData = createGadgetSchema.parse(req.body);
    const slug = await generateSlug(validatedData.name);

    const gadget = await prisma.gadget.create({
      data: { ...validatedData, slug }
    });
    res.status(201).json({ success: true, data: gadget });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Validation Error (Create):', JSON.stringify(error.format(), null, 2));
      res.status(400).json({ success: false, message: 'Invalid data', errors: error.format() });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error creating gadget' });
  }
};
export const updateGadget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = createGadgetSchema.parse(req.body);
    const slug = await generateSlug(validatedData.name, String(id));

    const gadget = await prisma.gadget.update({
      where: { id: String(id) },
      data: { ...validatedData, slug }
    });
    res.json({ success: true, data: gadget });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Validation Error (Update):', JSON.stringify(error.format(), null, 2));
      res.status(400).json({ success: false, message: 'Invalid data', errors: error.format() });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating gadget' });
  }
};

export const deleteGadget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.gadget.delete({ where: { id: String(id) } });
    res.json({ success: true, message: 'Gadget deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting gadget' });
  }
};
