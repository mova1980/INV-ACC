import React, { useState, useMemo } from 'react';
import { InventoryDocument, DocumentStatus } from '../types';
import { getDocStatusInfo } from '../utils/statusUtils';
import { SettlePartialIcon } from './icons/SettlePartialIcon';
import { useSortableData } from '../hooks/useSortableData';
import { SortIcon } from './shared/SortIcon';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface Props {
  allDocuments: InventoryDocument[];
  onClose: () => void;
  onInitiateConversion: (docs: InventoryDocument[]) => void;
}

const SettlePartialDocsModal: React.FC<Props> = ({ allDocuments, onClose, onInitiateConversion }) => {
  useEscapeKey(onClose);
  const partiallySettledDocs = useMemo(() => 
    allDocuments.filter(doc => doc.status === DocumentStatus.PartiallySettled), 
    [allDocuments]
  );
  
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  // FIX: Explicitly provide the generic type to `useSortableData` to prevent TypeScript from inferring a too-narrow type for the sort key.
  const { items: sortedDocs, requestSort, sortConfig } = useSortableData<InventoryDocument>(partiallySettledDocs, { key: 'date', direction: 'ascending' });

  const handleCheckboxChange = (docId: string, isChecked: boolean) => {
    setSelectedDocIds(prev => {
        const newSet = new Set(prev);
        if(isChecked) newSet.add(docId);
        else newSet.delete(docId);
        return newSet;
    });
  };
  
  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDocIds(new Set(partiallySettledDocs.map(doc => doc.id)));
    } else {
      setSelectedDocIds(new Set());
    }
  };

  const handleConfirm = () => {
    const selectedDocs = partiallySettledDocs.filter(doc => selectedDocIds.has(doc.id));
    if (selectedDocs.length > 0) {
        onInitiateConversion(selectedDocs);
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 modal-backdrop-animation" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-6 w-full max-w-4xl h-full max-h-[90vh] flex flex-col modal-content-animation text-[var(--text-primary)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3 mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
            <SettlePartialIcon />
            تسویه اسناد با تسویه ناقص
          </h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-3xl font-light">&times;</button>
        </div>
        
        {/* Results */}
        <div className="overflow-auto flex-grow border border-[var(--border-color)] rounded-lg">
           <table className="w-full text-sm text-right">
              <thead className="sticky top-0 bg-[var(--background-tertiary)] text-[var(--text-secondary)] z-10">
                <tr>
                  <th className="p-2 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded"
                      disabled={partiallySettledDocs.length === 0}
                      checked={partiallySettledDocs.length > 0 && selectedDocIds.size === partiallySettledDocs.length}
                      onChange={handleSelectAllChange}
                    />
                  </th>
                  <th className="p-2 font-medium"><button onClick={() => requestSort('docNo')} className="flex items-center gap-1">شماره سند<SortIcon direction={sortConfig?.key === 'docNo' ? sortConfig.direction : undefined} /></button></th>
                  <th className="p-2 font-medium"><button onClick={() => requestSort('date')} className="flex items-center gap-1">تاریخ<SortIcon direction={sortConfig?.key === 'date' ? sortConfig.direction : undefined} /></button></th>
                  <th className="p-2 font-medium w-1/4"><button onClick={() => requestSort('docTypeDescription')} className="flex items-center gap-1">نوع سند<SortIcon direction={sortConfig?.key === 'docTypeDescription' ? sortConfig.direction : undefined} /></button></th>
                  <th className="p-2 font-medium w-1/4"><button onClick={() => requestSort('warehouseName')} className="flex items-center gap-1">انبار<SortIcon direction={sortConfig?.key === 'warehouseName' ? sortConfig.direction : undefined} /></button></th>
                  <th className="p-2 font-medium"><button onClick={() => requestSort('totalAmount')} className="flex items-center gap-1">مبلغ باقیمانده<SortIcon direction={sortConfig?.key === 'totalAmount' ? sortConfig.direction : undefined} /></button></th>
                  <th className="p-2 font-medium"><button onClick={() => requestSort('status')} className="flex items-center gap-1">وضعیت<SortIcon direction={sortConfig?.key === 'status' ? sortConfig.direction : undefined} /></button></th>
                </tr>
              </thead>
              <tbody>
                {sortedDocs.map(doc => (
                    <tr key={doc.id} className="border-b border-[var(--border-color)] hover:bg-[var(--background-tertiary)]">
                       <td className="p-2"><input type="checkbox" className="rounded" checked={selectedDocIds.has(doc.id)} onChange={e => handleCheckboxChange(doc.id, e.target.checked)} /></td>
                       <td className="p-2 font-mono">{doc.docNo}</td>
                       <td className="p-2 font-mono">{doc.date}</td>
                       <td className="p-2">{doc.docTypeDescription}</td>
                       <td className="p-2 text-xs">{doc.warehouseName}</td>
                       <td className="p-2 font-mono text-[var(--color-success)]">{(doc.totalAmount - doc.convertedAmount).toLocaleString('fa-IR')}</td>
                       <td className="p-2"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDocStatusInfo(doc.status).bgColor} ${getDocStatusInfo(doc.status).color}`}>{getDocStatusInfo(doc.status).label}</span></td>
                    </tr>
                ))}
              </tbody>
           </table>
           {partiallySettledDocs.length === 0 && <p className="text-center p-6 text-[var(--text-muted)]">هیچ سند با تسویه ناقص برای تسویه مجدد یافت نشد.</p>}
        </div>
        
        <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between items-center flex-shrink-0">
          <span className="text-sm text-[var(--text-secondary)]">
            تعداد انتخاب شده: <strong className="font-bold text-[var(--text-primary)]">{selectedDocIds.size}</strong>
          </span>
          <div className="flex gap-4">
            <button onClick={onClose} className="btn btn-secondary">انصراف</button>
            <button onClick={handleConfirm} className="btn btn-primary" disabled={selectedDocIds.size === 0}>صدور سند برای باقیمانده</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlePartialDocsModal;
