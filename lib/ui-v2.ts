const TRUE_VALUES = new Set(["1", "true", "yes", "on"])
const FALSE_VALUES = new Set(["0", "false", "no", "off"])

function parseFlag(raw: string | undefined): boolean | undefined {
  if (!raw) return undefined
  const normalized = raw.trim().toLowerCase()
  if (TRUE_VALUES.has(normalized)) return true
  if (FALSE_VALUES.has(normalized)) return false
  return undefined
}

export function isUiV2Enabled(): boolean {
  return parseFlag(process.env.NEXT_PUBLIC_UI_V2_ENABLED) ?? true
}

export function getUiVariant(): "v1" | "v2" {
  return isUiV2Enabled() ? "v2" : "v1"
}
