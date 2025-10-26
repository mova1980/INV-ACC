import React from 'react';
import ThemeToggle from './ThemeToggle';

interface Props {
  onToggleTheme: () => void;
  currentTheme: 'light' | 'dark';
}

const Header: React.FC<Props> = ({ onToggleTheme, currentTheme }) => {
  return (
    <header className="bg-[var(--background-secondary)] shadow-md p-3 flex justify-between items-center border-b border-[var(--border-color)] header-with-bg flex-shrink-0">
      <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
        سیستم تبدیل اسناد انبار به حسابداری
      </h1>
      <ThemeToggle onToggle={onToggleTheme} theme={currentTheme} />
    </header>
  );
};

export default Header;