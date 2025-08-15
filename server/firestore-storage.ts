import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { IStorage } from './storage';
import type { NewUser, NewPost, NewNotification, NewVerificationRequest } from "@shared/schema";

export class FirestoreStorage implements IStorage {
  // Collections
  private users = collection(db, 'users');
  private posts = collection(db, 'posts');
  private follows = collection(db, 'follows');
  private likes = collection(db, 'likes');
  private shares = collection(db, 'shares');
  private notifications = collection(db, 'notifications');
  private verificationRequests = collection(db, 'verificationRequests');
  private otps = collection(db, 'otps');

  // Helper to convert Firestore timestamp to ISO string
  private convertTimestamp(timestamp: any): string {
    if (timestamp?.toDate) {
      return timestamp.toDate().toISOString();
    }
    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }
    return timestamp || new Date().toISOString();
  }

  // User management
  async getUser(id: string): Promise<any | undefined> {
    const userDoc = await getDoc(doc(this.users, id));
    if (!userDoc.exists()) return undefined;
    
    const data = userDoc.data();
    return {
      id: userDoc.id,
      ...data,
      createdAt: this.convertTimestamp(data.createdAt),
      updatedAt: this.convertTimestamp(data.updatedAt),
    };
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    const q = query(this.users, where('username', '==', username), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return undefined;
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: this.convertTimestamp(data.createdAt),
      updatedAt: this.convertTimestamp(data.updatedAt),
    };
  }

  async getUserByPhone(phone: string): Promise<any | undefined> {
    const q = query(this.users, where('phone', '==', phone), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return undefined;
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: this.convertTimestamp(data.createdAt),
      updatedAt: this.convertTimestamp(data.updatedAt),
    };
  }

  async createUser(userData: NewUser): Promise<any> {
    const docRef = await addDoc(this.users, {
      ...userData,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      isVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      ...userData,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async upsertUser(userData: NewUser): Promise<any> {
    // Check if user exists by phone
    const existingUser = await this.getUserByPhone(userData.phone);
    
    if (existingUser) {
      // Update existing user
      await updateDoc(doc(this.users, existingUser.id), {
        ...userData,
        updatedAt: serverTimestamp(),
      });
      return { ...existingUser, ...userData, updatedAt: new Date().toISOString() };
    } else {
      // Create new user
      return await this.createUser(userData);
    }
  }

  async updateUserStats(userId: string): Promise<void> {
    const batch = writeBatch(db);
    const userRef = doc(this.users, userId);

    // Count followers
    const followersQuery = query(this.follows, where('followingId', '==', userId));
    const followersSnapshot = await getDocs(followersQuery);
    const followersCount = followersSnapshot.size;

    // Count following
    const followingQuery = query(this.follows, where('followerId', '==', userId));
    const followingSnapshot = await getDocs(followingQuery);
    const followingCount = followingSnapshot.size;

    // Count posts
    const postsQuery = query(this.posts, where('authorId', '==', userId));
    const postsSnapshot = await getDocs(postsQuery);
    const postsCount = postsSnapshot.size;

    batch.update(userRef, {
      followersCount,
      followingCount,
      postsCount,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  }

  // Post management
  async createPost(postData: NewPost): Promise<any> {
    const docRef = await addDoc(this.posts, {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update user's post count
    await updateDoc(doc(this.users, postData.authorId), {
      postsCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      ...postData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getPost(id: string): Promise<any | undefined> {
    const postDoc = await getDoc(doc(this.posts, id));
    if (!postDoc.exists()) return undefined;
    
    const data = postDoc.data();
    return {
      id: postDoc.id,
      ...data,
      createdAt: this.convertTimestamp(data.createdAt),
      updatedAt: this.convertTimestamp(data.updatedAt),
    };
  }

  async getPostsByUser(userId: string): Promise<any[]> {
    const q = query(
      this.posts, 
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: this.convertTimestamp(data.createdAt),
        updatedAt: this.convertTimestamp(data.updatedAt),
      };
    });
  }

  async getTimeline(userId: string): Promise<any[]> {
    // Get user's following list
    const followingQuery = query(this.follows, where('followerId', '==', userId));
    const followingSnapshot = await getDocs(followingQuery);
    const followingIds = followingSnapshot.docs.map(doc => doc.data().followingId);
    
    // Include user's own posts
    followingIds.push(userId);
    
    if (followingIds.length === 0) return [];

    // Get posts from followed users (Firestore limitation: max 10 items in 'in' query)
    const batches = [];
    for (let i = 0; i < followingIds.length; i += 10) {
      const batch = followingIds.slice(i, i + 10);
      const q = query(
        this.posts,
        where('authorId', 'in', batch),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      batches.push(getDocs(q));
    }

    const results = await Promise.all(batches);
    const allPosts: any[] = [];

    results.forEach(snapshot => {
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        allPosts.push({
          id: doc.id,
          ...data,
          createdAt: this.convertTimestamp(data.createdAt),
          updatedAt: this.convertTimestamp(data.updatedAt),
        });
      });
    });

    // Sort by createdAt and limit
    return allPosts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 100);
  }

  async getReplies(postId: string): Promise<any[]> {
    const q = query(
      this.posts,
      where('replyToId', '==', postId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: this.convertTimestamp(data.createdAt),
        updatedAt: this.convertTimestamp(data.updatedAt),
      };
    });
  }

  // Follow management
  async followUser(followerId: string, followingId: string): Promise<void> {
    // Check if already following
    const existingFollow = await this.getFollowingStatus(followerId, followingId);
    if (existingFollow) return;

    const batch = writeBatch(db);
    
    // Add follow relationship
    const followRef = doc(this.follows);
    batch.set(followRef, {
      followerId,
      followingId,
      createdAt: serverTimestamp(),
    });

    // Update user stats
    batch.update(doc(this.users, followerId), {
      followingCount: increment(1),
      updatedAt: serverTimestamp(),
    });
    
    batch.update(doc(this.users, followingId), {
      followersCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const q = query(
      this.follows,
      where('followerId', '==', followerId),
      where('followingId', '==', followingId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    
    // Remove follow relationship
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Update user stats
    batch.update(doc(this.users, followerId), {
      followingCount: increment(-1),
      updatedAt: serverTimestamp(),
    });
    
    batch.update(doc(this.users, followingId), {
      followersCount: increment(-1),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  }

  async getFollowingStatus(followerId: string, followingId: string): Promise<boolean> {
    const q = query(
      this.follows,
      where('followerId', '==', followerId),
      where('followingId', '==', followingId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  // Like/Share management
  async likePost(userId: string, postId: string): Promise<void> {
    // Check if already liked
    const q = query(
      this.likes,
      where('userId', '==', userId),
      where('postId', '==', postId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return;

    await addDoc(this.likes, {
      userId,
      postId,
      createdAt: serverTimestamp(),
    });
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    const q = query(
      this.likes,
      where('userId', '==', userId),
      where('postId', '==', postId)
    );
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  async sharePost(userId: string, postId: string): Promise<void> {
    // Check if already shared
    const q = query(
      this.shares,
      where('userId', '==', userId),
      where('postId', '==', postId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return;

    await addDoc(this.shares, {
      userId,
      postId,
      createdAt: serverTimestamp(),
    });
  }

  async unsharePost(userId: string, postId: string): Promise<void> {
    const q = query(
      this.shares,
      where('userId', '==', userId),
      where('postId', '==', postId)
    );
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  // Notification management
  async createNotification(notificationData: NewNotification): Promise<any> {
    const docRef = await addDoc(this.notifications, {
      ...notificationData,
      isRead: false,
      createdAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      ...notificationData,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
  }

  async getNotifications(userId: string): Promise<any[]> {
    const q = query(
      this.notifications,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: this.convertTimestamp(data.createdAt),
      };
    });
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await updateDoc(doc(this.notifications, notificationId), {
      isRead: true,
    });
  }

  // Verification management
  async createVerificationRequest(requestData: NewVerificationRequest): Promise<any> {
    const docRef = await addDoc(this.verificationRequests, {
      ...requestData,
      status: 'pending',
      submittedAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      ...requestData,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
  }

  async getVerificationRequests(userId: string): Promise<any[]> {
    const q = query(
      this.verificationRequests,
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        submittedAt: this.convertTimestamp(data.submittedAt),
        reviewedAt: this.convertTimestamp(data.reviewedAt),
      };
    });
  }

  async updateVerificationRequest(
    id: string, 
    status: string, 
    adminNotes?: string, 
    reviewedBy?: string
  ): Promise<void> {
    await updateDoc(doc(this.verificationRequests, id), {
      status,
      adminNotes: adminNotes || null,
      reviewedBy: reviewedBy || null,
      reviewedAt: serverTimestamp(),
    });
  }
}