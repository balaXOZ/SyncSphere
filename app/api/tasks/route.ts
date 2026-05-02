import { NextRequest, NextResponse } from "next/server";
import { createTaskSchema } from "@/lib/validations";
import { apiRateLimiter } from "@/lib/utils";

/** POST /api/tasks — Create a new task with Zod validation */
export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for") || "anonymous";
    if (!apiRateLimiter.check(clientIp)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.errors }, { status: 400 });
    }

    // In production, we'd use Firebase Admin SDK here
    // For now, return validated data with generated ID
    const task = {
      ...parsed.data,
      id: `task_${Date.now()}`,
      subtasks: [],
      comments: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: 0,
    };

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    console.error("Task creation error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
