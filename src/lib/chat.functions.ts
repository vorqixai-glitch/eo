import { createServerFn } from "@tanstack/react-start";
import { requireFirebaseAuth } from "@/integrations/firebase/auth-middleware";
import { z } from "zod";
import { generateText } from "ai";
import { createGeminiAi } from "./ai-gateway.server";
import crypto from "crypto";

export type DbThread = {
  id: string;
  user_id: string;
  title: string;
  project_id: string | null;
  persona_id: string | null;
  model: string | null;
  created_at: string;
  updated_at: string;
};

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    const snap = await context.db
      .collection("threads")
      .where("user_id", "==", context.userId)
      .orderBy("updated_at", "desc")
      .get();

    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as DbThread[];
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        title: z.string().max(120).optional(),
        project_id: z.string().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const id = crypto.randomUUID();
    const docData = {
      user_id: context.userId,
      title: data.title ?? "New chat",
      project_id: data.project_id ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await context.db.collection("threads").doc(id).set(docData);
    return { id, ...docData };
  });

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string(), title: z.string().min(1).max(120) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await context.db.collection("threads").doc(data.id).update({
      title: data.title,
      updated_at: new Date().toISOString(),
    });
    return { ok: true };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await context.db.collection("threads").doc(data.id).delete();
    return { ok: true };
  });

export type DbMessage = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

export const getThreadMessages = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) => z.object({ threadId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const threadDoc = await context.db.collection("threads").doc(data.threadId).get();
    if (!threadDoc.exists) throw new Error("Thread not found");
    const thread = { id: threadDoc.id, ...threadDoc.data() } as DbThread;

    const snap = await context.db
      .collection("messages")
      .where("thread_id", "==", data.threadId)
      .orderBy("created_at", "asc")
      .get();

    const messages = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as DbMessage[];
    return { thread, messages };
  });

export const setThreadPersona = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string(), persona_id: z.string().max(64).nullable() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await context.db.collection("threads").doc(data.id).update({
      persona_id: data.persona_id,
      updated_at: new Date().toISOString(),
    });
    return { ok: true };
  });

export const enhancePrompt = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        prompt: z.string().min(1),
        technique: z.enum(["structured", "cot", "blueprint", "few-shot"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable on server.");
    }
    const provider = createGeminiAi(geminiKey);
    const systemPrompt = `You are an expert Prompt Engineer, AI Systems Architect, and Lead Swarm Developer.Your core objective is to take a simple, raw, or rough prompt request, and transform it into a highly professional, optimized, production-grade Advanced Prompt.Structure the engineered prompt using elegant Markdown headers. Depending on the chosen technique, customize the output:- For "structured": Define clear Expert Role, Primary Objective, Detailed Execution Guidelines, Concrete Input/Output Formats, and Strict Constraints.- For "cot": Formulate deep step-by-step thinking instructions. Instruct the LLM on how to decompose complex tasks, verify intermediate states, run checklists, and validate schema integrity.- For "blueprint": Create an comprehensive System Blueprint/Spec sheet structure with modular block architectures.- For "few-shot": Include a sample task mock input and a matching high-quality structured execution block inside code blocks to demonstrate the exact pattern.Your output must be ONLY the finalized Advanced Prompt ready to copy-paste. Never include conversational meta-commentary, introductory remarks, or post-generation explanations. Start directly with the prompt content.`;
    const modelName = "gemini-3-flash-preview";
    const promptMessage = `Transform the following rough user prompt into an Advanced Prompt using the "${data.technique}" template strategy:---${data.prompt}---`;
    try {
      const { text } = await generateText({
        model: provider(modelName),
        system: systemPrompt,
        prompt: promptMessage,
      });
      return { enhanced: text.trim() };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to enhance prompt with AI");
    }
  });
