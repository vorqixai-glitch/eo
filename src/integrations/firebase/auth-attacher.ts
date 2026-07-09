import { createMiddleware } from "@tanstack/react-start";
import { auth } from "./client";

export const attachFirebaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    // Check if auth.currentUser exists and get token.
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
