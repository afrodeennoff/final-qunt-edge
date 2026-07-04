export const SUPPORT_MODEL_OPTIONS = [
  {
    name: 'Llama 3.3 70B (Groq)',
    value: 'llama-3.3-70b-versatile',
  },
  {
    name: 'Llama 3.1 8B Instant (Groq)',
    value: 'llama-3.1-8b-instant',
  },
] as const;

export type SupportModelId = (typeof SUPPORT_MODEL_OPTIONS)[number]['value'];

export const SUPPORT_MODEL_ALLOWLIST = new Set<SupportModelId>(
  SUPPORT_MODEL_OPTIONS.map((option) => option.value),
);

export function isSupportModelId(model: string): model is SupportModelId {
  return SUPPORT_MODEL_ALLOWLIST.has(model as SupportModelId);
}
