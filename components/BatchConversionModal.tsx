import React, { useState, useMemo } from 'react';
import { InventoryDocument, Warehouse, AccountingRule, DocumentStatus } from '../types';
import { getDocStatusInfo } from '../utils/statusUtils';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import WarehouseSelectionModal from './WarehouseSelectionModal';
import { useSortableData } from '../hooks/useSortableData';
import { SortIcon } from './shared/SortIcon';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface Props {
  allDocuments: InventoryDocument[];
  allWarehouses: Warehouse[];
  accountingRules: AccountingRule[];
  onClose: () => void;
  onConfirm: (docs: InventoryDocument[]) => void;
}

const BatchConversionModal: React.FC<Props> = ({ allDocuments, allWarehouses, accountingRules, onClose, onConfirm }) => {
  useEscapeKey(onClose);
  const [filterWarehouseIds, setFilterWarehouseIds] = useState<Set<string>>(new Set());
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [foundDocuments, setFoundDocuments] = useState<InventoryDocument[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [validationError, setValidationError] = useState('');
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  
  // FIX: Explicitly provide the generic type to `useSortableData` to prevent TypeScript from inferring a too-narrow type for the sort key.
  const { items: sortedDocs, requestSort, sortConfig } = useSortableData<InventoryDocument>(foundDocuments, { key: 'date', direction: 'ascending' });

  const handleWarehouseFilterChange = (id: string) => {
    setFilterWarehouseIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  };
  
  const handleSelectAllWarehouses = () => {
    if (filterWarehouseIds.size === allWarehouses.length) {
        setFilterWarehouseIds(new Set());
    } else {
        setFilterWarehouseIds(new Set(allWarehouses.map(w => w.id.toString())));
    }
  };

  const warehouseSelectionTitle = useMemo(() => {
    if (filterWarehouseIds.size === 0) return 'همه انبارها';
    if (filterWarehouseIds.size === allWarehouses.length) return 'انتخاب همه';
    if (filterWarehouseIds.size === 1) {
        const id = filterWarehouseIds.values().next().value;
        return allWarehouses.find(w => w.id.toString() === id)?.name || '';
    }
    return `${filterWarehouseIds.size} انبار انتخاب شده`;
  }, [filterWarehouseIds, allWarehouses]);

  const handleSearch = () => {
    setValidationError('');
    const results = allDocuments.filter(doc => {
        const warehouseMatch = filterWarehouseIds.size === 0 || filterWarehouseIds.has(doc.warehouseId.toString());
        const dateFromMatch = !filterDateFrom || doc.date >= filterDateFrom;
        const dateToMatch = !filterDateTo || doc.date <= filterDateTo;
        const isSelectable = doc.status !== DocumentStatus.Issued && (doc.totalAmount - doc.convertedAmount) > 0;
        return warehouseMatch && dateFromMatch && dateToMatch && isSelectable;
    });
    setFoundDocuments(results);
    setSelectedDocIds(new Set()); // Reset selection on new search
  };
  
  const handleCheckboxChange = (docId: string, isChecked: boolean) => {
    setSelectedDocIds(prev => {
        const newSet = new Set(prev);
        if(isChecked) newSet.add(docId);
        else newSet.delete(docId);
        return newSet;
    });
  };
  
  const handleSelectAllChange = () => {
    if (selectedDocIds.size === foundDocuments.length) {
      setSelectedDocIds(new Set());
    } else {
      const allIds = new Set(foundDocuments.map(doc => doc.id));
      setSelectedDocIds(allIds);
    }
  };

  const handleConfirm = () => {
    setValidationError('');
    const selectedDocs = foundDocuments.filter(doc => selectedDocIds.has(doc.id));

    if (selectedDocs.length === 0) {
        setValidationError('لطفا حداقل یک سند را برای تبدیل انتخاب کنید.');
        return;
    }
    
    const docsWithoutTemplate: string[] = [];
    for (const doc of selectedDocs) {
        const hasRule = accountingRules.some(rule => 
            rule.isActive &&
            rule.warehouseId.toString() === doc.warehouseId.toString() &&
            rule.docTypeCode.toString() === doc.docTypeCode.toString()
        );
        if (!hasRule) {
            docsWithoutTemplate.push(doc.docNo);
        }
    }

    if (docsWithoutTemplate.length > 0) {
        setValidationError(`برای اسناد شماره ${docsWithoutTemplate.join(', ')} شابلون فعالی یافت نشد و امکان صدور سند وجود ندارد.`);
        return;
    }
    
    onConfirm(selectedDocs);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 modal-backdrop-animation" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-6 w-full max-w-5xl h-full max-h-[95vh] flex flex-col modal-content-animation text-[var(--text-primary)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3 mb-4">
          <h2 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
            <DocumentDuplicateIcon />
            صدور سند گروهی
          </h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-3xl font-light">&times;</button>
        </div>
        
        {/* Filters */}
        <div className="border border-[var(--border-color)] rounded-lg p-3 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">انبار</label>
                     <button
                        onClick={() => setShowWarehouseModal(true)}
                        className="btn btn-secondary w-full justify-between"
                    >
                        <span className="truncate">{warehouseSelectionTitle}</span>
                        <ChevronDownIcon />
                    </button>
                </div>
                <div>
                     <label htmlFor="dateFrom" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">از تاریخ</label>
                     <input type="text" id="dateFrom" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} placeholder="مثال: 1403/01/01" className="w-full p-2 rounded-md" />
                </div>
                 <div>
                     <label htmlFor="dateTo" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">تا تاریخ</label>
                     <input type="text" id="dateTo" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} placeholder="مثال: 1403/12/29" className="w-full p-2 rounded-md" />
                </div>
            </div>
            <button onClick={handleSearch} className="btn btn-primary mt-3 w-full md:w-auto">جستجوی اسناد</button>
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
                      disabled={foundDocuments.length === 0}
                      checked={foundDocuments.length > 0 && selectedDocIds.size === foundDocuments.length}
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
                    <tr key={doc.id} className="border-b border-[var(--border-color)]">
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
           {foundDocuments.length === 0 && <p className="text-center p-6 text-[var(--text-muted)]">سندی یافت نشد. لطفا فیلترها را تنظیم و جستجو کنید.</p>}
        </div>

        {validationError && <p className="mt-3 text-sm text-red-600 bg-red-500/10 p-2 rounded-md">{validationError}</p>}
        
        <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
          <span className="text-sm text-[var(--text-secondary)]">
            تعداد انتخاب شده: <span className="font-bold text-[var(--text-primary)]">{selectedDocIds.size}</span>
          </span>
          <div className="flex gap-4">
            <button onClick={onClose} className="btn btn-secondary">انصراف</button>
            <button onClick={handleConfirm} className="btn btn-primary" disabled={selectedDocIds.size === 0}>تبدیل اسناد انتخاب شده</button>
          </div>
        </div>

        {showWarehouseModal && (
            <WarehouseSelectionModal
                isOpen={showWarehouseModal}
                onClose={() => setShowWarehouseModal(false)}
                warehouses={allWarehouses}
                selectedWarehouseIds={filterWarehouseIds}
                onWarehouseSelectionChange={handleWarehouseFilterChange}
                onSelectAllWarehouses={handleSelectAllWarehouses}
            />
        )}
      </div>
    </div>
  );
};

export default BatchConversionModal;
