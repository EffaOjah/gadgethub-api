import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

const sellerRegistrationSchema = z.object({
  name: z.string().trim().min(2, 'Business name is required'),
  logo: z.string().trim().url('Logo must be a valid URL'),
  about: z.string().trim().min(20, 'About must be at least 20 characters').max(1000, 'About must be 1000 characters or less'),
  phoneNumber: z.string().trim().min(7, 'Phone number is required').max(30, 'Phone number is too long'),
  location: z.string().trim().min(2, 'Store address is required'),
  city: z.string().trim().min(2, 'City or state is required'),
  specialty: z.string().trim().min(2, 'Specialty is required'),
});

const sellerProfileUpdateSchema = sellerRegistrationSchema.pick({
  name: true,
  logo: true,
  about: true,
  phoneNumber: true,
  location: true,
  city: true,
  specialty: true,
});

const sellerGadgetSchema = z.object({

  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be 2000 characters or less'),
  specs: z.record(z.string(), z.any()).optional().default({}),
  images: z.array(z.string().trim().min(1, 'Image path must not be empty')).max(5, 'A seller gadget can have at most 5 images').default([]),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  priceBadge: z.enum(['NEGOTIABLE', 'NON_NEGOTIABLE']).default('NON_NEGOTIABLE'),
});

const getVerifiedSellerForUser = async (userId: string) => {
  return prisma.seller.findFirst({
    where: {
      userId,
      isVerified: true
    }
  });
};

/**
 * Get all sellers
 * Supports optional filtering by city or specialty
 */
export const getAllSellers = async (req: Request, res: Response) => {
  try {
    const { city, specialty } = req.query;

    const sellers = await prisma.seller.findMany({
      where: {
        AND: [
          { isVerified: true },
          city ? { city: String(city) } : {},
          specialty ? { specialty: String(specialty) } : {}
        ]
      },
      include: {
        _count: {
          select: { gadgets: true }
        }
      },
      orderBy: {
        rating: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      data: sellers
    });
  } catch (error: any) {
    console.error('Error fetching sellers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sellers'
    });
  }
};

/**
 * Get latest seller gadgets (public) — for Today's Deals section
 */
export const getAllSellerGadgets = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 8, 20);

    const gadgets = await prisma.sellerGadget.findMany({
      where: {
        seller: { isVerified: true }
      },
      include: {
        seller: {
          select: { id: true, name: true, logo: true, city: true, isVerified: true, rating: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return res.status(200).json({ success: true, data: gadgets });
  } catch (error: any) {
    console.error('Error fetching seller gadgets:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch seller gadgets' });
  }
};

/**
 * Increment views on a seller gadget
 */
export const incrementGadgetViews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    
    const updated = await prisma.sellerGadget.update({
      where: { id: String(productId) },
      data: { views: { increment: 1 } }
    });

    return res.status(200).json({ success: true, data: { views: updated.views } });
  } catch (error: any) {
    console.error('Error incrementing gadget views:', error);
    return res.status(500).json({ success: false, message: 'Failed to increment views' });
  }
};

/**
 * Rate a seller by ID (authenticated users only)
 */
export const rateSellerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const parsedRating = Number(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const seller = await prisma.seller.findFirst({ where: { id: String(id), isVerified: true } });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    // Running average formula
    const newCount = seller.reviewCount + 1;
    const newRating = ((seller.rating * seller.reviewCount) + parsedRating) / newCount;

    const updated = await prisma.seller.update({
      where: { id: seller.id },
      data: { rating: Math.round(newRating * 10) / 10, reviewCount: newCount }
    });

    return res.status(200).json({ success: true, data: { rating: updated.rating, reviewCount: updated.reviewCount } });
  } catch (error: any) {
    console.error('Error rating seller:', error);
    return res.status(500).json({ success: false, message: 'Failed to rate seller' });
  }
};

/**
 * Get a single seller by ID
 */
export const getSellerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const seller = await prisma.seller.findFirst({
      where: { id: String(id), isVerified: true },
      include: {
        gadgets: true
      }
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: seller
    });
  } catch (error: any) {
    console.error('Error fetching seller details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch seller details'
    });
  }
};

/**
 * Get current authenticated user's seller application/profile
 */
export const getMySellerProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const seller = await prisma.seller.findUnique({
      where: { userId },
      include: {
        _count: {
          select: { gadgets: true }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: seller
    });
  } catch (error: any) {
    console.error('Error fetching seller profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch seller profile'
    });
  }
};

/**
 * Register as a seller (Current Authenticated User)
 */
export const registerAsSeller = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    if (req.user.role !== 'USER') {
      return res.status(403).json({
        success: false,
        message: 'Only regular user accounts can apply to become sellers'
      });
    }

    const { name, logo, about, phoneNumber, location, city, specialty } = sellerRegistrationSchema.parse(req.body);

    // Check if seller profile already exists
    const existingSeller = await prisma.seller.findUnique({
      where: { userId }
    });

    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: 'You already have a seller profile'
      });
    }

    const newSeller = await prisma.seller.create({
      data: {
        userId,
        name,
        logo,
        about,
        phoneNumber,
        location,
        city,
        specialty,
        isVerified: false // Default to unverified until admin approval
      }
    });

    return res.status(201).json({
      success: true,
      data: newSeller,
      message: 'Seller registration submitted successfully and is pending approval.'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid seller registration details',
        errors: error.format()
      });
    }

    console.error('Error registering as seller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register as seller'
    });
  }
};

/**
 * Update current authenticated seller's verified profile
 */
export const updateMySellerProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const updateData = sellerProfileUpdateSchema.parse(req.body);

    const seller = await prisma.seller.findUnique({
      where: { userId }
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller profile not found'
      });
    }

    if (!seller.isVerified || req.user.role !== 'SELLER') {
      return res.status(403).json({
        success: false,
        message: 'Only verified sellers can update seller dashboard details'
      });
    }

    const updatedSeller = await prisma.seller.update({
      where: { userId },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      data: updatedSeller,
      message: 'Seller profile updated successfully'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid seller profile details',
        errors: error.format()
      });
    }

    console.error('Error updating seller profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update seller profile'
    });
  }
};

/**
 * Get current verified seller's gadget listings
 */
export const getMySellerGadgets = async (req: Request, res: Response) => {
  try {
    const seller = await getVerifiedSellerForUser(req.user.id);

    if (!seller || req.user.role !== 'SELLER') {
      return res.status(403).json({
        success: false,
        message: 'Only verified sellers can view seller gadgets'
      });
    }

    const gadgets = await prisma.sellerGadget.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      data: gadgets
    });
  } catch (error: any) {
    console.error('Error fetching seller gadgets:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch seller gadgets'
    });
  }
};

/**
 * Create a current verified seller's gadget listing
 */
export const createMySellerGadget = async (req: Request, res: Response) => {
  try {
    const seller = await getVerifiedSellerForUser(req.user.id);

    if (!seller || req.user.role !== 'SELLER') {
      return res.status(403).json({
        success: false,
        message: 'Only verified sellers can create seller gadgets'
      });
    }

    const data = sellerGadgetSchema.parse(req.body);

    const gadget = await prisma.sellerGadget.create({
      data: {
        sellerId: seller.id,
        description: data.description,
        specs: data.specs,
        images: data.images,
        price: data.price,
        priceBadge: data.priceBadge
      }
    });

    return res.status(201).json({
      success: true,
      data: gadget,
      message: 'Seller gadget created successfully'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid seller gadget details',
        errors: error.format()
      });
    }

    console.error('Error creating seller gadget:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create seller gadget'
    });
  }
};

/**
 * Update a current verified seller's gadget listing
 */
export const updateMySellerGadget = async (req: Request, res: Response) => {
  try {
    const seller = await getVerifiedSellerForUser(req.user.id);

    if (!seller || req.user.role !== 'SELLER') {
      return res.status(403).json({
        success: false,
        message: 'Only verified sellers can update seller gadgets'
      });
    }

    const { gadgetId } = req.params;
    const data = sellerGadgetSchema.parse(req.body);

    const existing = await prisma.sellerGadget.findFirst({
      where: {
        id: String(gadgetId),
        sellerId: seller.id
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Seller gadget not found'
      });
    }

    const gadget = await prisma.sellerGadget.update({
      where: { id: String(gadgetId) },
      data: {
        description: data.description,
        specs: data.specs,
        images: data.images,
        price: data.price,
        priceBadge: data.priceBadge
      }
    });

    return res.status(200).json({
      success: true,
      data: gadget,
      message: 'Seller gadget updated successfully'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid seller gadget details',
        errors: error.format()
      });
    }

    console.error('Error updating seller gadget:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update seller gadget'
    });
  }
};

/**
 * Delete a current verified seller's gadget listing
 */
export const deleteMySellerGadget = async (req: Request, res: Response) => {
  try {
    const seller = await getVerifiedSellerForUser(req.user.id);

    if (!seller || req.user.role !== 'SELLER') {
      return res.status(403).json({
        success: false,
        message: 'Only verified sellers can delete seller gadgets'
      });
    }

    const { gadgetId } = req.params;
    const existing = await prisma.sellerGadget.findFirst({
      where: {
        id: String(gadgetId),
        sellerId: seller.id
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Seller gadget not found'
      });
    }

    await prisma.sellerGadget.delete({
      where: { id: String(gadgetId) }
    });

    return res.status(200).json({
      success: true,
      message: 'Seller gadget deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting seller gadget:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete seller gadget'
    });
  }
};

/**
 * Create a new seller (Admin only)
 */
export const createSeller = async (req: Request, res: Response) => {
  try {
    const { userId, name, logo, about, phoneNumber, location, city, specialty, isVerified } = req.body;

    const newSeller = await prisma.seller.create({
      data: {
        userId,
        name,
        logo,
        about,
        phoneNumber,
        location,
        city,
        specialty,
        isVerified: !!isVerified
      }
    });

    return res.status(201).json({
      success: true,
      data: newSeller,
      message: 'Seller created successfully'
    });
  } catch (error: any) {
    console.error('Error creating seller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create seller'
    });
  }
};

/**
 * Update an existing seller (Admin only)
 */
export const updateSeller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedSeller = await prisma.seller.update({
      where: { id: String(id) },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      data: updatedSeller,
      message: 'Seller updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating seller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update seller'
    });
  }
};

/**
 * Delete a seller (Admin only)
 */
export const deleteSeller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.seller.delete({
      where: { id: String(id) }
    });

    return res.status(200).json({
      success: true,
      message: 'Seller deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting seller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete seller'
    });
  }
};
