import React from 'react';
import { ToastInfo } from '../types';
import Toast from './Toast';

interface Props {
  toasts: ToastInfo[];
  onDismiss: (id: number) => void;
}

const ToastContainer: React.FC<Props> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[200]"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={() => onDismiss(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
