import { sql } from "drizzle-orm";
import { 
  pgTable, 
  varchar, 
  text, 
  timestamp, 
  boolean, 
  integer,
  pgEnum
} from "drizzle-orm/pg-core";

// Enums
export const accountTypeEnum = pgEnum("account_type", [
  "student",
  "farmer", 
  "enthusiast",
  "professor_scientist"
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "approved",
  "rejected"
]);

export const verificationTypeEnum = pgEnum("verification_type", [
  "student",
  "professor_scientist"
]);

// Tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: varchar("phone").unique().notNull(), // Primary identifier
  email: varchar("email").unique(), // Optional
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique().notNull(),
  bio: text("bio"),
  location: varchar("location"),
  website: varchar("website"),
  accountType: accountTypeEnum("account_type").notNull(),
  isVerified: boolean("is_verified").default(false),
  verificationType: verificationTypeEnum("verification_type"),
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  postsCount: integer("posts_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  replyToId: varchar("reply_to_id"), // Self-reference will be handled in application logic
  category: varchar("category"), // agriculture, environment, etc.
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => users.id),
  followingId: varchar("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: varchar("post_id").notNull().references(() => posts.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shares = pgTable("shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: varchar("post_id").notNull().references(() => posts.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fromUserId: varchar("from_user_id").references(() => users.id),
  postId: varchar("post_id").references(() => posts.id),
  type: varchar("type").notNull(), // like, share, follow, reply
  content: text("content"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const otps = pgTable("otps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: varchar("phone").notNull(),
  otp: varchar("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const verificationRequests = pgTable("verification_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  verificationType: verificationTypeEnum("verification_type").notNull(),
  status: verificationStatusEnum("verification_status").default("pending"),
  instituteName: varchar("institute_name"),
  proofOfWorkUrl: varchar("proof_of_work_url"),
  selfieUrl: varchar("selfie_url"),
  adminNotes: text("admin_notes"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
});

// Relations
export const usersRelations = {
  posts: {
    fields: [users.id],
    references: [posts.authorId],
  },
  followers: {
    fields: [users.id],
    references: [follows.followingId],
  },
  following: {
    fields: [users.id],
    references: [follows.followerId],
  },
  likes: {
    fields: [users.id],
    references: [likes.userId],
  },
  shares: {
    fields: [users.id],
    references: [shares.userId],
  },
  notifications: {
    fields: [users.id],
    references: [notifications.userId],
  },
  verificationRequests: {
    fields: [users.id],
    references: [verificationRequests.userId],
  },
};

export const postsRelations = {
  author: {
    fields: [posts.authorId],
    references: [users.id],
  },
  replies: {
    fields: [posts.id],
    references: [posts.replyToId],
  },
  likes: {
    fields: [posts.id],
    references: [likes.postId],
  },
  shares: {
    fields: [posts.id],
    references: [shares.postId],
  },
  notifications: {
    fields: [posts.id],
    references: [notifications.postId],
  },
};

export const followsRelations = {
  follower: {
    fields: [follows.followerId],
    references: [users.id],
  },
  following: {
    fields: [follows.followingId],
    references: [users.id],
  },
};

export const likesRelations = {
  user: {
    fields: [likes.userId],
    references: [users.id],
  },
  post: {
    fields: [likes.postId],
    references: [posts.id],
  },
};

export const sharesRelations = {
  user: {
    fields: [shares.userId],
    references: [users.id],
  },
  post: {
    fields: [shares.postId],
    references: [posts.id],
  },
};

export const notificationsRelations = {
  user: {
    fields: [notifications.userId],
    references: [users.id],
  },
  fromUser: {
    fields: [notifications.fromUserId],
    references: [users.id],
  },
  post: {
    fields: [notifications.postId],
    references: [posts.id],
  },
};

export const verificationRequestsRelations = {
  user: {
    fields: [verificationRequests.userId],
    references: [users.id],
  },
  reviewedBy: {
    fields: [verificationRequests.reviewedBy],
    references: [users.id],
  },
};

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Follow = typeof follows.$inferSelect;
export type NewFollow = typeof follows.$inferInsert;
export type Like = typeof likes.$inferSelect;
export type NewLike = typeof likes.$inferInsert;
export type Share = typeof shares.$inferSelect;
export type NewShare = typeof shares.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type Otp = typeof otps.$inferSelect;
export type NewOtp = typeof otps.$inferInsert;
export type VerificationRequest = typeof verificationRequests.$inferSelect;
export type NewVerificationRequest = typeof verificationRequests.$inferInsert;

// Combined types for API responses
export type PostWithAuthor = Post & {
  author: User;
  isLiked?: boolean;
  isShared?: boolean;
  likesCount?: number;
  sharesCount?: number;
  repliesCount?: number;
  _count?: {
    likes: number;
    shares: number;
    replies: number;
  };
};

export type TweetWithAuthor = PostWithAuthor; // Alias for backward compatibility
