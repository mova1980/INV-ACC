import React from 'react';
import { InventoryDocument, DocumentType, DocumentStatus } from '../types';
import { DocumentIcon } from './icons/DocumentIcon';

interface Props {
  documents: InventoryDocument[];
  selectedDocIds: Set<string>;
  activeDocId?: string | null;
  onSelectDocForView: (doc: InventoryDocument) => void;
  onSelectionChange: (docId: string) => void;
  onSelectAll: (isSelected: boolean) => void;
}

const InventoryDocList: React.FC<Props> = ({ documents, selectedDocIds, activeDocId, onSelectDocForView, onSelectionChange, onSelectAll }) => {
  const getDocTypeInfo = (type: DocumentType) => {
    return type === DocumentType.Receipt
      ? { label: 'رسید انبار', color: 'text-green-600', bgColor: 'bg-green-100' }
      : { label: 'حواله انبار', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  };

  const getDocStatusInfo = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.Sent:
        return { label: 'ارسال شده', color: 'text-emerald-700', bgColor: 'bg-emerald-100' };
      case DocumentStatus.Issue:
        return { label: 'دارای اشکال', color: 'text-red-700', bgColor: 'bg-red-100' };
      case DocumentStatus.NoTemplate:
        return { label: 'فاقد شابلون', color: 'text-amber-800', bgColor: 'bg-amber-100' };
      default:
        return { label: '', color: '', bgColor: '' };
    }
  };


  const isAllSelected = documents.length > 0 && selectedDocIds.size === documents.length;

  return (
    <div className="flex-grow flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4 border-b pb-2 px-2">
        <h2 className="text-lg font-semibold">اسناد انبار</h2>
        <div className="flex items-center gap-2">
            <label htmlFor="selectAll" className="text-sm text-slate-600">انتخاب همه</label>
            <input 
                type="checkbox" 
                id="selectAll"
                checked={isAllSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
            />
        </div>
      </div>
      <ul className="space-y-2 overflow-y-auto flex-grow">
        {documents.map((doc, index) => {
          const typeInfo = getDocTypeInfo(doc.type);
          const statusInfo = getDocStatusInfo(doc.status);
          const isSelectedForBulk = selectedDocIds.has(doc.id);
          const isActiveForView = doc.id === activeDocId;
          const totalAmount = doc.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

          return (
            <li 
              key={doc.id} 
              className={`w-full p-2 rounded-lg transition-all duration-300 flex items-center gap-3 border list-item-animation ${
                isActiveForView ? 'bg-blue-50 border-blue-400' : 'border-transparent'
              } ${isSelectedForBulk ? 'bg-orange-50' : 'hover:bg-slate-100 hover:shadow-md hover:-translate-y-px'}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <input
                type="checkbox"
                checked={isSelectedForBulk}
                onChange={() => onSelectionChange(doc.id)}
                className="h-5 w-5 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)] flex-shrink-0"
              />
              <button
                onClick={() => onSelectDocForView(doc)}
                className="w-full text-right flex items-start gap-3"
              >
                <div className={`mt-1 ${typeInfo.color}`}>
                   <DocumentIcon />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">{doc.id}</span>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeInfo.bgColor} ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500">{doc.date} - {doc.warehouseName}</p>
                   <p className="text-sm font-semibold text-slate-600 mt-1">
                     {totalAmount.toLocaleString('fa-IR')} ریال
                   </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default InventoryDocList;