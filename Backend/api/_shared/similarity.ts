/**
 * Fuzzy string similarity using bigram overlap (Dice coefficient).
 * Returns a value between 0 and 1, where 1 = identical.
 */

function bigrams(str: string): Set<string> {
  const s = str.toLowerCase().trim();
  const set = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) {
    set.add(s.slice(i, i + 2));
  }
  return set;
}

export function similarity(a: string, b: string): number {
  const na = a.toLowerCase().trim();
  const nb = b.toLowerCase().trim();
  if (na === nb) return 1;
  if (!na || !nb) return 0;

  const ba = bigrams(na);
  const bb = bigrams(nb);
  if (ba.size === 0 && bb.size === 0) return na === nb ? 1 : 0;

  let intersection = 0;
  for (const g of ba) {
    if (bb.has(g)) intersection++;
  }
  return (2 * intersection) / (ba.size + bb.size);
}

/**
 * Compare full names (first + last). Returns true if similarity >= threshold.
 * Phone comparison is exact after stripping non-digits.
 */
export function isNameMatch(
  dbFirst: string,
  dbLast: string,
  inputFirst: string,
  inputLast: string,
  threshold = 0.8,
): boolean {
  const dbFull = `${dbFirst} ${dbLast}`;
  const inputFull = `${inputFirst} ${inputLast}`;
  return similarity(dbFull, inputFull) >= threshold;
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9+]/g, "");
}

export function isPhoneMatch(dbPhone: string, inputPhone: string): boolean {
  const a = normalizePhone(dbPhone);
  const b = normalizePhone(inputPhone);
  // Exact match, or one is a suffix of the other (handles country code differences)
  return a === b || a.endsWith(b) || b.endsWith(a);
}
