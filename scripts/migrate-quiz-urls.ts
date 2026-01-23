import { loadAllQuizDocuments, updateQuizDocument } from '../src/utils/quiz-collection/quizQueries';
import { slugify } from '../src/utils/slugify';

async function migrateQuizUrls() {
  const quizzes = await loadAllQuizDocuments();
  let migrated = 0;
  for (const quiz of quizzes) {
    // Nur migrieren, wenn das neue Feld fehlt
    if (!quiz.url) {
      const base = quiz.shortTitle || quiz.title;
      const url = slugify(base);
      await updateQuizDocument(quiz.id, { url });
      migrated++;
      console.log(`Quiz ${quiz.id}: url gesetzt auf '${url}'`);
    }
  }
  console.log(`Migration abgeschlossen. ${migrated} Quizze migriert.`);
}

migrateQuizUrls().catch(err => {
  console.error('Fehler bei Migration:', err);
});
