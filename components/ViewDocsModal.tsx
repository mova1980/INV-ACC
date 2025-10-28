import React, { useState, useMemo } from 'react';
import { InventoryDocument } from '../types';
import { getDocStatusInfo } from '../utils/statusUtils';
import { exportInventoryDocsToCSV, exportInventoryDocsToPDF, exportInventoryDocsToXLS } from '../utils/exportUtils';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { FilePdfIcon } from './icons/FilePdfIcon';
import { FileXlsxIcon } from './icons/FileXlsxIcon';
import Spinner from './Spinner';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { useSortableData } from '../hooks/useSortableData';
import { SortIcon } from './shared/SortIcon';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  docs: InventoryDocument[];
  docHasTemplate: (doc: InventoryDocument) => boolean;
}

type EnrichedDocument = InventoryDocument & {
  totalQuantity: number;
  hasTemplate: boolean;
};

const ViewDocsModal: React.FC<Props> = ({ isOpen, onClose, title, docs, docHasTemplate }) => {
  useEscapeKey(onClose);
  const [isExporting, setIsExporting] = useState(false);

  const enrichedDocs = useMemo((): EnrichedDocument[] => {
    return docs.map(doc => ({
      ...doc,
      totalQuantity: doc.details.reduce((sum, item) => sum + item.quantity, 0),
      hasTemplate: docHasTemplate(doc),
    }));
  }, [docs, docHasTemplate]);

  // FIX: Explicitly provide the generic type to `useSortableData` to prevent TypeScript from inferring a too-narrow type for the sort key.
  const { items: sortedDocs, requestSort, sortConfig } = useSortableData<EnrichedDocument>(enrichedDocs, { key: 'date', direction: 'descending' });

  const handleExport = async (format: 'csv' | 'pdf' | 'xls') => {
    setIsExporting(true);
    try {
        if (format === 'csv') {
            exportInventoryDocsToCSV(sortedDocs, docHasTemplate);
        } else if (format === 'pdf') {
            await exportInventoryDocsToPDF(sortedDocs, docHasTemplate);
        } else {
            exportInventoryDocsToXLS(sortedDocs, docHasTemplate);
        }
    } catch (error) {
        console.error(`Error exporting to ${format}:`, error);
    } finally {
        setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  const headers: { key: keyof EnrichedDocument, label: string, className?: string }[] = [
      { key: 'docNo', label: 'شماره سند' },
      { key: 'date', label: 'تاریخ' },
      { key: 'docTypeDescription', label: 'نوع سند', className: 'w-1/4' },
      { key: 'warehouseName', label: 'انبار', className: 'w-1/4' },
      { key: 'totalQuantity', label: 'تعداد کل' },
      { key: 'totalAmount', label: 'مبلغ کل' },
      { key: 'status', label: 'وضعیت' },
      { key: 'hasTemplate', label: 'شابلون' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 modal-backdrop-animation" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-6 w-full max-w-7xl h-full max-h-[95vh] flex flex-col modal-content-animation text-[var(--text-primary)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3 mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
            <ListBulletIcon />
            {title}
          </h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-3xl font-light">&times;</button>
        </div>
        
        <div className="overflow-auto flex-grow border border-[var(--border-color)] rounded-lg">
           <table className="w-full text-sm text-right">
              <thead className="sticky top-0 bg-[var(--background-tertiary)] text-[var(--text-secondary)] z-10">
                <tr>
                    {headers.map(({key, label, className}) => (
                        <th key={key} className={`p-2 font-medium ${className || ''}`}>
                            <button onClick={() => requestSort(key)} className="w-full text-right flex items-center justify-start">
                                {label}
                                <SortIcon direction={sortConfig?.key === key ? sortConfig.direction : undefined} />
                            </button>
                        </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {sortedDocs.map(doc => {
                    const statusInfo = getDocStatusInfo(doc.status);
                    return (
                        <tr key={doc.id} className="hover:bg-[var(--background-tertiary)]">
                           <td className="p-2 font-mono">{doc.docNo}</td>
                           <td className="p-2 font-mono">{doc.date}</td>
                           <td className="p-2">{doc.docTypeDescription}</td>
                           <td className="p-2 text-xs">{doc.warehouseName}</td>
                           <td className="p-2 font-mono">{doc.totalQuantity.toLocaleString('fa-IR')}</td>
                           <td className="p-2 font-mono">{doc.totalAmount.toLocaleString('fa-IR')}</td>
                           <td className="p-2"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>{statusInfo.label}</span></td>
                           <td className="p-2 flex justify-center">{doc.hasTemplate ? <CheckCircleIcon /> : <XCircleIcon />}</td>
                        </tr>
                    )
                })}
              </tbody>
           </table>
           {docs.length === 0 && <p className="text-center p-6 text-[var(--text-muted)]">سندی برای نمایش وجود ندارد.</p>}
        </div>
        
        <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between items-center flex-shrink-0">
          <div className="flex gap-2">
             <button onClick={() => handleExport('csv')} className="btn btn-secondary text-sm" disabled={docs.length === 0 || isExporting}>
                {isExporting ? <Spinner /> : <FileTextIcon />}
                CSV
             </button>
             <button onClick={() => handleExport('xls')} className="btn btn-secondary text-sm" disabled={docs.length === 0 || isExporting}>
                {isExporting ? <Spinner /> : <FileXlsxIcon />}
                XLS
             </button>
             <button onClick={() => handleExport('pdf')} className="btn btn-secondary text-sm" disabled={docs.length === 0 || isExporting}>
                {isExporting ? <Spinner /> : <FilePdfIcon />}
                PDF
             </button>
          </div>
          <button onClick={onClose} className="btn btn-secondary">بستن</button>
        </div>
      </div>
    </div>
  );
};

export default ViewDocsModal;
