import { showConfirmationToast } from './confirmationToast';

export function showCompletedQuizWarning(onContinue: () => void): void {
  showConfirmationToast({
    message: 'Neuer Versuch, dein Fortschritt wird überschrieben. Let’s go, zeig was du kannst.',
    onConfirm: onContinue,
    confirmText: 'Quiz starten',
    cancelText: 'Abbrechen',
  });
}
