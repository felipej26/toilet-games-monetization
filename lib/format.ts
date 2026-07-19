const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(amount: number): string {
  return brlFormatter.format(amount);
}

export function microsToAmount(micros: string | number): number {
  const value = typeof micros === "string" ? Number(micros) : micros;
  return value / 1_000_000;
}
