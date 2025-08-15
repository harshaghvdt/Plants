import express from 'express';
import { storage } from './storage';
import { 
  isAuthenticated,
  sendOTP, 
  verifyOTPAndRegister, 
  login, 
  verifyLoginOTP, 
  logout, 
  getCurrentUser 
} from './firebase-auth';
import { 
  submitVerificationRequest, 
  getUserVerificationRequests, 
  getPendingVerificationRequests, 
  reviewVerificationRequest, 
  getVerificationStatus 
} from './verification';


export async function registerRoutes(app: express.Application) {
  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Authentication routes
  app.post("/api/auth/send-otp", sendOTP);
  app.post("/api/auth/verify-otp-register", verifyOTPAndRegister);
  app.post("/api/auth/login", login);
  app.post("/api/auth/verify-login-otp", verifyLoginOTP);
  app.post("/api/auth/logout", logout);
  app.get("/api/auth/me", isAuthenticated, getCurrentUser);

  // Posts (renamed from tweets)
  app.post("/api/posts", isAuthenticated, async (req, res) => {
    try {
      const postData = req.body;
      
      // Basic validation
      if (!postData.content || typeof postData.content !== 'string') {
        return res.status(400).json({ message: 'Content is required and must be a string' });
      }
      
      if (postData.content.length > 280) {
        return res.status(400).json({ message: 'Content must be 280 characters or less' });
      }
      
      const post = await storage.createPost({
        ...postData,
        authorId: (req as any).user.id,
      });
      
      res.json({ post });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ message: 'Failed to create post' });
    }
  });

  app.get("/api/posts/timeline", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const posts = await storage.getTimeline(userId);
      res.json({ posts });
    } catch (error) {
      console.error("Error getting timeline:", error);
      res.status(500).json({ message: "Failed to get timeline" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json({ post });
    } catch (error) {
      console.error("Error getting post:", error);
      res.status(500).json({ message: "Failed to get post" });
    }
  });

  app.get("/api/posts/:id/replies", async (req, res) => {
    try {
      const replies = await storage.getReplies(req.params.id);
      res.json({ replies });
    } catch (error) {
      console.error("Error getting replies:", error);
      res.status(500).json({ message: "Failed to get replies" });
    }
  });

  // Likes and shares
  app.post("/api/posts/:id/like", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const postId = req.params.id;
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      await storage.likePost(userId, postId);
      res.json({ message: "Post liked" });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete("/api/posts/:id/like", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const postId = req.params.id;
      
      await storage.unlikePost(userId, postId);
      res.json({ message: "Post unliked" });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  app.post("/api/posts/:id/share", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const postId = req.params.id;
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      await storage.sharePost(userId, postId);
      res.json({ message: "Post shared" });
    } catch (error) {
      console.error("Error sharing post:", error);
      res.status(500).json({ message: "Failed to share post" });
    }
  });

  app.delete("/api/posts/:id/share", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const postId = req.params.id;
      
      await storage.unsharePost(userId, postId);
      res.json({ message: "Post unshared" });
    } catch (error) {
      console.error("Error unsharing post:", error);
      res.status(500).json({ message: "Failed to unshare post" });
    }
  });

  // Users
  app.get("/api/users/:username", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user });
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.get("/api/users/:username/posts", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const posts = await storage.getPostsByUser(user.id);
      res.json({ posts });
    } catch (error) {
      console.error("Error getting user posts:", error);
      res.status(500).json({ message: "Failed to get user posts" });
    }
  });

  // Follows
  app.post("/api/follows", isAuthenticated, async (req, res) => {
    try {
      const followerId = (req as any).user.id;
      const { followingId } = req.body;
      
      if (followerId === followingId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }

      const targetUser = await storage.getUser(followingId);
      if (!targetUser) {
        return res.status(404).json({ message: "User to follow not found" });
      }

      await storage.followUser(followerId, followingId);
      res.json({ message: "User followed" });
    } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete("/api/follows/:userId", isAuthenticated, async (req, res) => {
    try {
      const followerId = (req as any).user.id;
      const followingId = req.params.userId;
      
      await storage.unfollowUser(followerId, followingId);
      res.json({ message: "User unfollowed" });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  app.get("/api/follows/:userId", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const targetUserId = req.params.userId;
      
      const isFollowing = await storage.getFollowingStatus(userId, targetUserId);
      res.json({ isFollowing });
    } catch (error) {
      console.error("Error checking follow status:", error);
      res.status(500).json({ message: "Failed to check follow status" });
    }
  });

  // Notifications
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const notifications = await storage.getNotifications(userId);
      res.json({ notifications });
    } catch (error) {
      console.error("Error getting notifications:", error);
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  app.put("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const notificationId = req.params.id;
      
      // Mark notification as read
      await storage.markNotificationAsRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Verification routes
  app.post("/api/verification/submit", isAuthenticated, (req, res) => submitVerificationRequest(req as any, res));
  app.get("/api/verification/requests", isAuthenticated, (req, res) => getUserVerificationRequests(req as any, res));
  app.get("/api/verification/status", isAuthenticated, (req, res) => getVerificationStatus(req as any, res));

  // Admin routes
  app.get("/api/admin/verification/pending", isAuthenticated, (req, res) => getPendingVerificationRequests(req as any, res));
  app.put("/api/admin/verification/:requestId/review", isAuthenticated, (req, res) => reviewVerificationRequest(req as any, res));

  // WebSocket server for real-time updates
  const server = app.listen(0, () => {
    console.log("WebSocket server ready");
  });

  const { WebSocketServer } = await import("ws");
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: any) => {
    console.log("New WebSocket connection");
    
    ws.on("message", (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("WebSocket message:", data);
        
        // Broadcast to all connected clients
        wss.clients.forEach((client: any) => {
          if (client !== ws && client.readyState === 1) { // 1 = OPEN state
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });
  });

  // Catch all API routes that don't exist - return JSON 404 instead of HTML
  app.use("/api/*", (req, res) => {
    res.status(404).json({ 
      error: "API endpoint not found",
      path: req.originalUrl,
      method: req.method 
    });
  });

  return server;
}
