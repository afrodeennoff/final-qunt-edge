export const SUPPORT_MODEL_OPTIONS = [
  {
    name: 'Dynamic (Cloudflare Gateway)',
    value: 'dynamic/Test',
  },
] as const;

export type SupportModelId = (typeof SUPPORT_MODEL_OPTIONS)[number]['value'];

export const SUPPORT_MODEL_ALLOWLIST = new Set<SupportModelId>(
  SUPPORT_MODEL_OPTIONS.map((option) => option.value),
);

export function isSupportModelId(model: string): model is SupportModelId {
  return SUPPORT_MODEL_ALLOWLIST.has(model as SupportModelId);
}
