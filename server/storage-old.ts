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

// DatabaseStorage class is replaced by Firebase/Memory storage
  // User management
  async getUser(id: string): Promise<any | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByPhone(phone: string): Promise<any | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async createUser(userData: NewUser): Promise<any> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: NewUser): Promise<any> {
    // Generate username if not provided
    if (!userData.username && userData.email) {
      const baseUsername = userData.email.split('@')[0];
      userData.username = baseUsername;
    }

    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStats(userId: string): Promise<void> {
    // Get posts count
    const postsCount = await db.select({ count: count() }).from(posts).where(eq(posts.authorId, userId));
    
    // Get followers count
    const followersCount = await db.select({ count: count() }).from(follows).where(eq(follows.followingId, userId));
    
    // Get following count
    const followingCount = await db.select({ count: count() }).from(follows).where(eq(follows.followerId, userId));
    
    // Update user stats
    await db.update(users)
      .set({
        postsCount: postsCount[0]?.count || 0,
        followersCount: followersCount[0]?.count || 0,
        followingCount: followingCount[0]?.count || 0,
      })
      .where(eq(users.id, userId));
  }

  // Post management
  async createPost(postData: NewPost): Promise<any> {
    const [post] = await db.insert(posts).values(postData).returning();
    
    // Update user stats
    await this.updateUserStats(post.authorId);
    
    return post;
  }

  async getPost(id: string): Promise<any | undefined> {
    const [post] = await db
      .select({
        id: posts.id,
        content: posts.content,
        authorId: posts.authorId,
        replyToId: posts.replyToId,
        category: posts.category,
        metadata: posts.metadata,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .where(eq(posts.id, id));
    
    if (!post) return undefined;
    
    // Get author details
    const author = await this.getUser(post.authorId);
    if (!author) return undefined;
    
    return {
      ...post,
      author,
    };
  }

  async getPostsByUser(userId: string): Promise<any[]> {
    const userPosts = await db
      .select({
        id: posts.id,
        content: posts.content,
        authorId: posts.authorId,
        replyToId: posts.replyToId,
        category: posts.category,
        metadata: posts.metadata,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .where(eq(posts.authorId, userId))
      .orderBy(desc(posts.createdAt));
    
    // Get author details for each post
    const author = await this.getUser(userId);
    if (!author) return [];
    
    return userPosts.map(post => ({
      ...post,
      author,
    }));
  }

  async getTimeline(userId?: string): Promise<any[]> {
    // Get all posts with author details
    const allPosts = await db
      .select({
        id: posts.id,
        content: posts.content,
        authorId: posts.authorId,
        replyToId: posts.replyToId,
        category: posts.category,
        metadata: posts.metadata,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .orderBy(desc(posts.createdAt));
    
    // Get author details for each post
    const postsWithAuthors = await Promise.all(
      allPosts.map(async (post) => {
        const author = await this.getUser(post.authorId);
        if (!author) return null;
        
        // If user is authenticated, check if they liked/shared the post
        let isLiked = false;
        let isShared = false;
        
        if (userId) {
          const [likeRecord] = await db.select().from(likes).where(and(eq(likes.userId, userId), eq(likes.postId, post.id)));
          const [shareRecord] = await db.select().from(shares).where(and(eq(shares.userId, userId), eq(shares.postId, post.id)));
          
          isLiked = !!likeRecord;
          isShared = !!shareRecord;
        }
        
        // Get counts
        const [likesCount] = await db.select({ count: count() }).from(likes).where(eq(likes.postId, post.id));
        const [sharesCount] = await db.select({ count: count() }).from(shares).where(eq(shares.postId, post.id));
        const [repliesCount] = await db.select({ count: count() }).from(posts).where(eq(posts.replyToId, post.id));
        
        return {
          ...post,
          author,
          isLiked,
          isShared,
          likesCount: likesCount?.count || 0,
          sharesCount: sharesCount?.count || 0,
          repliesCount: repliesCount?.count || 0,
        };
      })
    );
    
    return postsWithAuthors.filter(Boolean);
  }

  async getReplies(postId: string): Promise<any[]> {
    const replies = await db
      .select({
        id: posts.id,
        content: posts.content,
        authorId: posts.authorId,
        replyToId: posts.replyToId,
        category: posts.category,
        metadata: posts.metadata,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .where(eq(posts.replyToId, postId))
      .orderBy(desc(posts.createdAt));
    
    // Get author details for each reply
    const repliesWithAuthors = await Promise.all(
      replies.map(async (reply) => {
        const author = await this.getUser(reply.authorId);
        if (!author) return null;
        
        return {
          ...reply,
          author,
        };
      })
    );
    
    return repliesWithAuthors.filter(Boolean);
  }

  // Follow management
  async followUser(followerId: string, followingId: string): Promise<void> {
    await db.insert(follows).values({
      followerId,
      followingId,
    });
    
    await this.updateUserStats(followerId);
    await this.updateUserStats(followingId);
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db.delete(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.followingId, followingId))
    );
    
    await this.updateUserStats(followerId);
    await this.updateUserStats(followingId);
  }

  async getFollowingStatus(followerId: string, followingId: string): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    
    return !!follow;
  }

  // Like/Share management
  async likePost(userId: string, postId: string): Promise<void> {
    // Check if already liked
    const [existingLike] = await db.select().from(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    
    if (existingLike) return; // Already liked
    
    // Add like
    await db.insert(likes).values({ userId, postId });
    
    // Update post stats (this would need to be handled differently since we don't have likesCount column)
    // For now, we'll just add the like record
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
  }

  async sharePost(userId: string, postId: string): Promise<void> {
    // Check if already shared
    const [existingShare] = await db.select().from(shares).where(and(eq(shares.userId, userId), eq(shares.postId, postId)));
    
    if (existingShare) return; // Already shared
    
    // Add share
    await db.insert(shares).values({ userId, postId });
  }

  async unsharePost(userId: string, postId: string): Promise<void> {
    await db.delete(shares).where(and(eq(shares.userId, userId), eq(shares.postId, postId)));
  }

  // Notification management
  async createNotification(notificationData: NewNotification): Promise<any> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async getNotifications(userId: string): Promise<any[]> {
    return await db
      .select({
        id: notifications.id,
        userId: notifications.userId,
        fromUserId: notifications.fromUserId,
        postId: notifications.postId,
        type: notifications.type,
        content: notifications.content,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
  }

  // Verification management
  async createVerificationRequest(requestData: NewVerificationRequest): Promise<any> {
    const [request] = await db.insert(verificationRequests).values(requestData).returning();
    return request;
  }

  async getVerificationRequests(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.userId, userId))
      .orderBy(desc(verificationRequests.submittedAt));
  }

  async updateVerificationRequest(id: string, status: "pending" | "approved" | "rejected", adminNotes?: string, reviewedBy?: string): Promise<void> {
    await db.update(verificationRequests)
      .set({
        status,
        adminNotes,
        reviewedBy,
        reviewedAt: new Date(),
      })
      .where(eq(verificationRequests.id, id));
  }
}

export const storage = new DatabaseStorage();
