import { Menu, X } from "lucide-react";
import { useState, useRef, useEffect, type ComponentType } from "react";

export interface MenuItem {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  isActive?: boolean;
  hideOnDesktop?: boolean; // Hide on desktop, show only in mobile menu
}

interface AppHeaderProps {
  title: string;
  subtitle: string;
  titleIcon?: React.ReactNode;
  menuItems: MenuItem[];
  breadcrumb?: React.ReactNode;
}

export default function AppHeader({
  title,
  subtitle,
  titleIcon,
  menuItems,
  breadcrumb,
}: AppHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      if (item.variant === 'danger') {
        return "w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors";
      }
      if (item.variant === 'primary' || item.isActive) {
        return "w-full flex items-center gap-3 px-4 py-3 text-indigo-600 hover:bg-indigo-50 transition-colors";
      }
      if (item.variant === 'secondary') {
        return "w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors";
      }
      return "w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors";
    }

    // Desktop button styling
    if (item.variant === 'danger') {
      return "relative group p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors";
    }
    if (item.variant === 'primary' || item.isActive) {
      return "relative group p-2 rounded-full text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors";
    }
    if (item.variant === 'secondary') {
      return "relative group p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors";
    }
    return "relative group p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors";
  };

  // Filter items for desktop (exclude hideOnDesktop)
  const desktopItems = menuItems.filter(item => !item.hideOnDesktop);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 mb-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {title}
            {titleIcon}
          </h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>
        <div className="flex flex-row gap-2 items-end relative" ref={menuRef}>
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
                  {/* Tooltip */}
                  <span className="absolute -bottom-8 right-1/2 translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-800 text-white text-xs rounded px-2 py-1 pointer-events-none z-10 whitespace-nowrap shadow-lg">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button - visible below md */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Menü"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Mobile Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const needsDivider = 
                  index > 0 && 
                  (item.variant === 'danger' || 
                   item.variant === 'secondary' ||
                   menuItems[index - 1].variant === 'danger' ||
                   menuItems[index - 1].variant === 'secondary');
                
                return (
                  <div key={index}>
                    {needsDivider && (
                      <div className="my-1 border-t border-gray-100"></div>
                    )}
                    <button
                      onClick={() => {
                        item.onClick();
                        setIsMenuOpen(false);
                      }}
                      className={getButtonClasses(item, true)}
                    >
                      <Icon className="w-5 h-5" />
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
