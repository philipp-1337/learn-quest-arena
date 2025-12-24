// Constants for Quiz Challenge Mode

export const PRIZE_LEVELS = [
  { level: 1, prize: 50, isSafety: false },
  { level: 2, prize: 100, isSafety: false },
  { level: 3, prize: 200, isSafety: false },
  { level: 4, prize: 300, isSafety: false },
  { level: 5, prize: 500, isSafety: false },
  { level: 6, prize: 1000, isSafety: false },
  { level: 7, prize: 2000, isSafety: false },
  { level: 8, prize: 4000, isSafety: false },
  { level: 9, prize: 8000, isSafety: true },  // 1. Sicherheitsstufe
  { level: 10, prize: 16000, isSafety: false },
  { level: 11, prize: 32000, isSafety: false },
  { level: 12, prize: 64000, isSafety: false },
  { level: 13, prize: 125000, isSafety: true }, // 2. Sicherheitsstufe
  { level: 14, prize: 500000, isSafety: false },
  { level: 15, prize: 1000000, isSafety: false },
] as const;

export const formatPrize = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toLocaleString('de-DE')} Mio. €`;
  }
  return `${amount.toLocaleString('de-DE')} €`;
};
