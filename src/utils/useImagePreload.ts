import { useEffect } from 'react';
import { getOptimizedImageUrl } from './cloudinaryTransform';
import type { Question } from 'quizTypes';

/**
 * Preload Hook für Quiz-Bilder
 * Lädt Bilder der nächsten Frage(n) im Hintergrund vor
 */
export function useImagePreload(
  questions: Question[],
  currentQuestionIndex: number,
  preloadCount: number = 2
) {
  useEffect(() => {
    const questionsToPreload = questions.slice(
      currentQuestionIndex + 1,
      currentQuestionIndex + 1 + preloadCount
    );

    questionsToPreload.forEach((question) => {
      if (question.answerType !== 'image') return;

      question.answers.forEach((answer) => {
        if (!answer.content.includes('cloudinary.com')) return;

        const url = getOptimizedImageUrl(answer.content, 800, 600);
        
        // Preload Link erstellen
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        document.head.appendChild(link);

        // Cleanup nach 30 Sekunden
        setTimeout(() => {
          if (document.head.contains(link)) {
            document.head.removeChild(link);
          }
        }, 30000);
      });
    });
  }, [currentQuestionIndex, questions, preloadCount]);
}
