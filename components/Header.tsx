import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md animate-fade-in">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
        <img 
          src="https://busibell.com/wp-content/uploads/2025/10/Untitled.jpg" 
          alt="لوگوی مواد کاران جاهد نوآور" 
          className="h-14 object-contain"
        />
        <div>
            <h1 className="text-xl font-bold text-[var(--color-primary)]">
              سامانه یکپارچه مواد کاران جاهد نوآور
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              سیستم تبدیل اسناد انبار به حسابداری 
            </p>
        </div>
      </div>
    </header>
  );
};

export default Header;