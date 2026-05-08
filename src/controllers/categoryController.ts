import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching categories' });
  }
};

const createCategorySchema = z.object({
  name: z.string().min(2),
  image: z.string().url(),
  badges: z.array(z.string()).optional(),
  discount: z.number().int().optional(),
});

export const createCategory = async (req: Request, res: Response) => {
  try {
    const validatedData = createCategorySchema.parse(req.body);

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        image: validatedData.image,
        badges: validatedData.badges || [],
        discount: validatedData.discount,
      }
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Invalid data', errors: error.format() });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error creating category' });
  }
};
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = createCategorySchema.parse(req.body);

    const category = await prisma.category.update({
      where: { id: String(id) },
      data: {
        name: validatedData.name,
        image: validatedData.image,
        badges: validatedData.badges || [],
        discount: validatedData.discount,
      }
    });
    res.json({ success: true, data: category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Invalid data', errors: error.format() });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error updating category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id: String(id) } });
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting category' });
  }
};
