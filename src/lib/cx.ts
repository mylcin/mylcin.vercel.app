/** Joins class names, skipping falsy values. Components here don't merge
 *  conflicting utilities, so a plain join is all we need. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
