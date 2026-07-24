import { createGoogleGenerativeAI } from "@ai-sdk/google";

export function createGeminiAi(apiKey: string) {
  return createGoogleGenerativeAI({
    apiKey,
  });
}
