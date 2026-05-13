import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

// Validation for profile update
const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional().nullable(),
  techPresence: z.string().optional().nullable(),
});

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        phoneNumber: true,
        location: true,
        bio: true,
        techPresence: true,
        isVerified: true,
        joinDate: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, avatar, phoneNumber, location, bio, techPresence } = updateProfileSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        avatar: avatar === undefined ? undefined : avatar,
        phoneNumber: phoneNumber === undefined ? undefined : phoneNumber,
        location: location === undefined ? undefined : location,
        bio: bio === undefined ? undefined : bio,
        techPresence: techPresence === undefined ? undefined : techPresence,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        phoneNumber: true,
        location: true,
        bio: true,
        techPresence: true,
        isVerified: true,
      },
    });

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0].message });
    }
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

/**
 * @desc    Get current user's reviews
 * @route   GET /api/users/reviews
 * @access  Private
 */
export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        gadget: {
          select: {
            id: true,
            slug: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ success: false, message: 'Server error fetching reviews' });
  }
};

/**
 * @desc    Get public user profile
 * @route   GET /api/users/:id
 * @access  Public
 */
export const getPublicProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        name: true,
        avatar: true,
        location: true,
        bio: true,
        techPresence: true,
        isVerified: true,
        joinDate: true,
        reviews: {
          include: {
            gadget: {
              select: {
                id: true,
                slug: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user details' });
  }
};

/**
 * @desc    Upload user avatar
 * @route   POST /api/users/avatar
 * @access  Private
 */
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
      select: { id: true, name: true, avatar: true }
    });

    res.json({ success: true, data: user, message: 'Avatar updated successfully' });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ success: false, message: 'Server error uploading avatar' });
  }
};
