import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import { aiRequestSchema } from "@/lib/validations";
import { apiRateLimiter } from "@/lib/utils";

const PROMPTS: Record<string, string> = {
  summarize_channel:
    `You are Sphere AI, an intelligent assistant in SyncSphere.
Summarize the following chat conversation concisely.
Output format:
**Summary:** (2-3 sentence overview)
**Key Action Items:**
- item 1
- item 2
**Decisions Made:**
- decision 1

Conversation:`,

  generate_tasks:
    `You are Sphere AI. Extract actionable tasks from this conversation.
Output a JSON array of tasks with this format:
[{"title": "...", "description": "...", "priority": "Medium|High|Low|Urgent"}]
Only output valid JSON, no markdown.

Conversation:`,

  smart_standup:
    `You are Sphere AI. Generate a daily standup report from the following task activity data.
Format:
**✅ Completed Yesterday:**
- task 1
**🔄 In Progress:**
- task 2
**🚧 Blockers:**
- blocker 1

Activity data:`,

  meeting_notes_to_tasks:
    `You are Sphere AI. Convert these meeting notes into a structured task list.
Output a JSON array: [{"title": "...", "description": "...", "priority": "Medium"}]
Only output valid JSON.

Meeting notes:`,

  suggest_priority:
    `You are Sphere AI. Analyze this workload and suggest optimal priority ordering.
Consider deadlines, dependencies, and team capacity.
Output as a numbered list with reasoning.

Current tasks:`,
};

/** POST /api/ai — Gemini-powered AI assistant endpoint */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientIp = req.headers.get("x-forwarded-for") || "anonymous";
    if (!apiRateLimiter.check(clientIp)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = aiRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.errors }, { status: 400 });
    }

    const { action, context } = parsed.data;
    const systemPrompt = PROMPTS[action];
    if (!systemPrompt) {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const model = getGeminiModel();
    const fullPrompt = `${systemPrompt}\n\n${context}`;

    // Use streaming for real-time response
    const result = await model.generateContentStream(fullPrompt);

    let fullText = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
    }

    return NextResponse.json({ result: fullText, action });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "AI generation failed";
    console.error("Gemini API Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
