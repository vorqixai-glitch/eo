import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { createLovableAi } from "@/lib/ai-gateway.server";
import { buildTools } from "@/lib/ai-tools.server";
import { getPersona } from "@/lib/personas";
import { adminAuth, adminDb } from "@/lib/firebase-admin.server";
import crypto from "crypto";

const ALLOWED_MODELS = new Set([
  "google/gemini-3-flash-preview",
  "google/gemini-3.1-pro-preview",
  "google/gemini-2.5-pro",
  "openai/gpt-5",
  "openai/gpt-5-mini",
]);

function extractText(msg: UIMessage): string {
  return (msg.parts ?? [])
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        if (!token) return new Response("Unauthorized", { status: 401 });

        const lovableKey = process.env.LOVABLE_API_KEY;
        if (!lovableKey) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        let decoded;
        try {
          decoded = await adminAuth.verifyIdToken(token);
        } catch (error) {
          return new Response("Unauthorized", { status: 401 });
        }
        const userId = decoded.uid;

        let body: { threadId?: string; messages?: UIMessage[]; model?: string; personaId?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }
        const threadId = body.threadId;
        const messages = body.messages;
        if (!threadId || !Array.isArray(messages)) {
          return new Response("Bad request", { status: 400 });
        }
        const model =
          body.model && ALLOWED_MODELS.has(body.model)
            ? body.model
            : "google/gemini-3-flash-preview";

        const isMockThread = threadId === "00000000-0000-0000-0000-000000000000";
        let personaId = body.personaId ?? "default";
        
        let projectSystemPrompt: string | null = null;
        let projectName: string | null = null;

        if (!isMockThread) {
          const threadDoc = await adminDb.collection("threads").doc(threadId).get();
          if (!threadDoc.exists) return new Response("Thread not found", { status: 404 });
          const thread = threadDoc.data()!;

          personaId = body.personaId ?? thread.persona_id ?? "default";

          if (thread.project_id) {
            const projDoc = await adminDb.collection("projects").doc(thread.project_id).get();
            if (projDoc.exists) {
              const proj = projDoc.data()!;
              projectName = proj.name;
              projectSystemPrompt = proj.system_prompt;
            }
          }

          // Persist last user message + persona/model changes + auto-title
          const lastUser = [...messages].reverse().find((m) => m.role === "user");
          if (lastUser) {
            const text = extractText(lastUser);
            if (text) {
              await adminDb.collection("messages").add({
                thread_id: threadId,
                role: "user",
                content: text,
                created_at: new Date().toISOString()
              });
              const updates: { title?: string; model?: string; persona_id?: string; updated_at?: string } = {};
              if (thread.title === "New chat") updates.title = text.slice(0, 60);
              if (thread.model !== model) updates.model = model;
              if (thread.persona_id !== personaId) updates.persona_id = personaId;
              if (Object.keys(updates).length > 0) {
                updates.updated_at = new Date().toISOString();
                await adminDb.collection("threads").doc(threadId).update(updates);
              }
            }
          }
        }

        const persona = getPersona(personaId);
        const provider = createLovableAi(lovableKey);
        const allTools = buildTools({ db: adminDb, threadId, userId, lovableApiKey: lovableKey });
        // Only expose the swarm delegation tool to the Swarm Commander persona.
        const tools = persona.swarm
          ? allTools
          : Object.fromEntries(Object.entries(allTools).filter(([k]) => k !== "delegate_to_agent"));

        const systemParts = [
          persona.system,
          "Answer clearly in Markdown (headings, lists, code fences).",
          "Available tools: create_artifact/update_artifact (side-panel docs/code/HTML), web_search, fetch_url, youtube_transcript, run_javascript, generate_image" +
            (persona.swarm ? ", delegate_to_agent" : "") +
            ". Prefer create_artifact over pasting long code inline.",
        ];
        if (projectName) systemParts.push(`This chat is part of the project "${projectName}".`);
        if (projectSystemPrompt) systemParts.push(`Project instructions:\n${projectSystemPrompt}`);

        const modelSettings = model === "google/gemini-3.1-pro-preview" 
          ? { google: { thinkingConfig: { thinkingLevel: 'high' } } } 
          : undefined;

        const result = streamText({
          model: provider(model),
          providerOptions: modelSettings,
          system: systemParts.join("\n\n"),
          messages: await convertToModelMessages(messages),
          tools,
          stopWhen: stepCountIs(50),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ messages: finalMessages }) => {
            if (isMockThread) return;
            const last = finalMessages[finalMessages.length - 1];
            if (last?.role === "assistant") {
              const text = extractText(last);
              if (text) {
                await adminDb.collection("messages").add({
                  thread_id: threadId,
                  role: "assistant",
                  content: text,
                  model,
                  created_at: new Date().toISOString()
                });
              }
            }
          },
        });
      },
    },
  },
});
