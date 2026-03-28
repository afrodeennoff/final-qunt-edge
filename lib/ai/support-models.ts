export const SUPPORT_MODEL_OPTIONS = [
  {
    name: 'GLM 4.7 Flash',
    value: 'glm-4.7-flash',
  },
  {
    name: 'GPT 4o Mini',
    value: 'gpt-4o-mini',
  },
  {
    name: 'GPT 4.1 Mini',
    value: 'gpt-4.1-mini',
  },
] as const;

export type SupportModelId = (typeof SUPPORT_MODEL_OPTIONS)[number]['value'];

export const SUPPORT_MODEL_ALLOWLIST = new Set<SupportModelId>(
  SUPPORT_MODEL_OPTIONS.map((option) => option.value),
);

export function isSupportModelId(model: string): model is SupportModelId {
  return SUPPORT_MODEL_ALLOWLIST.has(model as SupportModelId);
}
