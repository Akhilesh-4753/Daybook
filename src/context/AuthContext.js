import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { subscribeToAuthChanges, logoutUser, signUpUser, loginUser, googleSignInWithFirebase, configureGoogleSignIn } from '../services/firebase';
import { PreferencesService } from '../services/PreferencesService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  // When a fresh login happens, we suppress the onAuthStateChanged handler
  // for ~2.8s so the success modal in LoginScreen has time to display
  // before the screen is unmounted by isAuthenticated becoming true.
  const suppressAuthChange = useRef(false);

  // Configure Google Sign-In once on mount
  // Replace the webClientId below with your Firebase project's Web client ID:
  // Firebase Console → Authentication → Sign-in method → Google → Web SDK configuration
  useEffect(() => {
    configureGoogleSignIn('YOUR_WEB_CLIENT_ID_FROM_FIREBASE_CONSOLE');
  }, []);

  useEffect(() => {
    loadInitialSession();

    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      // If a fresh login() call is in progress (showing the success modal),
      // skip this automatic trigger — login() will set isAuthenticated itself.
      if (suppressAuthChange.current) return;
      try {
        if (firebaseUser) {
          const userKey = firebaseUser.uid || firebaseUser.email;
          const savedSession = await PreferencesService.getSession();
          const accountProfile = await PreferencesService.getUserProfile(userKey);

          const userData = {
            name: (accountProfile && accountProfile.name) || (savedSession && savedSession.name) || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
            email: firebaseUser.email,
            uid: firebaseUser.uid,
            photoUri: (accountProfile && accountProfile.photoUri) || (savedSession && savedSession.photoUri) || firebaseUser.photoURL || null,
            createdAt: (savedSession && savedSession.createdAt) || new Date().toISOString().split('T')[0],
            productivityScore: (savedSession && savedSession.productivityScore) || 0,
            streak: (savedSession && savedSession.streak) || 0,
          };
          setUser(userData);
          setIsAuthenticated(true);
          PreferencesService.saveSession(userData);
          PreferencesService.saveUserProfile(userKey, { name: userData.name, photoUri: userData.photoUri });
        }
      } catch (e) {
        // Safe catch
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadInitialSession = async () => {
    try {
      const savedUser = await PreferencesService.getSession();
      if (savedUser) {
        const userKey = savedUser.uid || savedUser.email;
        const accountProfile = await PreferencesService.getUserProfile(userKey);
        const mergedUser = accountProfile
          ? { ...savedUser, name: accountProfile.name || savedUser.name, photoUri: accountProfile.photoUri || savedUser.photoUri }
          : savedUser;
        setUser(mergedUser);
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error('Session restore error:', e);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useCallback(async () => {
    suppressAuthChange.current = true;
    const res = await googleSignInWithFirebase();
    const userKey = res.user.uid || res.user.email;
    const savedUser = await PreferencesService.getSession();
    const accountProfile = await PreferencesService.getUserProfile(userKey);

    const userData = {
      name: (accountProfile && accountProfile.name) || res.user.displayName || 'Google User',
      email: res.user.email,
      uid: res.user.uid,
      photoUri: (accountProfile && accountProfile.photoUri) || res.user.photoURL || null,
      productivityScore: (savedUser && savedUser.productivityScore) || 0,
      streak: (savedUser && savedUser.streak) || 0,
    };
    await PreferencesService.saveSession(userData);
    await PreferencesService.saveUserProfile(userKey, { name: userData.name, photoUri: userData.photoUri });
    setTimeout(() => {
      suppressAuthChange.current = false;
      setUser(userData);
      setIsAuthenticated(true);
    }, 1400);
    return { res, userData };
  }, []);

  const login = useCallback(async (email, password) => {
    // Block onAuthStateChanged from firing immediately — we want the success
    // modal in LoginScreen to stay visible for ~2.5s before navigating.
    suppressAuthChange.current = true;
    const res = await loginUser(email, password);
    const userKey = res.user.uid || res.user.email || email;
    const savedUser = await PreferencesService.getSession();
    const accountProfile = await PreferencesService.getUserProfile(userKey);

    const userData = {
      name: (accountProfile && accountProfile.name) || (savedUser && savedUser.name) || res.user.displayName || email.split('@')[0],
      email: res.user.email || email,
      uid: res.user.uid,
      photoUri: (accountProfile && accountProfile.photoUri) || (savedUser && savedUser.photoUri) || res.user.photoURL || null,
      productivityScore: (savedUser && savedUser.productivityScore) || 0,
      streak: (savedUser && savedUser.streak) || 0,
    };
    await PreferencesService.saveSession(userData);
    await PreferencesService.saveUserProfile(userKey, { name: userData.name, photoUri: userData.photoUri });
    // After 1.4s the modal will have finished — allow auth changes again and
    // commit the user to state (which unmounts LoginScreen).
    setTimeout(() => {
      suppressAuthChange.current = false;
      setUser(userData);
      setIsAuthenticated(true);
    }, 1400);
    return { res, userData };
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const res = await signUpUser(name, email, password);
    const userKey = res.user.uid || res.user.email || email;
    const userData = {
      name: res.user.displayName || name,
      email: res.user.email || email,
      uid: res.user.uid,
      photoUri: null,
      productivityScore: 0,
      streak: 0,
    };
    setUser(userData);
    setIsAuthenticated(true);
    await PreferencesService.saveSession(userData);
    await PreferencesService.saveUserProfile(userKey, { name: userData.name, photoUri: userData.photoUri });
    return res;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    await PreferencesService.clearSession();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const updateUserProfile = useCallback(async (name, photoUri) => {
    let permanentPhoto = photoUri;
    if (photoUri) {
      permanentPhoto = await PreferencesService.saveProfilePhoto(photoUri);
    }

    setUser((prev) => {
      const updated = {
        ...(prev || {}),
        name: name !== undefined ? name : (prev?.name || 'User'),
        photoUri: permanentPhoto !== undefined ? permanentPhoto : prev?.photoUri,
      };
      PreferencesService.saveSession(updated);
      const userKey = updated.uid || updated.email;
      if (userKey) {
        PreferencesService.saveUserProfile(userKey, { name: updated.name, photoUri: updated.photoUri });
      }
      return updated;
    });
  }, []);

  const handleSetUser = useCallback((userData) => {
    setUser(userData);
    setIsAuthenticated(!!userData);
    if (userData) {
      PreferencesService.saveSession(userData);
      const userKey = userData.uid || userData.email;
      if (userKey) {
        PreferencesService.saveUserProfile(userKey, { name: userData.name, photoUri: userData.photoUri });
      }
    } else {
      PreferencesService.clearSession();
    }
  }, []);


  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        loginWithGoogle,
        signup,
        logout,
        setUser: handleSetUser,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
