"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
});

/** Hook to access authentication state and methods */
export const useAuth = () => useContext(AuthContext);

/** Provider wrapping the app to provide auth state */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        u.getIdToken().then((token) => {
          document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax`;
        });
      } else {
        document.cookie = "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Signed in successfully");
      router.push("/dashboard");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to sign in";
      toast.error(msg);
    }
  }, [router]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Signed in successfully");
      router.push("/dashboard");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to sign in";
      toast.error(msg);
    }
  }, [router]);

  const signUpWithEmail = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      toast.success("Account created successfully");
      router.push("/dashboard");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to create account";
      toast.error(msg);
    }
  }, [router]);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      document.cookie = "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to sign out";
      toast.error(msg);
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
