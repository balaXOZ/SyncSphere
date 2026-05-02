"use client";

import { useAuth } from "@/lib/auth-context";
import { WorkspaceProvider, useWorkspaceContext } from "@/lib/workspace-context";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, MessageSquare, BarChart3, Bell, Plus, Check, Copy, UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SidebarSkeleton } from "@/components/ui/skeleton";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { AIAssistant } from "@/components/ai/AIAssistant";

function DashboardSidebar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const { workspaces, activeWorkspace, setActiveWorkspace, createWorkspace, joinWorkspace } = useWorkspaceContext();
  const [newWsName, setNewWsName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Board", icon: LayoutDashboard },
    { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
    { href: "/dashboard/overview", label: "Dashboard", icon: BarChart3 },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  ];

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (newWsName.trim()) {
      await createWorkspace(newWsName.trim());
      setNewWsName("");
      setIsDialogOpen(false);
    }
  }, [newWsName, createWorkspace]);

  const handleJoin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim()) {
      await joinWorkspace(inviteCode.trim());
      setInviteCode("");
      setIsDialogOpen(false);
    }
  }, [inviteCode, joinWorkspace]);

  const copyInviteCode = useCallback(() => {
    if (activeWorkspace?.inviteCode) {
      navigator.clipboard.writeText(activeWorkspace.inviteCode);
      toast.success("Invite code copied!");
    }
  }, [activeWorkspace]);

  return (
    <aside className="w-64 border-r flex flex-col bg-muted/20 shrink-0" role="complementary" aria-label="Sidebar navigation">
      <div className="p-4 border-b">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-between h-10 px-3 font-semibold shadow-sm hover:bg-muted/50 transition-all">
              <span className="truncate">{activeWorkspace?.name || "Select Workspace"}</span>
              <Plus className="h-4 w-4 shrink-0 ml-2" aria-hidden="true" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Workspaces</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {/* Existing workspaces */}
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {workspaces.map((ws) => (
                  <Button key={ws.id} variant="ghost" className="w-full justify-start h-auto py-2" onClick={() => { setActiveWorkspace(ws); setIsDialogOpen(false); }}>
                    <div className="flex w-full items-center justify-between">
                      <span className="truncate">{ws.name}</span>
                      {activeWorkspace?.id === ws.id && <Check className="h-4 w-4 shrink-0" />}
                    </div>
                  </Button>
                ))}
                {workspaces.length === 0 && <p className="text-sm text-muted-foreground px-2">No workspaces yet.</p>}
              </div>

              {/* Invite code display */}
              {activeWorkspace && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <span className="text-xs text-muted-foreground">Invite Code:</span>
                  <Badge variant="secondary" className="font-mono">{activeWorkspace.inviteCode}</Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyInviteCode} aria-label="Copy invite code">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Actions</span></div></div>

              <Tabs defaultValue="create">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="create">Create</TabsTrigger>
                  <TabsTrigger value="join">Join</TabsTrigger>
                </TabsList>
                <TabsContent value="create">
                  <form onSubmit={handleCreate} className="flex gap-2 pt-2">
                    <Input placeholder="Workspace name" value={newWsName} onChange={e => setNewWsName(e.target.value)} required />
                    <Button type="submit"><Plus className="h-4 w-4" /></Button>
                  </form>
                </TabsContent>
                <TabsContent value="join">
                  <form onSubmit={handleJoin} className="flex gap-2 pt-2">
                    <Input placeholder="Invite code" value={inviteCode} onChange={e => setInviteCode(e.target.value)} required className="font-mono uppercase" />
                    <Button type="submit"><UserPlus className="h-4 w-4" /></Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
              pathname === item.href ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User avatar"} />
            <AvatarFallback>{user?.displayName?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <ThemeToggle />
        </div>
        <Button variant="outline" className="w-full justify-start" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Log out
        </Button>
      </div>
    </aside>
  );
}

function WorkspaceGate({ children }: { children: React.ReactNode }) {
  const { activeWorkspace, loading } = useWorkspaceContext();

  if (loading) {
    return <SidebarSkeleton />;
  }

  if (!activeWorkspace) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/10 p-8">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold">Welcome to SyncSphere</h2>
          <p className="text-muted-foreground">Create or join a workspace using the sidebar to get started.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/** Dashboard layout with 3-panel architecture: sidebar | main | AI rail */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <main id="main-content" className="flex-1 flex min-w-0 overflow-hidden relative" role="main">
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <WorkspaceGate>{children}</WorkspaceGate>
          </div>
          <AIAssistant />
        </main>
      </div>
    </WorkspaceProvider>
  );
}
