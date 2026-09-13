import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { auth } from '@/api/authClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const checkUserAuth = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setIsLoadingAuth(true);
      const currentUser = await auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      if (!silent) setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();

    // Supabase fires onAuthStateChange for routine events too — notably a
    // silent token refresh whenever the browser tab regains focus, not just
    // real sign-in/sign-out. Re-running checkUserAuth() with the loading
    // flag set for those events flips isLoadingAuth back to true, which
    // makes ProtectedRoute unmount its <Outlet/> and show the spinner again
    // — i.e. the whole admin page appears to "refresh itself" every time you
    // switch tabs. Only a real SIGNED_OUT needs that full, visible re-check;
    // everything else just re-syncs the user in the background.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      checkUserAuth({ silent: event !== "SIGNED_OUT" });
    });

    return () => subscription.unsubscribe();
  }, [checkUserAuth]);

  const logout = async () => {
    await auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Kept for compatibility with ProtectedRoute; navigation itself happens where it's called.
  const navigateToLogin = () => {};

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authChecked,
      authError: null,
      logout,
      navigateToLogin,
      checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};