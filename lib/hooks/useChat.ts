"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Message, Channel, Attachment } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

/** Hook for managing chat messages in Firestore */
export function useChat(workspaceId?: string, channelId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!workspaceId || !channelId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "messages"),
      where("workspaceId", "==", workspaceId),
      where("channelId", "==", channelId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Message));
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Chat error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [workspaceId, channelId]);

  const sendMessage = useCallback(async (text: string, isAI = false, attachments?: Attachment[]) => {
    if (!workspaceId || !channelId || (!user && !isAI)) return;

    const newRef = doc(collection(db, "messages"));
    const msg: Message = {
      id: newRef.id,
      workspaceId,
      channelId,
      senderId: isAI ? "sphere-ai" : user!.uid,
      senderName: isAI ? "Sphere AI" : user!.displayName || "Unknown",
      senderPhoto: isAI ? undefined : user!.photoURL || undefined,
      text,
      isAI,
      attachments,
      reactions: {},
      createdAt: Date.now(),
    };
    await setDoc(newRef, msg);
  }, [workspaceId, channelId, user]);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;
    const msgRef = doc(db, "messages", messageId);
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;

    const reactions = { ...(msg.reactions || {}) };
    const users = reactions[emoji] || [];
    if (users.includes(user.uid)) {
      reactions[emoji] = users.filter(u => u !== user.uid);
      if (reactions[emoji].length === 0) delete reactions[emoji];
    } else {
      reactions[emoji] = [...users, user.uid];
    }
    await updateDoc(msgRef, { reactions });
  }, [user, messages]);

  const uploadFile = useCallback(async (file: File): Promise<Attachment | null> => {
    if (!user || !workspaceId) return null;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return null;
    }
    try {
      const path = `workspaces/${workspaceId}/uploads/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return { url, name: file.name, type: file.type, size: file.size };
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
      return null;
    }
  }, [user, workspaceId]);

  return { messages, loading, sendMessage, addReaction, uploadFile };
}

/** Hook for managing channels */
export function useChannels(workspaceId?: string) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) {
      setChannels([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "channels"), where("workspaceId", "==", workspaceId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Channel));
      setChannels(chs);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsubscribe();
  }, [workspaceId]);

  const createChannel = useCallback(async (name: string) => {
    if (!workspaceId) return;
    const newRef = doc(collection(db, "channels"));
    await setDoc(newRef, {
      id: newRef.id,
      workspaceId,
      name: name.toLowerCase().replace(/\s+/g, "-"),
      createdAt: Date.now(),
    });
    toast.success(`Channel #${name} created`);
  }, [workspaceId]);

  return { channels, loading, createChannel };
}
