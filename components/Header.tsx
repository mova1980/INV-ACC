import React from 'react';
import ThemeToggle from './ThemeToggle';
import { SearchIcon } from './icons/SearchIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface Props {
  onToggleTheme: () => void;
  currentTheme: 'light' | 'dark';
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const Header: React.FC<Props> = ({ onToggleTheme, currentTheme, searchTerm, onSearchChange }) => {
  return (
    <header className="bg-[var(--background-secondary)] shadow-md p-3 flex justify-between items-center border-b border-[var(--border-color)] header-with-bg flex-shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">
          سیستم تبدیل اسناد انبار به حسابداری
        </h1>
      </div>
      <div className="flex items-center gap-16">
        <div className="relative w-64">
           <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <SearchIcon />
            </div>
          <input
            type="text"
            placeholder="جستجوی شماره، نوع، مبلغ و..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full p-2 pr-10 border rounded-full text-sm focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-all duration-300"
          />
           {searchTerm && (
                <button
                    onClick={() => onSearchChange('')}
                    className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-gray-700"
                >
                    <XCircleIcon />
                </button>
            )}
        </div>
        <ThemeToggle onToggle={onToggleTheme} theme={currentTheme} />
      </div>
    </header>
  );
};

export default Header;