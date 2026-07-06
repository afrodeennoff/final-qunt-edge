export const SUPPORT_MODEL_OPTIONS = [
  {
    name: 'Llama 4 Scout 17B (Groq)',
    value: 'groq/meta-llama/llama-4-scout-17b-16e-instruct',
  },
  {
    name: 'Qwen 3 32B (Groq)',
    value: 'groq/qwen/qwen3-32b',
  },
] as const;

export type SupportModelId = (typeof SUPPORT_MODEL_OPTIONS)[number]['value'];

export const SUPPORT_MODEL_ALLOWLIST = new Set<SupportModelId>(
  SUPPORT_MODEL_OPTIONS.map((option) => option.value),
);

export function isSupportModelId(model: string): model is SupportModelId {
  return SUPPORT_MODEL_ALLOWLIST.has(model as SupportModelId);
}
