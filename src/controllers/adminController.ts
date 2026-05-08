import { Request, Response } from 'express';
import prisma from '../lib/prisma';

/**
 * Get Dashboard Stats
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [userCount, sellerCount, gadgetCount, reviewCount, pendingSellers] = await Promise.all([
      prisma.user.count(),
      prisma.seller.count(),
      prisma.gadget.count(),
      prisma.review.count(),
      prisma.seller.count({ where: { isVerified: false } })
    ]);

    // Get recent activity (e.g., last 5 reviews)
    const recentReviews = await prisma.review.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, avatar: true } },
        gadget: { select: { name: true } }
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers: userCount,
          totalSellers: sellerCount,
          totalGadgets: gadgetCount,
          totalReviews: reviewCount,
          pendingSellerRequests: pendingSellers
        },
        recentReviews
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
};

/**
 * Get all seller requests (unverified)
 */
export const getSellerRequests = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.seller.findMany({
      where: { isVerified: false },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { memberSince: 'desc' }
    });

    return res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching seller requests:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch requests' });
  }
};

/**
 * Approve Seller
 */
export const approveSeller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const seller = await prisma.seller.findUnique({ where: { id: String(id) } });

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    // Update Seller and User Role
    await prisma.$transaction([
      prisma.seller.update({
        where: { id: String(id) },
        data: { isVerified: true }
      }),
      prisma.user.update({
        where: { id: seller.userId },
        data: { role: 'SELLER' }
      })
    ]);

    return res.status(200).json({ success: true, message: 'Seller approved successfully' });
  } catch (error) {
    console.error('Error approving seller:', error);
    return res.status(500).json({ success: false, message: 'Failed to approve seller' });
  }
};

/**
 * Reject/Delete Seller Request
 */
export const rejectSeller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.seller.delete({ where: { id: String(id) } });

    return res.status(200).json({ success: true, message: 'Seller request rejected and removed' });
  } catch (error) {
    console.error('Error rejecting seller:', error);
  }
};

/**
 * Get all users
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: { joinDate: 'desc' }
    });

    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

/**
 * Toggle User Status (Active/Suspended)
 */
export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id: String(id) } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

    const updatedUser = await prisma.user.update({
      where: { id: String(id) },
      data: { status: newStatus }
    });

    return res.status(200).json({ 
      success: true, 
      message: `User ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'} successfully`,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
};
