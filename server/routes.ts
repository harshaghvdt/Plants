import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTweetSchema, insertFollowSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Tweet routes
  app.post('/api/tweets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tweetData = insertTweetSchema.parse({ ...req.body, authorId: userId });
      
      const tweet = await storage.createTweet(tweetData);
      
      // Create notification for reply
      if (tweetData.replyToId) {
        const originalTweet = await storage.getTweet(tweetData.replyToId);
        if (originalTweet && originalTweet.author.id !== userId) {
          await storage.createNotification({
            userId: originalTweet.author.id,
            fromUserId: userId,
            type: 'reply',
            tweetId: tweet.id,
            message: 'replied to your tweet',
          });
        }
      }

      // Broadcast new tweet to WebSocket clients
      broadcastToClients({ type: 'new_tweet', tweet });
      
      res.json(tweet);
    } catch (error) {
      console.error("Error creating tweet:", error);
      res.status(400).json({ message: "Failed to create tweet" });
    }
  });

  app.get('/api/tweets/timeline', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tweets = await storage.getTimeline(userId);
      res.json(tweets);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      res.status(500).json({ message: "Failed to fetch timeline" });
    }
  });

  app.get('/api/tweets/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter required" });
      }
      const tweets = await storage.searchTweets(query, userId);
      res.json(tweets);
    } catch (error) {
      console.error("Error searching tweets:", error);
      res.status(500).json({ message: "Failed to search tweets" });
    }
  });

  app.get('/api/tweets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const tweet = await storage.getTweet(req.params.id);
      if (!tweet) {
        return res.status(404).json({ message: "Tweet not found" });
      }
      res.json(tweet);
    } catch (error) {
      console.error("Error fetching tweet:", error);
      res.status(500).json({ message: "Failed to fetch tweet" });
    }
  });

  app.get('/api/tweets/:id/replies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const replies = await storage.getTweetReplies(req.params.id, userId);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching replies:", error);
      res.status(500).json({ message: "Failed to fetch replies" });
    }
  });

  app.put('/api/tweets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tweetId = req.params.id;
      const { content } = req.body;

      if (!content || content.length > 280) {
        return res.status(400).json({ message: "Invalid content" });
      }

      // Check if user owns the tweet
      const tweet = await storage.getTweet(tweetId);
      if (!tweet || tweet.author.id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updatedTweet = await storage.updateTweet(tweetId, content);
      res.json(updatedTweet);
    } catch (error) {
      console.error("Error updating tweet:", error);
      res.status(500).json({ message: "Failed to update tweet" });
    }
  });

  app.delete('/api/tweets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tweetId = req.params.id;

      // Check if user owns the tweet
      const tweet = await storage.getTweet(tweetId);
      if (!tweet || tweet.author.id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const deleted = await storage.deleteTweet(tweetId);
      if (deleted) {
        res.json({ message: "Tweet deleted successfully" });
      } else {
        res.status(404).json({ message: "Tweet not found" });
      }
    } catch (error) {
      console.error("Error deleting tweet:", error);
      res.status(500).json({ message: "Failed to delete tweet" });
    }
  });

  // Like routes
  app.post('/api/tweets/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tweetId = req.params.id;
      
      const success = await storage.likeTweet(userId, tweetId);
      if (success) {
        // Create notification
        const tweet = await storage.getTweet(tweetId);
        if (tweet && tweet.author.id !== userId) {
          await storage.createNotification({
            userId: tweet.author.id,
            fromUserId: userId,
            type: 'like',
            tweetId: tweetId,
            message: 'liked your tweet',
          });
        }
        
        broadcastToClients({ type: 'tweet_liked', tweetId, userId });
        res.json({ message: "Tweet liked successfully" });
      } else {
        res.status(400).json({ message: "Failed to like tweet" });
      }
    } catch (error) {
      console.error("Error liking tweet:", error);
      res.status(500).json({ message: "Failed to like tweet" });
    }
  });

  app.delete('/api/tweets/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tweetId = req.params.id;
      
      const success = await storage.unlikeTweet(userId, tweetId);
      if (success) {
        broadcastToClients({ type: 'tweet_unliked', tweetId, userId });
        res.json({ message: "Tweet unliked successfully" });
      } else {
        res.status(400).json({ message: "Failed to unlike tweet" });
      }
    } catch (error) {
      console.error("Error unliking tweet:", error);
      res.status(500).json({ message: "Failed to unlike tweet" });
    }
  });

  // Retweet routes
  app.post('/api/tweets/:id/retweet', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tweetId = req.params.id;
      
      const success = await storage.retweetTweet(userId, tweetId);
      if (success) {
        // Create notification
        const tweet = await storage.getTweet(tweetId);
        if (tweet && tweet.author.id !== userId) {
          await storage.createNotification({
            userId: tweet.author.id,
            fromUserId: userId,
            type: 'retweet',
            tweetId: tweetId,
            message: 'retweeted your tweet',
          });
        }
        
        broadcastToClients({ type: 'tweet_retweeted', tweetId, userId });
        res.json({ message: "Tweet retweeted successfully" });
      } else {
        res.status(400).json({ message: "Failed to retweet tweet" });
      }
    } catch (error) {
      console.error("Error retweeting tweet:", error);
      res.status(500).json({ message: "Failed to retweet tweet" });
    }
  });

  app.delete('/api/tweets/:id/retweet', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tweetId = req.params.id;
      
      const success = await storage.unretweetTweet(userId, tweetId);
      if (success) {
        broadcastToClients({ type: 'tweet_unretweeted', tweetId, userId });
        res.json({ message: "Tweet unretweeted successfully" });
      } else {
        res.status(400).json({ message: "Failed to unretweet tweet" });
      }
    } catch (error) {
      console.error("Error unretweeting tweet:", error);
      res.status(500).json({ message: "Failed to unretweet tweet" });
    }
  });

  // User routes
  app.get('/api/users/:username', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/users/:username/tweets', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const tweets = await storage.getUserTweets(user.id, currentUserId);
      res.json(tweets);
    } catch (error) {
      console.error("Error fetching user tweets:", error);
      res.status(500).json({ message: "Failed to fetch user tweets" });
    }
  });

  app.get('/api/users/suggestions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const suggestions = await storage.getSuggestedUsers(userId);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching user suggestions:", error);
      res.status(500).json({ message: "Failed to fetch user suggestions" });
    }
  });

  // Follow routes
  app.post('/api/users/:id/follow', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const followingId = req.params.id;
      
      if (followerId === followingId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }

      const follow = await storage.followUser(followerId, followingId);
      
      // Create notification
      await storage.createNotification({
        userId: followingId,
        fromUserId: followerId,
        type: 'follow',
        message: 'started following you',
      });
      
      broadcastToClients({ type: 'user_followed', followerId, followingId });
      res.json(follow);
    } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete('/api/users/:id/follow', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const followingId = req.params.id;
      
      const success = await storage.unfollowUser(followerId, followingId);
      if (success) {
        broadcastToClients({ type: 'user_unfollowed', followerId, followingId });
        res.json({ message: "User unfollowed successfully" });
      } else {
        res.status(400).json({ message: "Failed to unfollow user" });
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  app.get('/api/users/:id/following-status', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const followingId = req.params.id;
      
      const isFollowing = await storage.isFollowing(followerId, followingId);
      res.json({ isFollowing });
    } catch (error) {
      console.error("Error checking following status:", error);
      res.status(500).json({ message: "Failed to check following status" });
    }
  });

  // Notifications routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
      res.status(500).json({ message: "Failed to fetch unread notifications count" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    
    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  // Broadcast function for real-time updates
  function broadcastToClients(data: any) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  return httpServer;
}
