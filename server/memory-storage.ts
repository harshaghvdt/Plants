// In-memory storage implementation for Firebase migration
import type { IStorage } from './storage';
import type { NewUser, NewPost, NewNotification, NewVerificationRequest } from "@shared/schema";

export class MemoryStorage implements IStorage {
  private users: Map<string, any> = new Map();
  private posts: Map<string, any> = new Map();
  private follows: Map<string, any> = new Map();
  private likes: Map<string, any> = new Map();
  private shares: Map<string, any> = new Map();
  private notifications: Map<string, any> = new Map();
  private verificationRequests: Map<string, any> = new Map();
  private otps: Map<string, any> = new Map();

  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  // User management
  async getUser(id: string): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    for (const [, user] of this.users) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByPhone(phone: string): Promise<any | undefined> {
    for (const [, user] of this.users) {
      if (user.phone === phone) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: NewUser): Promise<any> {
    const id = this.generateId();
    const timestamp = this.getCurrentTimestamp();
    
    const user = {
      id,
      ...userData,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      isVerified: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.users.set(id, user);
    return user;
  }

  async upsertUser(userData: NewUser): Promise<any> {
    const existingUser = await this.getUserByPhone(userData.phone);
    
    if (existingUser) {
      const updatedUser = {
        ...existingUser,
        ...userData,
        updatedAt: this.getCurrentTimestamp(),
      };
      this.users.set(existingUser.id, updatedUser);
      return updatedUser;
    } else {
      return await this.createUser(userData);
    }
  }

  async updateUserStats(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) return;

    // Count followers
    let followersCount = 0;
    for (const [, follow] of this.follows) {
      if (follow.followingId === userId) followersCount++;
    }

    // Count following
    let followingCount = 0;
    for (const [, follow] of this.follows) {
      if (follow.followerId === userId) followingCount++;
    }

    // Count posts
    let postsCount = 0;
    for (const [, post] of this.posts) {
      if (post.authorId === userId) postsCount++;
    }

    const updatedUser = {
      ...user,
      followersCount,
      followingCount,
      postsCount,
      updatedAt: this.getCurrentTimestamp(),
    };

    this.users.set(userId, updatedUser);
  }

  // Post management
  async createPost(postData: NewPost): Promise<any> {
    const id = this.generateId();
    const timestamp = this.getCurrentTimestamp();
    
    const post = {
      id,
      ...postData,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.posts.set(id, post);

    // Update user's post count
    const user = this.users.get(postData.authorId);
    if (user) {
      this.users.set(postData.authorId, {
        ...user,
        postsCount: (user.postsCount || 0) + 1,
        updatedAt: timestamp,
      });
    }

    return post;
  }

  async getPost(id: string): Promise<any | undefined> {
    return this.posts.get(id);
  }

  async getPostsByUser(userId: string): Promise<any[]> {
    const userPosts: any[] = [];
    for (const [, post] of this.posts) {
      if (post.authorId === userId) {
        userPosts.push(post);
      }
    }
    return userPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTimeline(userId: string): Promise<any[]> {
    // Get user's following list
    const followingIds = new Set<string>();
    for (const [, follow] of this.follows) {
      if (follow.followerId === userId) {
        followingIds.add(follow.followingId);
      }
    }
    
    // Include user's own posts
    followingIds.add(userId);

    const timelinePosts: any[] = [];
    for (const [, post] of this.posts) {
      if (followingIds.has(post.authorId)) {
        // Add author info
        const author = this.users.get(post.authorId);
        const enrichedPost = {
          ...post,
          author,
        };
        timelinePosts.push(enrichedPost);
      }
    }

    return timelinePosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getReplies(postId: string): Promise<any[]> {
    const replies: any[] = [];
    for (const [, post] of this.posts) {
      if (post.replyToId === postId) {
        const author = this.users.get(post.authorId);
        replies.push({ ...post, author });
      }
    }
    return replies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Follow management
  async followUser(followerId: string, followingId: string): Promise<void> {
    // Check if already following
    if (await this.getFollowingStatus(followerId, followingId)) return;

    const id = this.generateId();
    const follow = {
      id,
      followerId,
      followingId,
      createdAt: this.getCurrentTimestamp(),
    };

    this.follows.set(id, follow);
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    for (const [id, follow] of this.follows) {
      if (follow.followerId === followerId && follow.followingId === followingId) {
        this.follows.delete(id);
        break;
      }
    }
  }

  async getFollowingStatus(followerId: string, followingId: string): Promise<boolean> {
    for (const [, follow] of this.follows) {
      if (follow.followerId === followerId && follow.followingId === followingId) {
        return true;
      }
    }
    return false;
  }

  // Like/Share management
  async likePost(userId: string, postId: string): Promise<void> {
    // Check if already liked
    for (const [, like] of this.likes) {
      if (like.userId === userId && like.postId === postId) return;
    }

    const id = this.generateId();
    const like = {
      id,
      userId,
      postId,
      createdAt: this.getCurrentTimestamp(),
    };

    this.likes.set(id, like);
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    for (const [id, like] of this.likes) {
      if (like.userId === userId && like.postId === postId) {
        this.likes.delete(id);
        break;
      }
    }
  }

  async sharePost(userId: string, postId: string): Promise<void> {
    // Check if already shared
    for (const [, share] of this.shares) {
      if (share.userId === userId && share.postId === postId) return;
    }

    const id = this.generateId();
    const share = {
      id,
      userId,
      postId,
      createdAt: this.getCurrentTimestamp(),
    };

    this.shares.set(id, share);
  }

  async unsharePost(userId: string, postId: string): Promise<void> {
    for (const [id, share] of this.shares) {
      if (share.userId === userId && share.postId === postId) {
        this.shares.delete(id);
        break;
      }
    }
  }

  // Notification management
  async createNotification(notificationData: NewNotification): Promise<any> {
    const id = this.generateId();
    const notification = {
      id,
      ...notificationData,
      isRead: false,
      createdAt: this.getCurrentTimestamp(),
    };

    this.notifications.set(id, notification);
    return notification;
  }

  async getNotifications(userId: string): Promise<any[]> {
    const userNotifications: any[] = [];
    for (const [, notification] of this.notifications) {
      if (notification.userId === userId) {
        userNotifications.push(notification);
      }
    }
    return userNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      this.notifications.set(notificationId, {
        ...notification,
        isRead: true,
      });
    }
  }

  // Verification management
  async createVerificationRequest(requestData: NewVerificationRequest): Promise<any> {
    const id = this.generateId();
    const request = {
      id,
      ...requestData,
      status: 'pending',
      submittedAt: this.getCurrentTimestamp(),
    };

    this.verificationRequests.set(id, request);
    return request;
  }

  async getVerificationRequests(userId: string): Promise<any[]> {
    const userRequests: any[] = [];
    for (const [, request] of this.verificationRequests) {
      if (request.userId === userId) {
        userRequests.push(request);
      }
    }
    return userRequests.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  async updateVerificationRequest(
    id: string, 
    status: string, 
    adminNotes?: string, 
    reviewedBy?: string
  ): Promise<void> {
    const request = this.verificationRequests.get(id);
    if (request) {
      this.verificationRequests.set(id, {
        ...request,
        status,
        adminNotes: adminNotes || null,
        reviewedBy: reviewedBy || null,
        reviewedAt: this.getCurrentTimestamp(),
      });
    }
  }
}