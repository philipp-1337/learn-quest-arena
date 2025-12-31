// Converts a percentage score to a German school grade (Schulnote)
// German grading system: 1 (sehr gut) to 6 (ungenügend)

export interface GradeInfo {
  grade: number;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export function calculateGrade(percentage: number): GradeInfo {
  if (percentage >= 92) {
    return {
      grade: 1,
      label: 'Sehr gut',
      color: 'text-green-700 dark:text-green-300',
      bgColor: 'bg-green-50 dark:bg-green-900/40',
      borderColor: 'border-green-200 dark:border-green-700',
    };
  } else if (percentage >= 81) {
    return {
      grade: 2,
      label: 'Gut',
      color: 'text-lime-700 dark:text-lime-300',
      bgColor: 'bg-lime-50 dark:bg-lime-900/40',
      borderColor: 'border-lime-200 dark:border-lime-700',
    };
  } else if (percentage >= 67) {
    return {
      grade: 3,
      label: 'Befriedigend',
      color: 'text-yellow-700 dark:text-yellow-300',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/40',
      borderColor: 'border-yellow-200 dark:border-yellow-700',
    };
  } else if (percentage >= 50) {
    return {
      grade: 4,
      label: 'Ausreichend',
      color: 'text-orange-700 dark:text-orange-300',
      bgColor: 'bg-orange-50 dark:bg-orange-900/40',
      borderColor: 'border-orange-200 dark:border-orange-700',
    };
  } else if (percentage >= 30) {
    return {
      grade: 5,
      label: 'Mangelhaft',
      color: 'text-red-700 dark:text-red-300',
      bgColor: 'bg-red-50 dark:bg-red-900/40',
      borderColor: 'border-red-200 dark:border-red-700',
    };
  } else {
    return {
      grade: 6,
      label: 'Ungenügend',
      color: 'text-red-900 dark:text-red-200',
      bgColor: 'bg-red-100 dark:bg-red-900/60',
      borderColor: 'border-red-300 dark:border-red-800',
    };
  }
}
