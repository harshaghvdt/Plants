import type { NewUser, NewPost, NewNotification, NewVerificationRequest } from "@shared/schema";
import { MemoryStorage } from "./memory-storage";

export interface IStorage {
  // User management
  getUser(id: string): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  getUserByPhone(phone: string): Promise<any | undefined>;
  createUser(userData: NewUser): Promise<any>;
  upsertUser(userData: NewUser): Promise<any>;
  updateUserStats(userId: string): Promise<void>;
  
  // Post management
  createPost(postData: NewPost): Promise<any>;
  getPost(id: string): Promise<any | undefined>;
  getPostsByUser(userId: string): Promise<any[]>;
  getTimeline(userId: string): Promise<any[]>;
  getReplies(postId: string): Promise<any[]>;
  
  // Follow management
  followUser(followerId: string, followingId: string): Promise<void>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getFollowingStatus(followerId: string, followingId: string): Promise<boolean>;
  
  // Like/Share management
  likePost(userId: string, postId: string): Promise<void>;
  unlikePost(userId: string, postId: string): Promise<void>;
  sharePost(userId: string, postId: string): Promise<void>;
  unsharePost(userId: string, postId: string): Promise<void>;
  
  // Notification management
  createNotification(notificationData: NewNotification): Promise<any>;
  getNotifications(userId: string): Promise<any[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  
  // Verification management
  createVerificationRequest(requestData: NewVerificationRequest): Promise<any>;
  getVerificationRequests(userId: string): Promise<any[]>;
  updateVerificationRequest(id: string, status: string, adminNotes?: string, reviewedBy?: string): Promise<void>;
}

// Firebase/Memory storage instance
export const storage: IStorage = new MemoryStorage();

console.log('🔥 Storage configured for Firebase migration');