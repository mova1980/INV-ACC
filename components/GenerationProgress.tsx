import React from 'react';
import { CoffeeIcon } from './icons/CoffeeIcon';

interface Props {
  progress: number;
  statusText: string;
}

const GenerationProgress: React.FC<Props> = ({ progress, statusText }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex justify-center items-center modal-backdrop-animation">
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center gap-6 text-[var(--text-primary)]">
        <div className="relative">
            <div className="w-20 h-20 bg-[var(--color-accent)] opacity-20 rounded-full absolute -inset-4 animate-ping"></div>
            <div className="w-16 h-16 bg-[var(--background-tertiary)] rounded-full flex items-center justify-center animate-icon-glow">
                <span className="text-[var(--color-accent)] scale-125">
                    <CoffeeIcon />
                </span>
            </div>
        </div>

        <h2 className="text-xl font-bold">در حال تولید سند مالی...</h2>
        
        <div className="w-full">
            <div className="flex justify-between items-center mb-1 text-sm">
                <span className="text-[var(--text-secondary)] animate-fade-in" key={statusText}>
                    {statusText}
                </span>
                <span className="font-semibold font-mono text-[var(--color-accent)]">
                    {Math.round(progress)}%
                </span>
            </div>
            <div className="w-full bg-[var(--background-primary)] rounded-full h-3 overflow-hidden border border-[var(--border-color)]">
                <div 
                    className="bg-gradient-to-r from-indigo-400 to-[var(--color-accent)] h-full rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default GenerationProgress;