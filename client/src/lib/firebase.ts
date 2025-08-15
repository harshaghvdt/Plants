// Firebase client configuration
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Get Firebase config from environment
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Validate configuration
const isConfigured = Object.values(firebaseConfig).every(value => value !== '');

if (!isConfigured) {
  console.warn('Firebase configuration is incomplete. Some features may not work properly.');
}

// Temporary mock Firebase until packages are installed
export const firebase = {
  config: firebaseConfig,
  initialized: isConfigured,
  auth: null,
  db: null,
  storage: null,
};

// Authentication helper functions
export const authHelpers = {
  signInWithPhoneNumber: async (phoneNumber: string) => {
    // Will be implemented when Firebase Auth is available
    console.log('Firebase Auth not yet available, using backend authentication');
    throw new Error('Use backend authentication for now');
  },

  verifyOTP: async (otp: string) => {
    // Will be implemented when Firebase Auth is available
    console.log('Firebase Auth not yet available, using backend authentication');
    throw new Error('Use backend authentication for now');
  },

  signOut: async () => {
    // Will be implemented when Firebase Auth is available
    console.log('Firebase Auth not yet available, using backend authentication');
    throw new Error('Use backend authentication for now');
  },

  getCurrentUser: () => {
    // Will be implemented when Firebase Auth is available
    return null;
  }
};

console.log('🔥 Firebase client configuration ready');