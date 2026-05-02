import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, MessageSquare, Sparkles, Shield, Zap } from "lucide-react";

/** Landing page for SyncSphere */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-background dark:via-background dark:to-background">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium mb-6">
          <Sparkles className="h-3 w-3" />
          AI-Powered Collaboration
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight max-w-3xl bg-gradient-to-r from-foreground via-foreground to-indigo-600 bg-clip-text">
          SyncSphere
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-xl">
          Unify tasks, real-time chat, and team visibility into one elegant, AI-powered workspace.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/login">
            <Button size="lg" className="shadow-lg bg-primary hover:bg-primary/90">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything your team needs</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: LayoutDashboard, title: "Kanban Board", desc: "Drag-and-drop task management with real-time sync across your team." },
              { icon: MessageSquare, title: "Real-Time Chat", desc: "Channel-based messaging with file sharing, reactions, and mentions." },
              { icon: Sparkles, title: "Sphere AI", desc: "AI assistant powered by Google Gemini that summarizes, generates tasks, and more." },
              { icon: Shield, title: "Enterprise Security", desc: "Role-based access, Firestore rules, CSP headers, and encrypted secrets." },
              { icon: Zap, title: "Lightning Fast", desc: "Server Components, code splitting, and optimized Firestore queries." },
              { icon: ArrowRight, title: "Deploy Anywhere", desc: "Dockerized for Google Cloud Run with CI/CD via GitHub Actions." },
            ].map((f, i) => (
              <article key={i} className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
                <f.icon className="h-8 w-8 text-indigo-500 mb-4" aria-hidden="true" />
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <p>Built with Next.js 14, Firebase, and Google Gemini — Hackathon 2026</p>
      </footer>
    </main>
  );
}
