import React, { useState, useEffect, useMemo } from 'react';
import { LogEntry } from '../types';
import { LogIcon } from './icons/LogIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { InfoIcon } from './icons/InfoIcon';
import { useSortableData } from '../hooks/useSortableData';
import { SortIcon } from './shared/SortIcon';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface Props {
  logs: LogEntry[];
  onClose: () => void;
}

const LogIconForType: React.FC<{ type: LogEntry['type'] }> = ({ type }) => {
    switch (type) {
        case 'success': return <CheckCircleIcon />;
        case 'error': return <XCircleIcon />;
        case 'info': return <InfoIcon />;
        default: return <InfoIcon />;
    }
};

const LogModal: React.FC<Props> = ({ logs, onClose }) => {
  useEscapeKey(onClose);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  // FIX: Explicitly provide the generic type to `useSortableData` to prevent TypeScript from inferring a too-narrow type for the sort key.
  const { items: sortedLogs, requestSort, sortConfig } = useSortableData<LogEntry>(logs, { key: 'timestamp', direction: 'descending' });

  useEffect(() => {
    // Select the first log by default when the modal opens or logs update
    if (sortedLogs.length > 0 && !selectedLogId) {
      setSelectedLogId(sortedLogs[0].id);
    }
  }, [sortedLogs, selectedLogId]);

  const selectedLog = useMemo(() => {
    return logs.find(log => log.id === selectedLogId);
  }, [logs, selectedLogId]);
  
  const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 modal-backdrop-animation" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-6 w-full max-w-6xl h-full max-h-[95vh] flex flex-col modal-content-animation text-[var(--text-primary)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3 mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
            <LogIcon />
            مشاهده لاگ‌های سیستم
          </h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-3xl font-light">&times;</button>
        </div>

        <div className="flex flex-grow overflow-hidden gap-4">
            {/* Master View: List of Logs */}
            <div className="w-2/5 border-l border-[var(--border-color)] pl-4 flex flex-col">
                <div className="flex-shrink-0 mb-2 text-xs text-[var(--text-muted)]">
                    مرتب‌سازی بر اساس:
                    <button onClick={() => requestSort('timestamp')} className="hover:text-[var(--text-primary)] mx-2">
                        تاریخ <SortIcon direction={sortConfig?.key === 'timestamp' ? sortConfig.direction : undefined} />
                    </button>
                    <button onClick={() => requestSort('userName')} className="hover:text-[var(--text-primary)]">
                        کاربر <SortIcon direction={sortConfig?.key === 'userName' ? sortConfig.direction : undefined} />
                    </button>
                </div>
                <div className="overflow-y-auto">
                    {sortedLogs.map(log => (
                        <div
                            key={log.id}
                            onClick={() => setSelectedLogId(log.id)}
                            className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${selectedLogId === log.id ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'hover:bg-[var(--background-tertiary)]'}`}
                        >
                            <div className="flex items-center gap-3">
                               <span className="flex-shrink-0"><LogIconForType type={log.type} /></span>
                               <div className="flex-grow overflow-hidden">
                                    <p className="font-semibold truncate">{log.title}</p>
                                    <div className="flex justify-between text-xs text-[var(--text-muted)]">
                                        <span>{log.userName}</span>
                                        <span className="font-mono">{formatTimestamp(log.timestamp)}</span>
                                    </div>
                               </div>
                            </div>
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <div className="text-center text-[var(--text-muted)] pt-10">
                            <p>هیچ لاگی برای نمایش وجود ندارد.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail View: Log Details */}
            <div className="w-3/5 overflow-y-auto pr-2">
                {selectedLog ? (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-bold">{selectedLog.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                                <span className="font-mono">{formatTimestamp(selectedLog.timestamp)}</span>
                                <span className="font-semibold">کاربر: {selectedLog.userName}</span>
                            </div>
                        </div>
                        <div className="border-t border-[var(--border-color)] pt-4">
                            <h4 className="font-semibold mb-2">جزئیات:</h4>
                            <pre className="bg-[var(--background-primary)] p-4 rounded-md text-sm whitespace-pre-wrap break-all border border-[var(--border-color-strong)]">
                                {typeof selectedLog.details === 'string'
                                    ? selectedLog.details
                                    : JSON.stringify(selectedLog.details, null, 2)}
                            </pre>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
                        <p>برای مشاهده جزئیات، یک لاگ را از لیست انتخاب کنید.</p>
                    </div>
                )}
            </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-end">
          <button onClick={onClose} className="btn btn-secondary">بستن</button>
        </div>
      </div>
    </div>
  );
};

// A generic info icon for the logger
const InfoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default LogModal;