/**
 * Formatiert Millisekunden in ein lesbares Zeitformat (MM:SS).
 * @param ms Zeit in Millisekunden
 * @returns Formatierte Zeit als String (z.B. "2:05")
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
