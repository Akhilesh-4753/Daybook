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

    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          name: firebaseUser.displayName || 'Akhilesh',
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          productivityScore: 87,
          streak: 12,
        };
        setUser(userData);
        setIsAuthenticated(true);
        PreferencesService.saveSession(userData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadInitialSession = async () => {
    try {
      const savedUser = await PreferencesService.getSession();
      if (savedUser) {
        setUser(savedUser);
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
    const userData = {
      name: res.user.displayName || email.split('@')[0],
      email: res.user.email || email,
      uid: res.user.uid,
      productivityScore: 87,
      streak: 12,
    };
    setUser(userData);
    setIsAuthenticated(true);
    await PreferencesService.saveSession(userData);
    return res;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const res = await signUpUser(name, email, password);
    const userData = {
      name: res.user.displayName || name,
      email: res.user.email || email,
      uid: res.user.uid,
      productivityScore: 100,
      streak: 1,
    };
    setUser(userData);
    setIsAuthenticated(true);
    await PreferencesService.saveSession(userData);
    return res;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    await PreferencesService.clearSession();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const handleSetUser = useCallback((userData) => {
    setUser(userData);
    setIsAuthenticated(!!userData);
    if (userData) {
      PreferencesService.saveSession(userData);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
