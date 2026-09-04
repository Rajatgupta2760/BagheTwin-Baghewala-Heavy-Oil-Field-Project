import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  className = '',
}) => {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      className={`relative inline-flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all duration-200 cursor-pointer text-xs font-semibold ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-amber-300 hover:text-amber-200 shadow-inner'
          : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Sun className="w-4 h-4 text-amber-600 transition-transform duration-300 rotate-0 scale-100" />
        )}
      </div>
      
      <span className="hidden sm:inline font-mono text-[11px] font-bold">
        {isDark ? 'Dark' : 'Light'}
      </span>
      
      {/* Visual toggle track indicator */}
      <span 
        className={`hidden lg:inline-flex w-7 h-3.5 rounded-full p-0.5 items-center transition-colors ${
          isDark ? 'bg-orange-600 justify-end' : 'bg-slate-300 justify-start'
        }`}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
      </span>
    </button>
  );
};
