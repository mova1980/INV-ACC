import React from 'react';
import { User } from '../types';
import { UserCircleIcon } from './icons/UserCircleIcon';

interface Props {
  users: User[];
  onLogin: (user: User) => void;
}

const LoginModal: React.FC<Props> = ({ users, onLogin }) => {
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-80 z-[200] flex justify-center items-center p-4">
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-8 w-full max-w-lg flex flex-col items-center gap-6 modal-content-animation text-[var(--text-primary)]">
        <h1 className="text-2xl font-bold">ورود به سیستم</h1>
        <p className="text-[var(--text-secondary)]">لطفا کاربر خود را برای ورود انتخاب کنید.</p>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => onLogin(user)}
              className="flex items-center gap-4 p-4 border border-[var(--border-color)] rounded-lg hover:bg-[var(--background-tertiary)] hover:border-[var(--color-accent)] transition-all duration-200 text-right"
            >
              <span className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                <UserCircleIcon />
              </span>
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-[var(--text-muted)]">{user.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
