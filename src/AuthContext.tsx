import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  isDemoMode: boolean;
  refreshProfile: () => Promise<void>;
  loginAsDemo: (isAdmin: boolean) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
  isDemoMode: false,
  refreshProfile: async () => {},
  loginAsDemo: () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchProfile = async (uid: string, isDemo: boolean) => {
    if (isDemo) {
      const saved = localStorage.getItem(`demo_profile_${uid}`);
      setProfile(saved ? JSON.parse(saved) : null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setProfile(userDoc.data() as UserProfile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid, isDemoMode);
    }
  };

  const loginAsDemo = (isAdmin: boolean) => {
    const demoUser = {
      uid: isAdmin ? 'demo-admin-id' : 'demo-user-id',
      email: isAdmin ? 'admin@demo.com' : 'user@demo.com',
      displayName: isAdmin ? 'Demo Admin' : 'Demo User',
      isDemo: true
    };
    setIsDemoMode(true);
    setUser(demoUser);
    localStorage.setItem('is_demo_mode', 'true');
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    
    // Also track in demo_users list for Admin Panel
    const demoUsers = JSON.parse(localStorage.getItem('demo_users') || '[]');
    if (!demoUsers.find((u: any) => u.uid === demoUser.uid)) {
      // We don't have the full profile yet, but we'll add it during onboarding
    }

    if (isAdmin) sessionStorage.setItem('dummy_admin', 'true');
    fetchProfile(demoUser.uid, true);
  };

  const logout = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      setUser(null);
      setProfile(null);
      localStorage.removeItem('is_demo_mode');
      localStorage.removeItem('demo_user');
    } else {
      await auth.signOut();
    }
  };

  useEffect(() => {
    // Check for existing demo session
    const wasDemo = localStorage.getItem('is_demo_mode') === 'true';
    if (wasDemo) {
      const demoUser = JSON.parse(localStorage.getItem('demo_user') || '{}');
      setIsDemoMode(true);
      setUser(demoUser);
      fetchProfile(demoUser.uid, true);
      setIsAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid, false);
      } else {
        setProfile(null);
        setLoading(false);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady, isDemoMode, refreshProfile, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
