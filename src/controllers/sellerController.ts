import { Request, Response } from 'express';
import prisma from '../lib/prisma';

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
 * Get a single seller by ID
 */
export const getSellerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const seller = await prisma.seller.findUnique({
      where: { id: String(id) },
      include: {
        gadgets: {
          include: {
            gadget: true
          }
        }
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
 * Register as a seller (Current Authenticated User)
 */
export const registerAsSeller = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, logo, location, city, specialty } = req.body;

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
    console.error('Error registering as seller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register as seller'
    });
  }
};

/**
 * Create a new seller (Admin only)
 */
export const createSeller = async (req: Request, res: Response) => {
  try {
    const { userId, name, logo, location, city, specialty, isVerified } = req.body;

    const newSeller = await prisma.seller.create({
      data: {
        userId,
        name,
        logo,
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
