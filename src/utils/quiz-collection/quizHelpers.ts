/**
 * Helper functions for quiz operations.
 */

/**
 * Helper function to remove undefined values from an object.
 */
export function removeUndefinedFields<T extends object>(obj: T): Partial<T> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        // Clean arrays recursively
        cleaned[key] = value.map(item => 
          item !== null && typeof item === 'object' 
            ? removeUndefinedFields(item as object)
            : item
        );
      } else if (value !== null && typeof value === 'object') {
        cleaned[key] = removeUndefinedFields(value as object);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned as Partial<T>;
}
