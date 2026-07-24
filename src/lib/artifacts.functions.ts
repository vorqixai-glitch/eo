import { createServerFn } from "@tanstack/react-start";
import { requireFirebaseAuth } from "@/integrations/firebase/auth-middleware";
import { z } from "zod";

export const listArtifacts = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) => z.object({ threadId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const snap = await context.db
      .collection("artifacts")
      .where("thread_id", "==", data.threadId)
      .orderBy("updated_at", "desc")
      .get();

    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as unknown;
  });

export const getArtifact = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const doc = await context.db.collection("artifacts").doc(data.id).get();
    if (!doc.exists) throw new Error("Artifact not found");
    return { id: doc.id, ...doc.data() } as unknown;
  });
