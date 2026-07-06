import { tool } from 'ai';
import { z } from 'zod/v3';

export const suggestFollowUp = tool({
  description: `Suggest 2-3 relevant follow-up questions the user could ask next. Call this after providing your main response to keep the conversation going. The questions should be specific to what you just discussed.`,
  inputSchema: z.object({
    questions: z.array(z.string()).min(2).max(3).describe('2-3 follow-up questions the user might want to ask next'),
  }),
  execute: async ({ questions }: { questions: string[] }) => {
    return { questions };
  },
})
