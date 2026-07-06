import { z } from 'zod/v3';

export const analyzePatternsRequestSchema = z.object({
  periodDays: z.number().int().min(7).max(180).optional().default(30),
  groupBy: z.enum(['timeOfDay', 'instrument', 'tag', 'weekday', 'emotion']).optional().default('instrument'),
});

export const analyzePatternsOutputSchema = z.object({
  narrative: z.string().describe('Narrative summary of detected performance and behavioral patterns'),
  topCorrelations: z.array(z.object({
    factor: z.string(),
    correlation: z.string(),
    evidence: z.string(),
    recommendation: z.string(),
  })).describe('Top 3-5 correlations between factors (time, instrument, emotion, tags) and outcomes (PnL, winrate)'),
  confidence: z.number().min(0).max(100),
});

export type AnalyzePatternsRequest = z.infer<typeof analyzePatternsRequestSchema>;
export type AnalyzePatternsOutput = z.infer<typeof analyzePatternsOutputSchema>;