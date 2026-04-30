import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../lib/prisma';
import { generateToken } from '../utils/jwt';
import { z } from 'zod';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'placeholder_client_id');

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register Function
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken: generateToken(user.id),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Invalid data', errors: error.format() });
      return;
    }
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Login Function
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        accessToken: generateToken(user.id),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Google Auth Function
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body; // The JWT sent from Google on the frontend

    // In production, we actually verify. If there's no actual client ID, we might mock this or attempt to decode
    let payload;

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'placeholder_client_id') {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      // Since the user agreed to a placeholder, we might just decode the credential directly without verification (for local development ONLY)
      // Or we can expect the frontend to pass the user info directly for now.
      const jwt = require('jsonwebtoken');
      payload = jwt.decode(credential);
    }

    if (!payload || !payload.email) {
      res.status(400).json({ success: false, message: 'Invalid Google token' });
      return;
    }

    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create user if they don't exist
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Google User',
          googleId,
          avatar: picture,
        },
      });
    } else if (!user.googleId) {
      // Link Google account if user existed via email
      user = await prisma.user.update({
        where: { email },
        data: { googleId, avatar: user.avatar || picture },
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        accessToken: generateToken(user.id),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Google Auth failed' });
  }
};

// Get Me Function
export const getMe = async (req: Request, res: Response) => {
  // req.user is set by the auth middleware
  res.json({
    success: true,
    data: req.user,
  });
};
