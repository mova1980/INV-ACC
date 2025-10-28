import React, { useEffect } from 'react';
import { ToastInfo } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

// FIX: Moved the local InfoIcon component definition from the bottom of the file to before its usage to resolve a block-scoped variable error. The conflicting import was also removed.
// A generic info icon for the toast
const InfoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface Props extends ToastInfo {
  onDismiss: () => void;
}

const icons = {
  success: <CheckCircleIcon />,
  error: <XCircleIcon />,
  info: <InfoIcon />,
};

const colors = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
}

const Toast: React.FC<Props> = ({ title, message, variant, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onDismiss]);

  return (
    <div className="max-w-sm w-full bg-[var(--background-secondary)] shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden animate-fade-in border border-[var(--border-color)]">
      <div className="p-4">
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${colors[variant]}`}>
            {icons[variant]}
          </div>
          <div className="mr-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-bold text-[var(--text-primary)]">{title}</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)]"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;