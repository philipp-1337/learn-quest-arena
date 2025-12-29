import { showConfirmationToast } from './confirmationToast';

export function showCompletedQuizWarning(onContinue: () => void): void {
  showConfirmationToast({
    message: 'Dieses Quiz ist bereits abgeschlossen. Wenn du es nochmal machst, wird dein Fortschritt überschrieben. Bist du sicher?',
    onConfirm: onContinue,
    confirmText: 'Fortsetzen',
    cancelText: 'Abbrechen',
  });
}
