import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  bio: text("bio"),
  location: varchar("location"),
  website: varchar("website"),
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  tweetsCount: integer("tweets_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tweets = pgTable("tweets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  imageUrl: varchar("image_url"),
  replyToId: varchar("reply_to_id").references(() => tweets.id, { onDelete: "cascade" }),
  retweetOfId: varchar("retweet_of_id").references(() => tweets.id, { onDelete: "cascade" }),
  likesCount: integer("likes_count").default(0),
  retweetsCount: integer("retweets_count").default(0),
  repliesCount: integer("replies_count").default(0),
  isThread: boolean("is_thread").default(false),
  threadOrder: integer("thread_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const follows = pgTable(
  "follows",
  {
    followerId: varchar("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    followingId: varchar("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.followerId, table.followingId] }),
  }),
);

export const likes = pgTable(
  "likes",
  {
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tweetId: varchar("tweet_id").notNull().references(() => tweets.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.tweetId] }),
  }),
);

export const retweets = pgTable(
  "retweets",
  {
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tweetId: varchar("tweet_id").notNull().references(() => tweets.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.tweetId] }),
  }),
);

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fromUserId: varchar("from_user_id").references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // 'like', 'retweet', 'follow', 'reply', 'mention'
  tweetId: varchar("tweet_id").references(() => tweets.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tweets: many(tweets),
  likes: many(likes),
  retweets: many(retweets),
  following: many(follows, { relationName: "follower" }),
  followers: many(follows, { relationName: "following" }),
  notifications: many(notifications),
}));

export const tweetsRelations = relations(tweets, ({ one, many }) => ({
  author: one(users, {
    fields: [tweets.authorId],
    references: [users.id],
  }),
  replyTo: one(tweets, {
    fields: [tweets.replyToId],
    references: [tweets.id],
    relationName: "replies",
  }),
  retweetOf: one(tweets, {
    fields: [tweets.retweetOfId],
    references: [tweets.id],
    relationName: "retweets",
  }),
  replies: many(tweets, { relationName: "replies" }),
  retweets: many(tweets, { relationName: "retweets" }),
  likes: many(likes),
  userRetweets: many(retweets),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  tweet: one(tweets, {
    fields: [likes.tweetId],
    references: [tweets.id],
  }),
}));

export const retweetsRelations = relations(retweets, ({ one }) => ({
  user: one(users, {
    fields: [retweets.userId],
    references: [users.id],
  }),
  tweet: one(tweets, {
    fields: [retweets.tweetId],
    references: [tweets.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  fromUser: one(users, {
    fields: [notifications.fromUserId],
    references: [users.id],
  }),
  tweet: one(tweets, {
    fields: [notifications.tweetId],
    references: [tweets.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTweetSchema = createInsertSchema(tweets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likesCount: true,
  retweetsCount: true,
  repliesCount: true,
}).extend({
  content: z.string().min(1).max(280),
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertTweet = z.infer<typeof insertTweetSchema>;
export type Tweet = typeof tweets.$inferSelect;
export type TweetWithAuthor = Tweet & { author: User; isLiked?: boolean; isRetweeted?: boolean };
export type Follow = typeof follows.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Retweet = typeof retweets.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
