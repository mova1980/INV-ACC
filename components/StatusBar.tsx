import React, { useMemo } from 'react';
import { InventoryDocument, DocumentStatus } from '../types';
import { getDocStatusInfo } from '../utils/statusUtils';

interface Props {
    docs: InventoryDocument[];
}

const StatusBar: React.FC<Props> = ({ docs }) => {
    const statusCounts = useMemo(() => {
        const counts = {
            [DocumentStatus.ReadyForConversion]: 0,
            [DocumentStatus.PartiallySettled]: 0,
            [DocumentStatus.Issued]: 0,
        };
        for (const doc of docs) {
            if (doc.status in counts) {
                counts[doc.status]++;
            }
        }
        return counts;
    }, [docs]);

    const totalDocs = docs.length;

    return (
        <footer className="bg-[var(--background-tertiary)] border-t border-[var(--border-color)] px-4 py-2 flex justify-between items-center text-sm flex-shrink-0">
            <div className="flex items-center gap-6 text-[var(--text-secondary)]">
                <span>
                    تعداد کل اسناد: <strong className="text-[var(--text-primary)] font-semibold font-mono">{totalDocs}</strong>
                </span>
                <div className="h-4 w-px bg-[var(--border-color)]"></div>
                {Object.entries(statusCounts).map(([status, count]) => {
                    if (count === 0) return null;
                    const statusInfo = getDocStatusInfo(status as DocumentStatus);
                    return (
                        <div key={status} className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${statusInfo.bgColor}`}></span>
                            <span>
                                {statusInfo.label}: <strong className={`font-semibold font-mono counter-animation text-[var(--text-primary)]`} key={count}>{count}</strong>
                            </span>
                        </div>
                    );
                })}
            </div>
        </footer>
    );
};

export default StatusBar;