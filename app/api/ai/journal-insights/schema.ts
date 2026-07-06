import { z } from 'zod/v3';

export const journalInsightsRequestSchema = z.object({
  periodDays: z.number().int().min(1).max(365).optional().default(30),
  accountNumber: z.string().optional(),
  tradeId: z.string().optional(),
  focusAreas: z.array(z.enum(['biases', 'emotions', 'discipline', 'patterns', 'recommendations'])).optional(),
});

export type JournalInsightsRequest = z.infer<typeof journalInsightsRequestSchema>;

export const journalInsightsOutputSchema = z.object({
  summary: z.string().describe('Overall summary of trading psychology and performance patterns from journal and trades'),
  keyBiases: z.array(z.string()).describe('List of detected cognitive biases (e.g., FOMO, revenge trading, overconfidence) with brief evidence'),
  emotionalPatterns: z.array(z.string()).describe('Emotional patterns correlated with outcomes (e.g., fear on losing days leading to smaller wins)'),
  disciplineInsights: z.array(z.string()).describe('Insights on discipline, rule following, pre/post trade notes quality'),
  recurringMistakes: z.array(z.string()).describe('Recurring mistakes or successes from comments and journal entries'),
  actionableRecommendations: z.array(z.string()).describe('Specific, actionable recommendations to improve psychology and results'),
  confidence: z.number().min(0).max(100).describe('Confidence in the analysis based on data volume and consistency (0-100)'),
  dataPointsAnalyzed: z.number().int().describe('Number of trades and journal entries considered'),
});

export type JournalInsightsOutput = z.infer<typeof journalInsightsOutputSchema>;