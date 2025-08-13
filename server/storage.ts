import {
  users,
  tweets,
  follows,
  likes,
  retweets,
  notifications,
  type User,
  type UpsertUser,
  type Tweet,
  type TweetWithAuthor,
  type InsertTweet,
  type Follow,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, sql, inArray, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStats(userId: string): Promise<void>;
  getSuggestedUsers(userId: string, limit?: number): Promise<User[]>;
  
  // Tweet operations
  createTweet(tweet: InsertTweet): Promise<Tweet>;
  getTweet(id: string): Promise<TweetWithAuthor | undefined>;
  getUserTweets(userId: string, currentUserId?: string): Promise<TweetWithAuthor[]>;
  getTimeline(userId: string): Promise<TweetWithAuthor[]>;
  getTweetReplies(tweetId: string, currentUserId?: string): Promise<TweetWithAuthor[]>;
  updateTweet(id: string, content: string): Promise<Tweet | undefined>;
  deleteTweet(id: string): Promise<boolean>;
  searchTweets(query: string, currentUserId?: string): Promise<TweetWithAuthor[]>;
  
  // Social operations
  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<boolean>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
  
  // Like operations
  likeTweet(userId: string, tweetId: string): Promise<boolean>;
  unlikeTweet(userId: string, tweetId: string): Promise<boolean>;
  isLiked(userId: string, tweetId: string): Promise<boolean>;
  
  // Retweet operations
  retweetTweet(userId: string, tweetId: string): Promise<boolean>;
  unretweetTweet(userId: string, tweetId: string): Promise<boolean>;
  isRetweeted(userId: string, tweetId: string): Promise<boolean>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<void>;
  getUserNotifications(userId: string): Promise<any[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  getUnreadNotificationsCount(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
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
    const followersCount = await db.select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followingId, userId));

    const followingCount = await db.select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followerId, userId));

    const tweetsCount = await db.select({ count: sql<number>`count(*)` })
      .from(tweets)
      .where(and(eq(tweets.authorId, userId), isNull(tweets.retweetOfId)));

    await db.update(users)
      .set({
        followersCount: followersCount[0].count,
        followingCount: followingCount[0].count,
        tweetsCount: tweetsCount[0].count,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async getSuggestedUsers(userId: string, limit = 3): Promise<User[]> {
    const followingIds = await db.select({ id: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));

    const excludeIds = [userId, ...followingIds.map(f => f.id)];

    return await db.select()
      .from(users)
      .where(sql`${users.id} NOT IN ${excludeIds.length > 0 ? sql`(${sql.join(excludeIds.map(id => sql`${id}`), sql`, `)})` : sql`('')`}`)
      .orderBy(desc(users.followersCount))
      .limit(limit);
  }

  async createTweet(tweet: InsertTweet): Promise<Tweet> {
    const [newTweet] = await db.insert(tweets).values(tweet).returning();
    
    // Update reply count if this is a reply
    if (tweet.replyToId) {
      await db.update(tweets)
        .set({ 
          repliesCount: sql`${tweets.repliesCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(tweets.id, tweet.replyToId));
    }

    // Update retweet count if this is a retweet
    if (tweet.retweetOfId) {
      await db.update(tweets)
        .set({ 
          retweetsCount: sql`${tweets.retweetsCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(tweets.id, tweet.retweetOfId));
    }

    return newTweet;
  }

  async getTweet(id: string): Promise<TweetWithAuthor | undefined> {
    const result = await db.select({
      tweet: tweets,
      author: users,
    })
    .from(tweets)
    .leftJoin(users, eq(tweets.authorId, users.id))
    .where(eq(tweets.id, id));

    if (result.length === 0) return undefined;

    const { tweet, author } = result[0];
    if (!author) return undefined;

    return { ...tweet, author };
  }

  async getUserTweets(userId: string, currentUserId?: string): Promise<TweetWithAuthor[]> {
    const result = await db.select({
      tweet: tweets,
      author: users,
    })
    .from(tweets)
    .leftJoin(users, eq(tweets.authorId, users.id))
    .where(eq(tweets.authorId, userId))
    .orderBy(desc(tweets.createdAt));

    const tweetsWithAuthors = result.filter(r => r.author).map(r => ({ ...r.tweet, author: r.author! }));

    if (currentUserId) {
      return this.enrichTweetsWithUserActions(tweetsWithAuthors, currentUserId);
    }

    return tweetsWithAuthors;
  }

  async getTimeline(userId: string): Promise<TweetWithAuthor[]> {
    // Get users that the current user follows
    const followingIds = await db.select({ id: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));

    const userIds = [userId, ...followingIds.map(f => f.id)];

    const result = await db.select({
      tweet: tweets,
      author: users,
    })
    .from(tweets)
    .leftJoin(users, eq(tweets.authorId, users.id))
    .where(inArray(tweets.authorId, userIds))
    .orderBy(desc(tweets.createdAt))
    .limit(50);

    const tweetsWithAuthors = result.filter(r => r.author).map(r => ({ ...r.tweet, author: r.author! }));
    return this.enrichTweetsWithUserActions(tweetsWithAuthors, userId);
  }

  async getTweetReplies(tweetId: string, currentUserId?: string): Promise<TweetWithAuthor[]> {
    const result = await db.select({
      tweet: tweets,
      author: users,
    })
    .from(tweets)
    .leftJoin(users, eq(tweets.authorId, users.id))
    .where(eq(tweets.replyToId, tweetId))
    .orderBy(asc(tweets.createdAt));

    const tweetsWithAuthors = result.filter(r => r.author).map(r => ({ ...r.tweet, author: r.author! }));

    if (currentUserId) {
      return this.enrichTweetsWithUserActions(tweetsWithAuthors, currentUserId);
    }

    return tweetsWithAuthors;
  }

  async updateTweet(id: string, content: string): Promise<Tweet | undefined> {
    const [updatedTweet] = await db.update(tweets)
      .set({ content, updatedAt: new Date() })
      .where(eq(tweets.id, id))
      .returning();
    return updatedTweet;
  }

  async deleteTweet(id: string): Promise<boolean> {
    const result = await db.delete(tweets).where(eq(tweets.id, id));
    return result.rowCount > 0;
  }

  async searchTweets(query: string, currentUserId?: string): Promise<TweetWithAuthor[]> {
    const result = await db.select({
      tweet: tweets,
      author: users,
    })
    .from(tweets)
    .leftJoin(users, eq(tweets.authorId, users.id))
    .where(sql`${tweets.content} ILIKE ${`%${query}%`}`)
    .orderBy(desc(tweets.createdAt))
    .limit(50);

    const tweetsWithAuthors = result.filter(r => r.author).map(r => ({ ...r.tweet, author: r.author! }));

    if (currentUserId) {
      return this.enrichTweetsWithUserActions(tweetsWithAuthors, currentUserId);
    }

    return tweetsWithAuthors;
  }

  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const [follow] = await db.insert(follows)
      .values({ followerId, followingId })
      .returning();
    
    // Update user stats
    await this.updateUserStats(followerId);
    await this.updateUserStats(followingId);
    
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    const result = await db.delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    
    if (result.rowCount > 0) {
      // Update user stats
      await this.updateUserStats(followerId);
      await this.updateUserStats(followingId);
      return true;
    }
    
    return false;
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const result = await db.select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    return result.length > 0;
  }

  async getFollowers(userId: string): Promise<User[]> {
    const result = await db.select({ user: users })
      .from(follows)
      .leftJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));

    return result.filter(r => r.user).map(r => r.user!);
  }

  async getFollowing(userId: string): Promise<User[]> {
    const result = await db.select({ user: users })
      .from(follows)
      .leftJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));

    return result.filter(r => r.user).map(r => r.user!);
  }

  async likeTweet(userId: string, tweetId: string): Promise<boolean> {
    try {
      await db.insert(likes).values({ userId, tweetId });
      await db.update(tweets)
        .set({ 
          likesCount: sql`${tweets.likesCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(tweets.id, tweetId));
      return true;
    } catch {
      return false;
    }
  }

  async unlikeTweet(userId: string, tweetId: string): Promise<boolean> {
    const result = await db.delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.tweetId, tweetId)));
    
    if (result.rowCount > 0) {
      await db.update(tweets)
        .set({ 
          likesCount: sql`${tweets.likesCount} - 1`,
          updatedAt: new Date(),
        })
        .where(eq(tweets.id, tweetId));
      return true;
    }
    
    return false;
  }

  async isLiked(userId: string, tweetId: string): Promise<boolean> {
    const result = await db.select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.tweetId, tweetId)));
    return result.length > 0;
  }

  async retweetTweet(userId: string, tweetId: string): Promise<boolean> {
    try {
      await db.insert(retweets).values({ userId, tweetId });
      await db.update(tweets)
        .set({ 
          retweetsCount: sql`${tweets.retweetsCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(tweets.id, tweetId));
      return true;
    } catch {
      return false;
    }
  }

  async unretweetTweet(userId: string, tweetId: string): Promise<boolean> {
    const result = await db.delete(retweets)
      .where(and(eq(retweets.userId, userId), eq(retweets.tweetId, tweetId)));
    
    if (result.rowCount > 0) {
      await db.update(tweets)
        .set({ 
          retweetsCount: sql`${tweets.retweetsCount} - 1`,
          updatedAt: new Date(),
        })
        .where(eq(tweets.id, tweetId));
      return true;
    }
    
    return false;
  }

  async isRetweeted(userId: string, tweetId: string): Promise<boolean> {
    const result = await db.select()
      .from(retweets)
      .where(and(eq(retweets.userId, userId), eq(retweets.tweetId, tweetId)));
    return result.length > 0;
  }

  async createNotification(notification: InsertNotification): Promise<void> {
    await db.insert(notifications).values(notification);
  }

  async getUserNotifications(userId: string): Promise<any[]> {
    const result = await db.select({
      notification: notifications,
      fromUser: users,
      tweet: tweets,
    })
    .from(notifications)
    .leftJoin(users, eq(notifications.fromUserId, users.id))
    .leftJoin(tweets, eq(notifications.tweetId, tweets.id))
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

    return result;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    
    return result[0].count;
  }

  private async enrichTweetsWithUserActions(tweets: TweetWithAuthor[], userId: string): Promise<TweetWithAuthor[]> {
    const tweetIds = tweets.map(t => t.id);
    
    const userLikes = await db.select({ tweetId: likes.tweetId })
      .from(likes)
      .where(and(eq(likes.userId, userId), inArray(likes.tweetId, tweetIds)));

    const userRetweets = await db.select({ tweetId: retweets.tweetId })
      .from(retweets)
      .where(and(eq(retweets.userId, userId), inArray(retweets.tweetId, tweetIds)));

    const likedTweetIds = new Set(userLikes.map(l => l.tweetId));
    const retweetedTweetIds = new Set(userRetweets.map(r => r.tweetId));

    return tweets.map(tweet => ({
      ...tweet,
      isLiked: likedTweetIds.has(tweet.id),
      isRetweeted: retweetedTweetIds.has(tweet.id),
    }));
  }
}

export const storage = new DatabaseStorage();
