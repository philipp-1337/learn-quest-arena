import React from 'react';
import { Users, Award, Target, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Person Quiz Selector Component
 * 
 * Displays a beautiful selection screen for person quizzes featuring
 * German entrepreneurs. Each card shows the person's name, description,
 * and a colorful gradient design.
 * 
 * Features:
 * - Responsive grid layout (1 column mobile, 3 columns desktop)
 * - Dark mode support
 * - Hover animations and effects
 * - Gradient backgrounds for visual appeal
 * - Quiz statistics display
 */

interface PersonQuiz {
  id: string;
  name: string;
  shortTitle: string;
  description: string;
  icon: string;
  color: string;
}

const personQuizzes: PersonQuiz[] = [
  {
    id: '1',
    name: 'Ben Erler',
    shortTitle: 'ben-erler',
    description: 'Deutscher Unternehmer, Chairman Young Founders Network',
    icon: '🚀',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: '2',
    name: 'Philipp Schmechel',
    shortTitle: 'philipp-schmechel',
    description: 'Gründer Trimlog & QiTech, Logistics-Tech Entrepreneur',
    icon: '⚡',
    color: 'from-green-500 to-teal-600',
  },
  {
    id: '3',
    name: 'Katharina Zieße Suari',
    shortTitle: 'katharina-ziesse-suari',
    description: 'LMU München, Marketing & Videografie, Etsy Entrepreneur',
    icon: '🎨',
    color: 'from-pink-500 to-purple-600',
  },
];

export const PersonQuizSelector: React.FC = () => {
  const navigate = useNavigate();

  const handleQuizSelect = (shortTitle: string) => {
    // Navigate to quiz player with the specific quiz
    // Path matches the hierarchical structure: subject/class/topic/quiz
    navigate(`/quiz/personen-quiz/gruender-unternehmer/team-2026/${shortTitle}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg transform hover:scale-110 transition-transform duration-300">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Personen Quiz
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Teste dein Wissen über unsere Gründer und Unternehmer!
            <br className="hidden sm:block" />
            Wähle eine Person und beantworte 10 spannende Fragen.
          </p>
        </div>

        {/* Quiz Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {personQuizzes.map((person, index) => (
            <div
              key={person.id}
              onClick={() => handleQuizSelect(person.shortTitle)}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 h-full flex flex-col">
                {/* Gradient Header with Icon */}
                <div className={`h-32 sm:h-40 bg-gradient-to-br ${person.color} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
                  <span className="text-6xl sm:text-7xl transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                    {person.icon}
                  </span>
                  <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {person.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 flex-1 leading-relaxed">
                    {person.description}
                  </p>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span className="font-medium">10 Fragen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span className="font-medium">Quiz</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-xl flex items-center justify-center gap-2 group-hover:gap-3">
                    <span>Quiz starten</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-6 sm:p-8 text-center shadow-lg">
          <div className="flex items-center justify-center gap-3 text-blue-700 dark:text-blue-300 mb-3">
            <Sparkles className="w-6 h-6" />
            <h3 className="font-bold text-xl">Sammle XP und verbessere deinen Score!</h3>
          </div>
          <p className="text-blue-600 dark:text-blue-400 max-w-2xl mx-auto leading-relaxed">
            Jede richtige Antwort bringt dir wertvolle Erfahrungspunkte. 
            Teste dein Wissen über die spannenden Lebensläufe und Erfolge unserer Gründer-Community!
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-blue-600 dark:text-blue-400">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Progress Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Adaptive Learning</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>30 Fragen gesamt</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors inline-flex items-center gap-2"
          >
            ← Zurück zur Startseite
          </button>
        </div>
      </div>
    </div>
  );
};
