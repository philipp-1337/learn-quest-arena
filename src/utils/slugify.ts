export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Ersetze Sonderzeichen durch '-'
    .replace(/^-+|-+$/g, ''); // Entferne führende oder abschließende '-'
};