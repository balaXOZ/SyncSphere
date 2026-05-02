"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Workspace } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useWorkspaces() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "workspaces"),
      where(`members.${user.uid}`, "in", ["Owner", "Admin", "Member"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const wsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workspace));
      setWorkspaces(wsData);
      
      if (wsData.length > 0 && !activeWorkspace) {
        setActiveWorkspace(wsData[0]);
      } else if (wsData.length === 0) {
        setActiveWorkspace(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching workspaces:", error);
      toast.error("Failed to load workspaces");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, activeWorkspace]);

  const createWorkspace = async (name: string) => {
    if (!user) return;
    try {
      const newWsRef = doc(collection(db, "workspaces"));
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const newWorkspace: Workspace = {
        id: newWsRef.id,
        name,
        ownerId: user.uid,
        members: {
          [user.uid]: "Owner"
        },
        inviteCode,
        createdAt: Date.now()
      };

      await setDoc(newWsRef, newWorkspace);
      setActiveWorkspace(newWorkspace);
      toast.success("Workspace created successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error("Failed to create workspace");
    }
  };

  return {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    createWorkspace,
    loading
  };
}
