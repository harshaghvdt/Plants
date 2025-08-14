import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from './storage';
import { NewUser } from '@shared/schema';
import { db } from './db';
import { otps } from '@shared/schema';
import { eq } from 'drizzle-orm';

// JWT secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate JWT token
function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}

// Authentication middleware
export function isAuthenticated(req: Request, res: Response, next: Function) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Add user info to request
    (req as any).user = { id: decoded.userId };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
}

// Send OTP for registration
export async function sendOTP(req: Request, res: Response) {
  try {
    const { phone } = req.body;
    
    // Check if user already exists
    const existingUser = await storage.getUserByPhone(phone);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await db.insert(otps).values({
      phone,
      otp,
      expiresAt,
    });

    // In development, log the OTP
    if (process.env.NODE_ENV === 'development') {
      console.log(`OTP for ${phone}: ${otp}`);
    }

    res.json({ 
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(400).json({ message: 'Invalid phone number' });
  }
}

// Verify OTP and register user
export async function verifyOTPAndRegister(req: Request, res: Response) {
  try {
    const data = req.body;
    
    // Verify OTP
    const [otpRecord] = await db.select().from(otps).where(eq(otps.phone, data.phone));
    
    if (!otpRecord || otpRecord.otp !== data.otp || otpRecord.isUsed || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    await db.update(otps).set({ isUsed: true }).where(eq(otps.id, otpRecord.id));

    // Create user
    const userId = await storage.createUser({
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      accountType: data.accountType,
      email: data.email,
      bio: data.bio,
      location: data.location,
      website: data.website,
      profileImageUrl: data.profileImageUrl,
    });

    // Generate token
    const token = generateToken(userId);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        accountType: data.accountType,
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(400).json({ message: 'Registration failed' });
  }
}

// Login (send OTP)
export async function login(req: Request, res: Response) {
  try {
    const { phone } = req.body;
    
    // Check if user exists
    const existingUser = await storage.getUserByPhone(phone);
    if (!existingUser) {
      return res.status(400).json({ message: 'User not found. Please register first.' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await db.insert(otps).values({
      phone,
      otp,
      expiresAt,
    });

    // In development, log the OTP
    if (process.env.NODE_ENV === 'development') {
      console.log(`OTP for ${phone}: ${otp}`);
    }

    res.json({ 
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Error sending login OTP:', error);
    res.status(400).json({ message: 'Invalid phone number' });
  }
}

// Verify login OTP
export async function verifyLoginOTP(req: Request, res: Response) {
  try {
    const { phone, otp } = req.body;
    
    // Verify OTP
    const [otpRecord] = await db.select().from(otps).where(eq(otps.phone, phone));
    
    if (!otpRecord || otpRecord.otp !== otp || otpRecord.isUsed || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    await db.update(otps).set({ isUsed: true }).where(eq(otps.id, otpRecord.id));

    // Get user
    const user = await storage.getUserByPhone(phone);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        accountType: user.accountType,
        isVerified: user.isVerified,
        verificationType: user.verificationType,
      }
    });
  } catch (error) {
    console.error('Error verifying login OTP:', error);
    res.status(400).json({ message: 'Login verification failed' });
  }
}

// Logout
export async function logout(req: Request, res: Response) {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
}

// Get current user
export async function getCurrentUser(req: Request, res: Response) {
  try {
    const user = await storage.getUser((req as any).user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        bio: user.bio,
        location: user.location,
        website: user.website,
        profileImageUrl: user.profileImageUrl,
        accountType: user.accountType,
        isVerified: user.isVerified,
        verificationType: user.verificationType,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Failed to get user information' });
  }
}
