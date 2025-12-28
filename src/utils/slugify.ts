export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Ersetze Sonderzeichen durch '-'
    .replace(/^-+|-+$/g, ''); // Entferne führende oder abschließende '-'
};

/**
 * Creates a deterministic ID based on a name.
 * Ensures that the same name always produces the same ID.
 */
export const createDeterministicId = (name: string, prefix?: string): string => {
  const slug = slugify(name);
  return prefix ? `${prefix}-${slug}` : slug;
};