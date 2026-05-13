import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

// Validation Schema for creating a review
const createReviewSchema = z.object({
  gadgetId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(5),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  image: z.string().optional()
});

export const createReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const validatedData = createReviewSchema.parse(req.body);

    // Check if user already reviewed this gadget
    const existingReview = await prisma.review.findFirst({
      where: {
        gadgetId: validatedData.gadgetId,
        userId: userId
      }
    });

    if (existingReview) {
      res.status(400).json({ success: false, message: 'You have already reviewed this gadget.' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        ...validatedData,
        userId
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      }
    });

    res.status(201).json({ success: true, data: review, message: 'Review submitted successfully.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Invalid data', errors: error.format() });
      return;
    }
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: 'Server error creating review' });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const validatedData = createReviewSchema.parse(req.body);

    const existingReview = await prisma.review.findUnique({
      where: { id: String(id) }
    });

    if (!existingReview) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    if (existingReview.userId !== userId) {
      res.status(403).json({ success: false, message: 'You can only edit your own reviews' });
      return;
    }

    const review = await prisma.review.update({
      where: { id: String(id) },
      data: {
        rating: validatedData.rating,
        title: validatedData.title,
        comment: validatedData.comment,
        pros: validatedData.pros,
        cons: validatedData.cons,
        image: validatedData.image
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      }
    });

    res.json({ success: true, data: review, message: 'Review updated successfully.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Invalid data', errors: error.format() });
      return;
    }
    console.error('Error updating review:', error);
    res.status(500).json({ success: false, message: 'Server error updating review' });
  }
};

export const getGadgetReviews = async (req: Request, res: Response) => {
  try {
    const { gadgetId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { gadgetId: String(gadgetId) },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Server error fetching reviews' });
  }
};

export const markReviewHelpful = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // In a real app, you'd want to track which user marked which review as helpful
    // to prevent multiple votes from the same user. For now, just increment.
    const review = await prisma.review.update({
      where: { id: String(id) },
      data: {
        helpfulCount: { increment: 1 }
      }
    });

    res.json({ success: true, message: 'Review marked as helpful', data: review });
  } catch (error) {
    console.error('Error marking review helpful:', error);
    res.status(500).json({ success: false, message: 'Server error updating review' });
  }
};

export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const category = req.query.category as string;
    
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category && category !== 'All Reviews') {
      where.gadget = {
        category: {
          name: { equals: category, mode: 'insensitive' }
        }
      };
    }

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          gadget: { select: { id: true, name: true, image: true, slug: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ success: false, message: 'Server error fetching reviews' });
  }
};
