export type CurrencyCode = "USD" | "EUR";

type CurrencyFormatOptions = {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  notation?: Intl.NumberFormatOptions["notation"];
  currencyDisplay?: Intl.NumberFormatOptions["currencyDisplay"];
};

export function formatCurrencyAmount(
  value: number,
  currency: CurrencyCode,
  options: CurrencyFormatOptions = {},
): string {
  const locale = options.locale ?? "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: options.currencyDisplay ?? "symbol",
    notation: options.notation ?? "standard",
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
  }).format(value);
}

export function formatCompactCurrency(value: number): string {
  if (value <= 0) return "$0";

  return formatCurrencyAmount(value, "USD", {
    locale: "en-US",
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  });
}
