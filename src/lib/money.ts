export function formatPEN(cents: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function centsFromPEN(sol: number): number {
  return Math.round(sol * 100);
}
