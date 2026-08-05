/**
 * Daybook Firebase Integration & Authentication Service
 * 
 * To connect your live Firebase project:
 * 1. Insert your Firebase credentials into firebaseConfig below.
 * 2. Set isFirebaseConfigured = true (or it will automatically activate if apiKey is updated).
 */

let initializeApp, getApps, getApp, getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged, sendPasswordResetEmail, getFirestore, doc, setDoc, getDoc;
let GoogleAuthProvider, signInWithCredential;

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
  GoogleAuthProvider = fbAuth.GoogleAuthProvider;
  signInWithCredential = fbAuth.signInWithCredential;

  const fbFs = require('firebase/firestore');
  getFirestore = fbFs.getFirestore;
  doc = fbFs.doc;
  setDoc = fbFs.setDoc;
  getDoc = fbFs.getDoc;
} catch (e) {
  // Firebase package not installed, fall back to offline Demo Mode
}

// Google Sign-In native module
let GoogleSignin;
try {
  const gsModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = gsModule.GoogleSignin;
} catch (e) {
  // Not available in this environment
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
 * Configure Google Sign-In.
 * Call this once at app startup (or before first Google sign-in).
 * The webClientId is your Firebase project's Web OAuth 2.0 client ID,
 * found in Firebase Console → Authentication → Sign-in method → Google → Web SDK configuration.
 */
export const configureGoogleSignIn = (webClientId) => {
  if (!GoogleSignin) return;
  GoogleSignin.configure({
    webClientId,
    offlineAccess: true,
  });
};

/**
 * Sign in with Google and authenticate with Firebase.
 * Returns { user, isDemo } where user is the Firebase user object.
 */
export const googleSignInWithFirebase = async () => {
  if (!GoogleSignin || !isFirebaseConfigured || !auth || !GoogleAuthProvider || !signInWithCredential) {
    // Demo Mode fallback
    return {
      user: {
        uid: 'demo_google_' + Date.now(),
        displayName: 'Google User',
        email: 'googleuser@gmail.com',
        photoURL: null,
      },
      isDemo: true,
    };
  }

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const signInResult = await GoogleSignin.signIn();

    // Extract the ID token — API shape differs slightly between library versions
    const idToken = signInResult?.data?.idToken ?? signInResult?.idToken;
    if (!idToken) throw new Error('No ID token returned from Google Sign-In.');

    const googleCredential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, googleCredential);
    return { user: userCredential.user, isDemo: false };
  } catch (error) {
    throw error;
  }
};


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
  // Also sign out from Google if available
  if (GoogleSignin) {
    try { await GoogleSignin.signOut(); } catch (_) {}
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
