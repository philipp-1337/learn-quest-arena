import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../src/config/firebaseConfig';
import personQuizzes from '../data/person-quizzes.json';

/**
 * Script to import person quizzes into Firestore
 * Run with: npm run import-quizzes
 * 
 * This script imports curated person quizzes featuring German entrepreneurs:
 * - Ben Erler (Chairman Young Founders Network)
 * - Philipp Schmechel (Trimlog & QiTech founder)
 * - Katharina Zieße Suari (LMU student, marketing entrepreneur)
 * 
 * Each quiz contains 10 questions about the person's background,
 * professional activities, and achievements.
 */

interface ImportQuestion {
  question: string;
  answerType: string;
  answers: Array<{
    type: string;
    content: string;
    alt?: string;
  }>;
  correctAnswerIndex: number;
}

interface ImportQuiz {
  title: string;
  shortTitle: string;
  questions: ImportQuestion[];
}

interface ImportData {
  subject: string;
  class: string;
  topic: string;
  quizzes: ImportQuiz[];
}

/**
 * Helper function to create URL-safe slugs from text
 * Handles German umlauts properly
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a simple UUID for quiz IDs
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Main import function
 * Imports all person quizzes from the JSON file into Firestore
 */
async function importPersonQuizzes() {
  try {
    console.log('🚀 Starting person quiz import...');
    console.log('=' .repeat(60));
    
    // Firebase Auth user info - update these with your actual admin credentials
    const authorId = process.env.FIREBASE_ADMIN_UID || 'admin';
    const authorEmail = process.env.FIREBASE_ADMIN_EMAIL || 'admin@learn-quest-arena.de';
    
    console.log(`📧 Importing as: ${authorEmail}`);
    console.log('');
    
    let totalImported = 0;
    let totalSkipped = 0;
    
    for (const data of personQuizzes as ImportData[]) {
      // Create normalized IDs for hierarchical structure
      const subjectId = `subject-${slugify(data.subject)}`;
      const classId = `class-${slugify(data.class)}`;
      const topicId = `topic-${slugify(data.topic)}`;
      
      console.log(`📚 Processing: ${data.subject} > ${data.class} > ${data.topic}`);
      console.log('-'.repeat(60));
      
      for (const quiz of data.quizzes) {
        // Check if quiz already exists by shortTitle
        const existingQuizQuery = query(
          collection(db, 'quizzes'),
          where('shortTitle', '==', quiz.shortTitle)
        );
        const existingQuizSnapshot = await getDocs(existingQuizQuery);
        
        if (!existingQuizSnapshot.empty) {
          console.log(`⏭️  "${quiz.title}" - Already exists, skipping`);
          totalSkipped++;
          continue;
        }
        
        // Prepare quiz document following QuizDocument interface
        const quizDocument = {
          id: generateUUID(),
          title: quiz.title,
          shortTitle: quiz.shortTitle,
          questions: quiz.questions.map((q, index) => ({
            id: `q-${index + 1}`,
            question: q.question,
            questionType: 'text' as const,
            answerType: q.answerType,
            answers: q.answers,
            correctAnswerIndex: q.correctAnswerIndex,
          })),
          // Hierarchical organization
          subjectId,
          subjectName: data.subject,
          classId,
          className: data.class,
          topicId,
          topicName: data.topic,
          // Metadata
          hidden: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          authorId,
          authorEmail,
        };
        
        // Validate quiz has questions
        if (!quizDocument.questions || quizDocument.questions.length === 0) {
          console.log(`❌ "${quiz.title}" - No questions found, skipping`);
          totalSkipped++;
          continue;
        }
        
        // Add to Firestore
        try {
          const docRef = await addDoc(collection(db, 'quizzes'), quizDocument);
          console.log(`✅ "${quiz.title}" - Imported successfully (${quiz.questions.length} questions)`);
          console.log(`   Firestore ID: ${docRef.id}`);
          totalImported++;
        } catch (error) {
          console.error(`❌ "${quiz.title}" - Failed to import:`, error);
          totalSkipped++;
        }
      }
      
      console.log('');
    }
    
    console.log('=' .repeat(60));
    console.log('🎉 Import completed!');
    console.log(`📊 Summary: ${totalImported} imported, ${totalSkipped} skipped`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Navigate to /personen-quiz in your app');
    console.log('2. Select a person and start the quiz');
    console.log('3. Track progress with the existing SRS system');
    
  } catch (error) {
    console.error('❌ Import failed with error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  importPersonQuizzes()
    .then(() => {
      console.log('✨ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export { importPersonQuizzes };
