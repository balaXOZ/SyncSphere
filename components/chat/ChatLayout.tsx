"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Hash, Send, Sparkles, Paperclip, Plus, SmilePlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useChat, useChannels } from "@/lib/hooks/useChat";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { MessageSkeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";

const EMOJI_REACTIONS = ["👍", "❤️", "😂", "🎉", "🤔", "👀"];

/** Full chat layout with channels sidebar, messages, reactions, file upload, and AI summarize */
export function ChatLayout() {
  const { activeWorkspace } = useWorkspaceContext();
  const { user } = useAuth();
  const { channels, loading: channelsLoading, createChannel } = useChannels(activeWorkspace?.id);
  const [activeChannelId, setActiveChannelId] = useState<string>("");
  const [messageText, setMessageText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set active channel to first channel when loaded
  useEffect(() => {
    if (channels.length > 0 && !activeChannelId) {
      setActiveChannelId(channels[0].id);
    }
  }, [channels, activeChannelId]);

  const { messages, loading: msgsLoading, sendMessage, addReaction, uploadFile } = useChat(activeWorkspace?.id, activeChannelId);

  const currentChannel = channels.find(c => c.id === activeChannelId);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageText.trim()) return;
    await sendMessage(messageText);
    setMessageText("");
  }, [messageText, sendMessage]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const attachment = await uploadFile(file);
    if (attachment) {
      await sendMessage(`📎 Shared file: ${attachment.name}`, false, [attachment]);
    }
    e.target.value = "";
  }, [uploadFile, sendMessage]);

  const handleSummarize = useCallback(async () => {
    if (messages.length === 0) {
      toast.info("No messages to summarize");
      return;
    }
    setAiLoading(true);
    try {
      const last50 = messages.slice(-50);
      const chatHistory = last50.map(m => `${m.senderName}: ${m.text}`).join("\n");
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "summarize_channel",
          context: chatHistory,
          workspaceId: activeWorkspace?.id || "",
        }),
      });
      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      await sendMessage(data.result, true);
    } catch (error) {
      toast.error("Failed to generate summary");
    } finally {
      setAiLoading(false);
    }
  }, [messages, activeWorkspace, sendMessage]);

  const handleCreateChannel = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (newChannelName.trim()) {
      await createChannel(newChannelName.trim());
      setNewChannelName("");
    }
  }, [newChannelName, createChannel]);

  return (
    <div className="flex flex-1 h-full min-w-0">
      {/* Channels Sidebar */}
      <div className="w-56 border-r bg-muted/10 flex flex-col shrink-0">
        <div className="p-3 border-b">
          <h2 className="font-semibold text-sm mb-2">Channels</h2>
          <form onSubmit={handleCreateChannel} className="flex gap-1">
            <Input
              placeholder="New channel"
              value={newChannelName}
              onChange={e => setNewChannelName(e.target.value)}
              className="h-7 text-xs"
            />
            <Button type="submit" variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <Plus className="h-3 w-3" />
            </Button>
          </form>
        </div>
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-0.5">
            {channels.map(channel => (
              <button
                key={channel.id}
                onClick={() => setActiveChannelId(channel.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                  activeChannelId === channel.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted text-muted-foreground"
                }`}
                aria-current={activeChannelId === channel.id ? "true" : undefined}
              >
                <Hash className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{channel.name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <div className="h-12 border-b flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {currentChannel?.name || "Select a channel"}
          </div>
          <Button variant="outline" size="sm" onClick={handleSummarize} disabled={aiLoading || msgsLoading} className="text-xs h-7">
            <Sparkles className="h-3 w-3 mr-1.5 text-indigo-500" aria-hidden="true" />
            {aiLoading ? "Summarizing..." : "Summarize"}
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4" role="log" aria-label="Chat messages" aria-live="polite">
          {msgsLoading ? (
            <div className="space-y-6">
              <MessageSkeleton />
              <MessageSkeleton />
              <MessageSkeleton />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(msg => (
                <article key={msg.id} className="flex gap-3 group" aria-label={`Message from ${msg.senderName}`}>
                  <Avatar className="h-8 w-8 shrink-0">
                    {msg.isAI ? (
                      <div className="h-full w-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    ) : (
                      <>
                        <AvatarImage src={msg.senderPhoto} alt={msg.senderName} />
                        <AvatarFallback className="text-xs">{msg.senderName[0]}</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-sm">{msg.senderName}</span>
                      <span className="text-[10px] text-muted-foreground">{formatRelativeTime(msg.createdAt)}</span>
                      {msg.isAI && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border-0">
                          AI Generated
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm mt-0.5 text-foreground whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map((att, i) => (
                          <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline p-1.5 rounded bg-muted/50 w-fit">
                            <Paperclip className="h-3 w-3" /> {att.name} ({(att.size / 1024).toFixed(0)}KB)
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Reactions */}
                    <div className="flex items-center gap-1 mt-1">
                      {msg.reactions && Object.entries(msg.reactions).map(([emoji, users]) => (
                        users.length > 0 && (
                          <button
                            key={emoji}
                            onClick={() => addReaction(msg.id, emoji)}
                            className={`text-xs px-1.5 py-0.5 rounded-full border transition-colors ${
                              users.includes(user?.uid || "") ? "bg-primary/10 border-primary/30" : "bg-muted/50 border-transparent hover:bg-muted"
                            }`}
                          >
                            {emoji} {users.length}
                          </button>
                        )
                      ))}
                      <button
                        onClick={() => setShowReactions(showReactions === msg.id ? null : msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-1"
                        aria-label="Add reaction"
                      >
                        <SmilePlus className="h-3.5 w-3.5" />
                      </button>
                      {showReactions === msg.id && (
                        <div className="flex gap-0.5 bg-card border rounded-lg p-1 shadow-lg">
                          {EMOJI_REACTIONS.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => { addReaction(msg.id, emoji); setShowReactions(null); }}
                              className="hover:bg-muted rounded p-1 text-sm"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.txt,.zip"
            />
            <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()} aria-label="Attach file">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder={`Message #${currentChannel?.name || "..."}`}
              className="flex-1"
              disabled={msgsLoading}
              aria-label="Message input"
            />
            <Button type="submit" size="icon" disabled={!messageText.trim() || msgsLoading} aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
