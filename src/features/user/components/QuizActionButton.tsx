import React from "react";

interface QuizActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant?: 'primary' | 'secondary' | 'warning' | 'danger';
  disabled?: boolean;
  title?: string;
}

export const QuizActionButton: React.FC<QuizActionButtonProps> = ({ 
  onClick, 
  icon, 
  label, 
  variant = 'secondary', 
  disabled = false, 
  title 
}) => {
  const variantStyles = {
    primary: 'border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
    secondary: 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/40',
    warning: 'border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20',
    danger: 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-3 py-2 border rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon}
      <span className="sm:inline">{label}</span>
    </button>
  );
};