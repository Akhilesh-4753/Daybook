import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscribeToAuthChanges, logoutUser, signUpUser, loginUser } from '../services/firebase';
import { PreferencesService } from '../services/PreferencesService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialSession();

    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
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
            productivityScore: (savedSession && savedSession.productivityScore) || 100,
            streak: (savedSession && savedSession.streak) || 1,
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

  const login = useCallback(async (email, password) => {
    const res = await loginUser(email, password);
    const userKey = res.user.uid || res.user.email || email;
    const savedUser = await PreferencesService.getSession();
    const accountProfile = await PreferencesService.getUserProfile(userKey);

    const userData = {
      name: (accountProfile && accountProfile.name) || (savedUser && savedUser.name) || res.user.displayName || email.split('@')[0],
      email: res.user.email || email,
      uid: res.user.uid,
      photoUri: (accountProfile && accountProfile.photoUri) || (savedUser && savedUser.photoUri) || res.user.photoURL || null,
      productivityScore: 87,
      streak: 12,
    };
    setUser(userData);
    setIsAuthenticated(true);
    await PreferencesService.saveSession(userData);
    await PreferencesService.saveUserProfile(userKey, { name: userData.name, photoUri: userData.photoUri });
    return res;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const res = await signUpUser(name, email, password);
    const userKey = res.user.uid || res.user.email || email;
    const userData = {
      name: res.user.displayName || name,
      email: res.user.email || email,
      uid: res.user.uid,
      photoUri: null,
      productivityScore: 100,
      streak: 1,
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
