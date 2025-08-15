// Firebase Authentication replacement for the current auth system
import type { Request, Response, NextFunction } from 'express';

// Temporary in-memory session store for Firebase migration
const sessions = new Map();

export interface FirebaseUser {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  accountType: string;
  isVerified: boolean;
}

// Middleware to authenticate requests using Firebase tokens or fallback
export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  try {
    // For now, use session-based auth during transition
    const sessionId = req.cookies?.sessionId;
    
    if (sessionId && sessions.has(sessionId)) {
      (req as any).user = sessions.get(sessionId);
      return next();
    }

    // Check for Firebase ID token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // TODO: Verify Firebase ID token when Firebase is installed
      // For now, return unauthorized
      return res.status(401).json({ message: 'Invalid token' });
    }

    return res.status(401).json({ message: 'No token provided' });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}

// Phone OTP based authentication (Firebase Auth compatible)
export async function sendOTP(req: Request, res: Response) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP temporarily (in production, use Firebase Auth phone verification)
    const otpData = {
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      isUsed: false
    };

    // For development, log the OTP
    console.log(`🔐 OTP for ${phone}: ${otp}`);

    // TODO: Send actual SMS using Firebase Auth or Twilio
    
    res.json({ 
      message: 'OTP sent successfully',
      // In development, return OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
}

export async function verifyOTPAndRegister(req: Request, res: Response) {
  try {
    const { phone, otp, firstName, lastName, username, accountType, email } = req.body;

    // Basic validation
    if (!phone || !otp || !firstName || !lastName || !username || !accountType) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // For development, accept any OTP that's 6 digits
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Invalid OTP format' });
    }

    // Create user object
    const userData: FirebaseUser = {
      id: `user_${Date.now()}`, // Generate temporary ID
      phone,
      firstName,
      lastName,
      username,
      email,
      accountType,
      isVerified: false
    };

    // Create session
    const sessionId = `session_${Date.now()}_${Math.random()}`;
    sessions.set(sessionId, userData);

    // Set session cookie
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict'
    });

    res.json({
      message: 'User registered and logged in successfully',
      user: userData
    });
  } catch (error) {
    console.error('Verify OTP and register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Generate and send OTP
    await sendOTP(req, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
}

export async function verifyLoginOTP(req: Request, res: Response) {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    // For development, accept any 6-digit OTP
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mock user lookup - in production, this would query Firebase/Firestore
    const mockUser: FirebaseUser = {
      id: `user_${phone}`,
      phone,
      firstName: 'Demo',
      lastName: 'User',
      username: `user${phone.slice(-4)}`,
      accountType: 'enthusiast',
      isVerified: false
    };

    // Create session
    const sessionId = `session_${Date.now()}_${Math.random()}`;
    sessions.set(sessionId, mockUser);

    // Set session cookie
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict'
    });

    res.json({
      message: 'Login successful',
      user: mockUser
    });
  } catch (error) {
    console.error('Verify login OTP error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const sessionId = req.cookies?.sessionId;
    
    if (sessionId && sessions.has(sessionId)) {
      sessions.delete(sessionId);
    }

    // Clear session cookie
    res.clearCookie('sessionId');
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
}