import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "angelic-lattice-499717-f8",
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
