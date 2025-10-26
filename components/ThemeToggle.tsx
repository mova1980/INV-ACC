import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface Props {
  onToggle: () => void;
  theme: 'light' | 'dark';
}

const ThemeToggle: React.FC<Props> = ({ onToggle, theme }) => {
  return (
    <button
      onClick={onToggle}
      className="relative inline-flex items-center h-8 w-14 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)]"
      aria-label="Toggle Dark Mode"
    >
      <span className="sr-only">Toggle Dark Mode</span>
      <span
        className={`absolute inset-0 h-full w-full flex items-center justify-center transition-opacity duration-300 ${
          theme === 'dark' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <SunIcon />
      </span>
      <span
        className={`absolute inset-0 h-full w-full flex items-center justify-center transition-opacity duration-300 ${
          theme === 'light' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <MoonIcon />
      </span>
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ${
          theme === 'dark' ? '-translate-x-1' : 'translate-x-[1.8rem]'
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
