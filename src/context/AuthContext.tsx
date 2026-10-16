// ============================================================
// ECEForge — Authentication Context
// ============================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { AdminUser } from '@/types';

interface AuthContextValue {
  user: User | null;
  adminProfile: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
  const [loading, setLoading]         = useState(true);

  const [isCustomClaimAdmin, setIsCustomClaimAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // Check token custom claim first
          const tokenResult = await firebaseUser.getIdTokenResult(true);
          const hasClaim = tokenResult.claims.admin === true;
          setIsCustomClaimAdmin(hasClaim);

          // Check if this user has an admin profile in Firestore
          const snap = await getDoc(doc(db, 'admins', firebaseUser.uid));
          if (snap.exists()) {
            setAdminProfile({ uid: firebaseUser.uid, ...snap.data() } as AdminUser);
          } else if (hasClaim) {
            setAdminProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Administrator',
              role: 'admin',
            });
          } else {
            setAdminProfile(null);
          }
        } catch (err) {
          console.warn('Error verifying admin authorization:', err);
          setAdminProfile(null);
          setIsCustomClaimAdmin(false);
        }
      } else {
        setAdminProfile(null);
        setIsCustomClaimAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        adminProfile,
        isAdmin: !!adminProfile || isCustomClaimAdmin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
