"use client";

import { useState, useEffect, useRef } from "react";
import { collection, query, where, onSnapshot, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { Workspace } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/** Hook to manage workspaces with real-time Firestore sync */
export function useWorkspaces() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const hasSetInitial = useRef(false);

  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setLoading(false);
      hasSetInitial.current = false;
      return;
    }

    const q = query(
      collection(db, "workspaces"),
      where(`members.${user.uid}`, "in", ["Owner", "Admin", "Member"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const wsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Workspace));
      setWorkspaces(wsData);
      
      if (wsData.length > 0 && !hasSetInitial.current) {
        setActiveWorkspace(wsData[0]);
        hasSetInitial.current = true;
      } else if (wsData.length === 0) {
        setActiveWorkspace(null);
        hasSetInitial.current = false;
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching workspaces:", error);
      toast.error("Failed to load workspaces");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

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
      hasSetInitial.current = true;
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
