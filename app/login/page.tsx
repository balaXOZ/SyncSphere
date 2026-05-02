"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, Mail, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginSchema, registerSchema } from "@/lib/validations";
import { toast } from "sonner";

/** Login page with Google Sign-In and Email/Password tabs */
export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user, loading } = useAuth();
  const router = useRouter();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    await signInWithEmail(loginEmail, loginPassword);
    setSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerSchema.safeParse({ email: regEmail, password: regPassword, displayName: regName });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    await signUpWithEmail(regEmail, regPassword, regName);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="skeleton h-12 w-48 mx-auto rounded-lg" />
          <div className="skeleton h-4 w-32 mx-auto rounded" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-background dark:via-background dark:to-background p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
            S
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">SyncSphere</CardTitle>
          <CardDescription className="text-base">Sign in to your workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={signInWithGoogle} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" disabled={submitting}>
            <LogIn className="mr-2 h-5 w-5" aria-hidden="true" />
            Sign in with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="you@example.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" placeholder="••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required autoComplete="current-password" />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                  {submitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Display Name</Label>
                  <Input id="reg-name" placeholder="Jane Doe" value={regName} onChange={e => setRegName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" type="email" placeholder="you@example.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input id="reg-password" type="password" placeholder="••••••" value={regPassword} onChange={e => setRegPassword(e.target.value)} required autoComplete="new-password" />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                  {submitting ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
