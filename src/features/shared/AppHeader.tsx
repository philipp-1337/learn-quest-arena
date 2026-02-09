import { Menu, X, Sun, Moon, Lightbulb, IdCard } from 'lucide-react';
import { useState, useRef, useEffect, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import useDarkMode from '@hooks/useDarkMode';
import { getFlashCardMode, setFlashCardMode, subscribeFlashCardMode } from '@utils/userSettings';

export interface MenuItem {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'divider';
  isActive?: boolean;
  hideOnDesktop?: boolean; // Hide on desktop, show only in mobile menu
  hasNotification?: boolean; // Show a notification badge
}

interface AppHeaderProps {
  title: string;
  subtitle: string;
  titleIcon?: React.ReactNode;
  menuItems: MenuItem[];
  breadcrumb?: React.ReactNode;
  homeUrl?: string; // URL der jeweiligen Startseite
}

export default function AppHeader({
  title,
  subtitle,
  titleIcon,
  menuItems,
  breadcrumb,
  homeUrl,
}: AppHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [flashCardMode, setFlashCardModeState] = useState(() => getFlashCardMode());

  useEffect(() => {
    setFlashCardMode(flashCardMode);
  }, [flashCardMode]);

  useEffect(() => {
    setFlashCardModeState(getFlashCardMode());
    return subscribeFlashCardMode(setFlashCardModeState);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get variant classes for buttons
  const getButtonClasses = (item: MenuItem, isMobile: boolean = false) => {
    if (isMobile) {
      // Mobile menu item styling
      if (item.variant === 'primary' || item.isActive) {
        return "cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors";
      }
      return "cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors";
    }

    // Desktop button styling
    if (item.variant === 'primary' || item.isActive) {
      return "cursor-pointer relative group p-2 rounded-full text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors";
    }
    return "cursor-pointer relative group p-2 rounded-full text-gray-700 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors";
  };

  // Filter items for desktop (exclude hideOnDesktop)
  const desktopItems = menuItems.filter(item => !item.hideOnDesktop);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 mb-5">
      <div className="flex justify-between items-center">
        <div>
          {homeUrl ? (
            <Link
              to={homeUrl}
              className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2 focus:outline-none focus:ring-0 focus:ring-indigo-400"
              title={title}
              style={{ textDecoration: "none" }}
            >
              {title}
              {titleIcon}
            </Link>
          ) : (
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              {title}
              {titleIcon}
            </h1>
          )}
          <p className="text-gray-700 dark:text-gray-200">{subtitle}</p>
        </div>
        <div className="flex flex-row gap-2 items-end relative" ref={menuRef}>
          {/* Dark Mode Toggle - visible on desktop */}
          <button
            onClick={toggleDarkMode}
            className="cursor-pointer hidden md:block relative group p-2 rounded-full text-gray-700 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isDarkMode ? "Heller Modus" : "Dunkler Modus"}
            title={isDarkMode ? "Heller Modus" : "Dunkler Modus"}
          >
            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            {/* Tooltip */}
            <span className="absolute -bottom-8 right-1/2 translate-x-1/2 scale-0 group-hover:scale-100 transition-transform text-xs rounded px-2 py-1 pointer-events-none z-10 whitespace-nowrap shadow-lg">
              {isDarkMode ? "Heller Modus" : "Dunkler Modus"}
            </span>
          </button>
          {/* Flash-Card Toggle - visible on desktop */}
          <button
            onClick={() => setFlashCardModeState((prev) => !prev)}
            className="cursor-pointer hidden md:block relative group p-2 rounded-full text-gray-700 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Quiz & Card Modus wechseln"
            title="Quiz & Card Modus wechseln"
          >
            {flashCardMode ? <Lightbulb className="w-6 h-6" /> : <IdCard className="w-6 h-6" />}
            <span className="absolute -bottom-8 right-1/2 translate-x-1/2 scale-0 group-hover:scale-100 transition-transform text-xs rounded px-2 py-1 pointer-events-none z-10 whitespace-nowrap shadow-lg">
              {flashCardMode ? "Card Modus" : "Quiz Modus"}
            </span>
          </button>

          {/* Desktop Buttons - visible on md and larger */}
          <div className="hidden md:flex flex-row gap-2">
            {desktopItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className={getButtonClasses(item)}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon className="w-6 h-6" />
                  {/* Notification Badge */}
                  {item.hasNotification && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500/40 rounded-full ring-2 ring-white dark:ring-gray-800" />
                  )}
                  {/* Tooltip */}
                  <span className="absolute -bottom-8 right-1/2 translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs rounded px-2 py-1 pointer-events-none z-10 whitespace-nowrap shadow-lg">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button - visible below md */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="cursor-pointer md:hidden p-2 rounded-full text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Menü"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Mobile Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Flash-Card Toggle in Mobile Menu */}
              <button
                onClick={() => {
                  setFlashCardModeState((prev) => !prev);
                  setIsMenuOpen(false);
                }}
                className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {flashCardMode ? <Lightbulb className="w-5 h-5" /> : <IdCard className="w-5 h-5" />}
                <span className="font-medium">{flashCardMode ? "Card Modus" : "Quiz Modus"}</span>
              </button>
              <div className="my-1 border-t border-gray-100 dark:border-gray-700"></div>
              {/* Dark Mode Toggle in Mobile Menu */}
              <button
                onClick={() => {
                  toggleDarkMode();
                  setIsMenuOpen(false);
                }}
                className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="font-medium">{isDarkMode ? "Heller Modus" : "Dunkler Modus"}</span>
              </button>
              <div className="my-1 border-t border-gray-100 dark:border-gray-700"></div>
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const needsDivider = 
                  index > 0 && 
                  (item.variant === 'divider' ||
                   menuItems[index - 1].variant === 'divider');
                
                return (
                  <div key={index}>
                    {needsDivider && (
                      <div className="my-1 border-t border-gray-100 dark:border-gray-700"></div>
                    )}
                    <button
                      onClick={() => {
                        item.onClick();
                        setIsMenuOpen(false);
                      }}
                      className={getButtonClasses(item, true)}
                    >
                      <div className="relative">
                        <Icon className="w-5 h-5" />
                        {/* Notification Badge */}
                        {item.hasNotification && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white dark:ring-gray-800" />
                        )}
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Breadcrumb */}
      {breadcrumb && <div className="mt-3">{breadcrumb}</div>}
    </div>
  );
}
