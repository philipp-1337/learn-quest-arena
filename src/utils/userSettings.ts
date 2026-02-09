export const FLASH_CARD_MODE_KEY = 'lqa_flashcard_mode';

export function getFlashCardMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(FLASH_CARD_MODE_KEY) === 'true';
}

export function setFlashCardMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FLASH_CARD_MODE_KEY, enabled ? 'true' : 'false');
}
