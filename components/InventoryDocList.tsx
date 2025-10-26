import React from 'react';
import { InventoryDocument } from '../types';
import { getDocStatusInfo } from '../utils/statusUtils';
import { DocumentStatus } from '../types';

interface Props {
  docs: InventoryDocument[];
  onSelectDoc: (doc: InventoryDocument) => void;
  selectedDocId: string | null;
  onCheckboxChange: (docId: string, isChecked: boolean) => void;
  selectedDocIds: Set<string>;
  warehouseSelectionTitle: string;
}

const InventoryDocList: React.FC<Props> = ({ docs, onSelectDoc, selectedDocId, onCheckboxChange, selectedDocIds, warehouseSelectionTitle }) => {
  return (
    <div className="bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-xl shadow-sm overflow-hidden animate-fade-in">
      <h3 className="text-lg font-bold p-4 border-b border-[var(--border-color)] text-[var(--text-primary)]">
        لیست اسناد انبار: <span className="text-[var(--color-accent)]">{warehouseSelectionTitle}</span>
      </h3>
      <div className="overflow-x-auto max-h-[400px]">
        <table className="w-full text-sm text-right animated-table">
          <thead className="sticky top-0 bg-[var(--background-tertiary)] text-[var(--text-secondary)] z-20">
            <tr>
              <th className="p-3 w-10"><input type="checkbox" className="rounded" /></th>
              <th className="p-3 font-semibold">شماره سند</th>
              <th className="p-3 font-semibold">تاریخ</th>
              <th className="p-3 font-semibold w-1/3">نوع سند</th>
              <th className="p-3 font-semibold">مبلغ کل</th>
              <th className="p-3 font-semibold">وضعیت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {docs.map((doc) => {
              const statusInfo = getDocStatusInfo(doc.status);
              const remainingAmount = doc.totalAmount - doc.convertedAmount;
              const isSelectable = doc.status !== DocumentStatus.Issued && remainingAmount > 0;

              return (
              <tr
                key={doc.id}
                onClick={() => onSelectDoc(doc)}
                className={`cursor-pointer ${selectedDocId === doc.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}
              >
                <td className="p-3">
                  {isSelectable && (
                    <input 
                      type="checkbox"
                      className="rounded" 
                      checked={selectedDocIds.has(doc.id)}
                      onChange={e => onCheckboxChange(doc.id, e.target.checked)}
                      onClick={e => e.stopPropagation()}
                    />
                  )}
                </td>
                <td className="p-3 font-mono">{doc.docNo}</td>
                <td className="p-3 font-mono">{doc.date}</td>
                <td className="p-3">{doc.docTypeDescription}</td>
                <td className="p-3 font-mono">{doc.totalAmount.toLocaleString('fa-IR')}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        {docs.length === 0 && (
            <p className="text-center p-6 text-[var(--text-muted)]">سندی برای نمایش با فیلترهای انتخاب شده یافت نشد.</p>
        )}
      </div>
    </div>
  );
};

export default InventoryDocList;