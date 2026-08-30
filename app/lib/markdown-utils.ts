/**
 * Clean up LLM output edge cases so markdown renders reliably:
 * - "• **x**" / stray "*" bullets -> proper "- **x**" list item
 * - stray "**" on its own line -> remove (unclosed bold confuses parser)
 * - ">>" merge markers left by model -> drop
 * - leading "## Section Name" heading -> remove (card header already shows it)
 */
export function normalizeMarkdown(input: string): string {
  return input
    .replace(/^ {0,3}[\u2022*]\s+\*\*/gm, "- **")
    .replace(/^\s*\*\*\s*$/gm, "")
    .replace(/^>>.*$/gm, "")
    .replace(/^#{1,3}\s+.+\s*\n?/, "")
    .trim();
}
