/**
 * Daybook Firebase Integration & Authentication Service
 * 
 * To connect your live Firebase project:
 * 1. Insert your Firebase credentials into firebaseConfig below.
 * 2. Set isFirebaseConfigured = true (or it will automatically activate if apiKey is updated).
 */

let initializeApp, getApps, getApp, getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged, sendPasswordResetEmail, getFirestore, doc, setDoc, getDoc;

try {
  const fbApp = require('firebase/app');
  initializeApp = fbApp.initializeApp;
  getApps = fbApp.getApps;
  getApp = fbApp.getApp;

  const fbAuth = require('firebase/auth');
  getAuth = fbAuth.getAuth;
  createUserWithEmailAndPassword = fbAuth.createUserWithEmailAndPassword;
  signInWithEmailAndPassword = fbAuth.signInWithEmailAndPassword;
  signOut = fbAuth.signOut;
  updateProfile = fbAuth.updateProfile;
  onAuthStateChanged = fbAuth.onAuthStateChanged;
  sendPasswordResetEmail = fbAuth.sendPasswordResetEmail;

  const fbFs = require('firebase/firestore');
  getFirestore = fbFs.getFirestore;
  doc = fbFs.doc;
  setDoc = fbFs.setDoc;
  getDoc = fbFs.getDoc;
} catch (e) {
  // Firebase package not installed, fall back to offline Demo Mode
}

const firebaseConfig = {
  apiKey: "AIzaSyAEorrO3QzHxEBuYH5K50gkxlP-qijuuO8",
  authDomain: "daybook-cf7c1.firebaseapp.com",
  projectId: "daybook-cf7c1",
  storageBucket: "daybook-cf7c1.firebasestorage.app",
  messagingSenderId: "466314575330",
  appId: "1:466314575330:android:0d41f22eb68925ba1ecdbb"
};

// Auto-detect configuration state
export const isFirebaseConfigured =
  firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY" && !!initializeApp;

let app, auth, db;

try {
  if (isFirebaseConfigured) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (e) {
  // Offline fallback
}

export { auth, db };


/**
 * Sign up user with Email & Password
 */
export const signUpUser = async (name, email, password) => {
  if (!isFirebaseConfigured || !auth) {
    // Demo Mode fallback for immediate offline testing
    return {
      user: {
        uid: 'demo_' + Date.now(),
        displayName: name || (email ? email.split('@')[0] : 'User'),
        email: email,
      },
      isDemo: true,
    };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (name && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    return { user: userCredential.user, isDemo: false };
  } catch (error) {
    throw error;
  }
};

/**
 * Login user with Email & Password
 */
export const loginUser = async (email, password) => {
  if (!isFirebaseConfigured || !auth) {
    // Demo Mode fallback
    return {
      user: {
        uid: 'demo_user',
        displayName: (email ? email.split('@')[0] : 'User'),
        email: email,
      },
      isDemo: true,
    };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, isDemo: false };
  } catch (error) {
    throw error;
  }
};

/**
 * Logout User
 */
export const logoutUser = async () => {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
};

/**
 * Reset Password
 */
export const resetUserPassword = async (email) => {
  if (!isFirebaseConfigured || !auth) {
    return { success: true, message: 'Password reset link sent (Demo Mode)' };
  }
  await sendPasswordResetEmail(auth, email);
  return { success: true };
};

/**
 * Auth State Listener
 */
export const subscribeToAuthChanges = (callback) => {
  if (!isFirebaseConfigured || !auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

/**
 * Firestore Sync Helper
 */
export const syncUserDataToCloud = async (userId, data) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    await setDoc(doc(db, 'users', userId), data, { merge: true });
  } catch (e) {
    console.error('Cloud sync error:', e);
  }
};
