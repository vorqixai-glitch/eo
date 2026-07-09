import { createServerFn } from "@tanstack/react-start";
import { requireFirebaseAuth } from "@/integrations/firebase/auth-middleware";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";

export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    const snap = await context.db
      .collection("projects")
      .where("user_id", "==", context.userId)
      .orderBy("updated_at", "desc")
      .get();
    
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  });

export const createProject = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        name: z.string().min(1).max(120).optional(),
        description: z.string().max(500).optional(),
        system_prompt: z.string().max(4000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const id = crypto.randomUUID();
    const docData = {
      user_id: context.userId,
      name: data.name ?? "Untitled project",
      description: data.description ?? null,
      system_prompt: data.system_prompt ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await context.db.collection("projects").doc(id).set(docData);
    return { id, ...docData };
  });

export const updateProject = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().min(1).max(120).optional(),
        description: z.string().max(500).nullable().optional(),
        system_prompt: z.string().max(4000).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const patch: any = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) patch.name = data.name;
    if (data.description !== undefined) patch.description = data.description;
    if (data.system_prompt !== undefined) patch.system_prompt = data.system_prompt;
    
    await context.db.collection("projects").doc(data.id).update(patch);
    return { ok: true };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await context.db.collection("projects").doc(data.id).delete();
    return { ok: true };
  });

export const moveThreadToProject = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        threadId: z.string().uuid(),
        projectId: z.string().uuid().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await context.db.collection("threads").doc(data.threadId).update({ 
      project_id: data.projectId,
      updated_at: new Date().toISOString()
    });
    return { ok: true };
  });
