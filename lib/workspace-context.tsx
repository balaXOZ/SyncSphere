"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { collection, query, where, onSnapshot, doc, setDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./auth-context";
import { Workspace, Role } from "@/types";
import { toast } from "sonner";
import { generateInviteCode } from "./utils";

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (ws: Workspace) => void;
  createWorkspace: (name: string) => Promise<void>;
  joinWorkspace: (inviteCode: string) => Promise<void>;
  loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: [],
  activeWorkspace: null,
  setActiveWorkspace: () => {},
  createWorkspace: async () => {},
  joinWorkspace: async () => {},
  loading: true,
});

/** Hook to access workspace state */
export const useWorkspaceContext = () => useContext(WorkspaceContext);

/** Provider wrapping dashboard to manage workspaces */
export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setLoading(false);
      return;
    }

    // Query all workspaces where user is a member
    const q = query(collection(db, "workspaces"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs
        .map(d => ({ ...d.data(), id: d.id } as Workspace))
        .filter(ws => ws.members && ws.members[user.uid]);
      setWorkspaces(all);
      if (all.length > 0 && !activeWorkspace) {
        setActiveWorkspace(all[0]);
      }
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, activeWorkspace]);

  const createWorkspace = useCallback(async (name: string) => {
    if (!user) return;
    const newRef = doc(collection(db, "workspaces"));
    const ws: Workspace = {
      id: newRef.id,
      name,
      ownerId: user.uid,
      members: { [user.uid]: "Owner" as Role },
      inviteCode: generateInviteCode(),
      createdAt: Date.now(),
    };
    await setDoc(newRef, ws);

    // Also create default channels
    const generalRef = doc(collection(db, "channels"));
    await setDoc(generalRef, {
      id: generalRef.id,
      workspaceId: newRef.id,
      name: "general",
      description: "General discussion",
      createdAt: Date.now(),
    });
    const randomRef = doc(collection(db, "channels"));
    await setDoc(randomRef, {
      id: randomRef.id,
      workspaceId: newRef.id,
      name: "random",
      description: "Random chatter",
      createdAt: Date.now(),
    });

    setActiveWorkspace(ws);
    toast.success(`Workspace "${name}" created!`);
  }, [user]);

  const joinWorkspace = useCallback(async (inviteCode: string) => {
    if (!user) return;
    const q = query(collection(db, "workspaces"), where("inviteCode", "==", inviteCode.toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) {
      toast.error("Invalid invite code");
      return;
    }
    const wsDoc = snap.docs[0];
    const wsData = wsDoc.data() as Workspace;
    if (wsData.members[user.uid]) {
      toast.info("You are already a member of this workspace");
      setActiveWorkspace({ ...wsData, id: wsDoc.id });
      return;
    }
    await updateDoc(doc(db, "workspaces", wsDoc.id), {
      [`members.${user.uid}`]: "Member" as Role,
    });
    toast.success(`Joined workspace "${wsData.name}"!`);
  }, [user]);

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, setActiveWorkspace, createWorkspace, joinWorkspace, loading }}>
      {children}
    </WorkspaceContext.Provider>
  );
};
