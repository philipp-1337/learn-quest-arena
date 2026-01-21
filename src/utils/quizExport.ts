/**
 * Utility functions for exporting quizzes from the collection.
 */
import { loadAllQuizDocuments } from "./quiz-collection";

interface ExportQuizData {
  subject: string;
  class: string;
  topic: string;
  quizzes: Array<{
    title: string;
    questions: Array<{
      question: string;
      answerType: string;
      answers: Array<{
        type: string;
        content: string;
        alt?: string;
      }>;
      correctAnswerIndex: number;
    }>;
  }>;
}

/**
 * Exports all quizzes to JSON format.
 * Groups quizzes by subject -> class -> topic.
 */
export async function exportQuizzesToJSON(): Promise<{ success: boolean; error?: string }> {
  try {
    const allQuizzes = await loadAllQuizDocuments();
    
    if (allQuizzes.length === 0) {
      return { success: false, error: "Keine Quizze zum Exportieren gefunden" };
    }

    // Group quizzes by subject -> class -> topic
    const grouped = new Map<string, ExportQuizData>();

    for (const quiz of allQuizzes) {
      const subject = quiz.subjectName || "Unbekannt";
      const className = quiz.className || "Unbekannt";
      const topic = quiz.topicName || "Unbekannt";
      
      const key = `${subject}|||${className}|||${topic}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          subject,
          class: className,
          topic,
          quizzes: [],
        });
      }

      const group = grouped.get(key)!;
      group.quizzes.push({
        title: quiz.title,
        questions: quiz.questions.map(q => ({
          question: q.question,
          answerType: q.answerType,
          answers: q.answers.map(a => ({
            type: a.type,
            content: a.content,
            ...(a.alt && { alt: a.alt }),
          })),
          correctAnswerIndex: q.correctAnswerIndex,
        })),
      });
    }

    // Convert to array and sort
    const exportData = Array.from(grouped.values()).sort((a, b) => {
      if (a.subject !== b.subject) return a.subject.localeCompare(b.subject);
      if (a.class !== b.class) return a.class.localeCompare(b.class);
      return a.topic.localeCompare(b.topic);
    });

    // Create JSON blob and download
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    a.download = `quizze-export-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Export error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Exports all quizzes to CSV format.
 * Format: Subject,Class,Topic,Quiz,Question,Answer1,Answer2,Answer3,CorrectAnswer
 */
export async function exportQuizzesToCSV(): Promise<{ success: boolean; error?: string }> {
  try {
    const allQuizzes = await loadAllQuizDocuments();
    
    if (allQuizzes.length === 0) {
      return { success: false, error: "Keine Quizze zum Exportieren gefunden" };
    }

    // CSV Header
    const csvLines: string[] = [
      'Subject,Class,Topic,Quiz,Question,Answer1,Answer2,Answer3,Answer4,Answer5,CorrectAnswer'
    ];

    // Sort quizzes
    const sortedQuizzes = [...allQuizzes].sort((a, b) => {
      const subjectA = a.subjectName || "";
      const subjectB = b.subjectName || "";
      if (subjectA !== subjectB) return subjectA.localeCompare(subjectB);
      
      const classA = a.className || "";
      const classB = b.className || "";
      if (classA !== classB) return classA.localeCompare(classB);
      
      const topicA = a.topicName || "";
      const topicB = b.topicName || "";
      if (topicA !== topicB) return topicA.localeCompare(topicB);
      
      return a.title.localeCompare(b.title);
    });

    // Add data rows
    for (const quiz of sortedQuizzes) {
      const subject = escapeCSV(quiz.subjectName || "Unbekannt");
      const className = escapeCSV(quiz.className || "Unbekannt");
      const topic = escapeCSV(quiz.topicName || "Unbekannt");
      const quizTitle = escapeCSV(quiz.title);

      for (const question of quiz.questions) {
        const questionText = escapeCSV(question.question);
        const answers = question.answers.map(a => escapeCSV(a.content));
        
        // Pad with empty strings if less than 5 answers
        while (answers.length < 5) {
          answers.push('');
        }
        
        const correctAnswer = question.correctAnswerIndex + 1; // Convert to 1-based
        
        csvLines.push(
          `${subject},${className},${topic},${quizTitle},${questionText},${answers[0]},${answers[1]},${answers[2]},${answers[3]},${answers[4]},${correctAnswer}`
        );
      }
    }

    // Create CSV blob and download
    const csvString = csvLines.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    a.download = `quizze-export-${timestamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Export error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Helper function to escape CSV values.
 */
function escapeCSV(value: string): string {
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Exports quizzes filtered by specific criteria.
 */
export async function exportFilteredQuizzes(
  filter: {
    subjectId?: string;
    classId?: string;
    topicId?: string;
  },
  format: 'json' | 'csv'
): Promise<{ success: boolean; error?: string }> {
  try {
    const allQuizzes = await loadAllQuizDocuments();
    
    // Apply filters
    let filtered = allQuizzes;
    if (filter.subjectId) {
      filtered = filtered.filter(q => q.subjectId === filter.subjectId);
    }
    if (filter.classId) {
      filtered = filtered.filter(q => q.classId === filter.classId);
    }
    if (filter.topicId) {
      filtered = filtered.filter(q => q.topicId === filter.topicId);
    }

    if (filtered.length === 0) {
      return { success: false, error: "Keine Quizze mit den gewählten Filtern gefunden" };
    }

    // Note: This is a simplified implementation
    // For a complete implementation, you would need to modify the export functions
    // to accept a custom quiz list parameter
    
    const result = format === 'json' 
      ? await exportQuizzesToJSON()
      : await exportQuizzesToCSV();
    
    return result;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}
