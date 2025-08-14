import { Request, Response } from 'express';
import { storage } from './storage';
import { db } from './db';
import { verificationRequests, users } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import { NewVerificationRequest } from '@shared/schema';

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

// Verification request schema (simplified without Zod for now)
interface VerificationRequestData {
  verificationType: 'student' | 'professor_scientist';
  instituteName?: string;
  proofOfWorkUrl?: string;
  selfieUrl?: string;
}

// Submit verification request
export async function submitVerificationRequest(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    const { verificationType, instituteName, proofOfWorkUrl, selfieUrl }: VerificationRequestData = req.body;

    // Get user to check account type and verification deadline
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Check if there's already a pending verification request
    const existingRequests = await storage.getVerificationRequests(userId);
    const hasPendingRequest = existingRequests.some(req => req.status === 'pending');
    if (hasPendingRequest) {
      return res.status(400).json({ message: 'You already have a pending verification request' });
    }

    // Validation based on verification type
    if (verificationType === 'professor_scientist') {
      // Only professors/scientists can apply for this verification
      if (user.accountType !== 'professor_scientist') {
        return res.status(403).json({ 
          message: 'Only professors and scientists can apply for professor/scientist verification' 
        });
      }

      // Check 7-day deadline
      const accountAge = Date.now() - new Date(user.createdAt).getTime();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      if (accountAge > sevenDaysInMs) {
        return res.status(400).json({ 
          message: 'Professor/scientist verification must be applied within 7 days of account creation' 
        });
      }

      // Required fields for professor/scientist
      if (!instituteName || !proofOfWorkUrl || !selfieUrl) {
        return res.status(400).json({ 
          message: 'Institute name, proof of work, and selfie are required for professor/scientist verification' 
        });
      }
    } else if (verificationType === 'student') {
      // Students can verify anytime
      if (user.accountType !== 'student') {
        return res.status(403).json({ 
          message: 'Only students can apply for student verification' 
        });
      }

      // For students, we don't require institute name, proof of work, or selfie
      // They can submit basic proof documents
    }

    // Create verification request
    const verificationRequest = await storage.createVerificationRequest({
      userId,
      verificationType,
      instituteName,
      proofOfWorkUrl,
      selfieUrl,
    });

    res.json({
      message: 'Verification request submitted successfully',
      request: verificationRequest,
    });
  } catch (error) {
    console.error('Error submitting verification request:', error);
    res.status(400).json({ message: 'Failed to submit verification request' });
  }
}

// Get user's verification requests
export async function getUserVerificationRequests(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    const requests = await storage.getVerificationRequests(userId);
    
    res.json(requests);
  } catch (error) {
    console.error('Error getting verification requests:', error);
    res.status(500).json({ message: 'Failed to get verification requests' });
  }
}

// Admin: Get all pending verification requests
export async function getPendingVerificationRequests(req: AuthenticatedRequest, res: Response) {
  try {
    // TODO: Add admin role check
    const requests = await db
      .select({
        id: verificationRequests.id,
        userId: verificationRequests.userId,
        verificationType: verificationRequests.verificationType,
        status: verificationRequests.status,
        instituteName: verificationRequests.instituteName,
        proofOfWorkUrl: verificationRequests.proofOfWorkUrl,
        selfieUrl: verificationRequests.selfieUrl,
        adminNotes: verificationRequests.adminNotes,
        submittedAt: verificationRequests.submittedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          username: users.username,
          accountType: users.accountType,
          phone: users.phone,
        },
      })
      .from(verificationRequests)
      .innerJoin(users, eq(verificationRequests.userId, users.id))
      .where(eq(verificationRequests.status, 'pending'))
      .orderBy(verificationRequests.submittedAt);

    res.json(requests);
  } catch (error) {
    console.error('Error getting pending verification requests:', error);
    res.status(500).json({ message: 'Failed to get pending verification requests' });
  }
}

// Admin: Review verification request
export async function reviewVerificationRequest(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.user.id;

    // TODO: Add admin role check
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected"' });
    }

    // Update verification request
    await storage.updateVerificationRequest(requestId, status, adminNotes, adminId);

    // If approved, update user verification status
    if (status === 'approved') {
      const request = await db
        .select()
        .from(verificationRequests)
        .where(eq(verificationRequests.id, requestId))
        .limit(1);

      if (request.length > 0) {
        const verificationType = request[0].verificationType;
        
        await db.update(users)
          .set({
            isVerified: true,
            verificationType,
            updatedAt: new Date(),
          })
          .where(eq(users.id, request[0].userId));
      }
    }

    res.json({ message: 'Verification request reviewed successfully' });
  } catch (error) {
    console.error('Error reviewing verification request:', error);
    res.status(500).json({ message: 'Failed to review verification request' });
  }
}

// Get verification status for a user
export async function getVerificationStatus(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verificationRequests = await storage.getVerificationRequests(userId);
    const latestRequest = verificationRequests[0]; // Most recent request

    res.json({
      isVerified: user.isVerified,
      verificationType: user.verificationType,
      accountType: user.accountType,
      latestVerificationRequest: latestRequest,
      canApplyForVerification: canApplyForVerification(user),
      verificationDeadline: getVerificationDeadline(user),
    });
  } catch (error) {
    console.error('Error getting verification status:', error);
    res.status(500).json({ message: 'Failed to get verification status' });
  }
}

// Helper function to check if user can apply for verification
function canApplyForVerification(user: any): boolean {
  if (user.isVerified) return false;
  
  if (user.accountType === 'professor_scientist') {
    const accountAge = Date.now() - new Date(user.createdAt).getTime();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    return accountAge <= sevenDaysInMs;
  }
  
  if (user.accountType === 'student') {
    return true; // Students can verify anytime
  }
  
  return false; // Farmers and enthusiasts cannot verify
}

// Helper function to get verification deadline
function getVerificationDeadline(user: any): string | null {
  if (user.accountType === 'professor_scientist' && !user.isVerified) {
    const accountCreationDate = new Date(user.createdAt);
    const deadline = new Date(accountCreationDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    return deadline.toISOString();
  }
  return null;
}
