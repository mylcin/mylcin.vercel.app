/** Optimal string alignment distance (Levenshtein + adjacent transpositions). */
export function editDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/** Closest candidate within a typo-sized distance, or null. */
export function closest(input: string, candidates: string[]): string | null {
  const word = input.toLowerCase();
  const limit = word.length <= 3 ? 1 : 2;
  let best: { candidate: string; distance: number } | null = null;

  for (const candidate of candidates) {
    const distance =
      candidate.startsWith(word) && word.length >= 2
        ? 0.5
        : editDistance(word, candidate);
    if (distance <= limit && (!best || distance < best.distance))
      best = { candidate, distance };
  }
  return best?.candidate ?? null;
}

/** Case-, accent- and dotted/dotless-i-insensitive form for searching. */
export function searchable(text: string): string {
  return text
    .toLowerCase()
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}
