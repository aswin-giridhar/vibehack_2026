// Re-export from the unified type definitions.
// Components that import from "./blindbite-types" keep working unchanged.
// New code should import from "@/lib/types" directly.
export type {
  Craving,
  Recommendation,
  VibeCheck,
  ChatRequest,
  Chat,
  ChatMessage,
} from "./types";
