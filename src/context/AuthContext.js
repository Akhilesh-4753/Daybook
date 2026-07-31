import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthChanges, logoutUser, signUpUser, loginUser } from '../services/firebase';
import { StorageService } from '../services/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialUser();

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
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadInitialUser = async () => {
    try {
      const savedUser = await StorageService.getUser();
      if (savedUser) {
        setUser(savedUser);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    setUser(res.user);
    setIsAuthenticated(true);
    return res;
  };

  const signup = async (name, email, password) => {
    const res = await signUpUser(name, email, password);
    setUser(res.user);
    setIsAuthenticated(true);
    return res;
  };

  const logout = async () => {
    await logoutUser();
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleSetUser = (userData) => {
    setUser(userData);
    setIsAuthenticated(!!userData);
  };

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
