import React, { useState, useMemo } from 'react';
import { InventoryDocument, Warehouse, AccountingRule, DocumentStatus, DocTypeInfo } from '../types';
import { getDocStatusInfo } from '../utils/statusUtils';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';

interface Props {
  allDocuments: InventoryDocument[];
  allWarehouses: Warehouse[];
  docTypeInfos: DocTypeInfo[];
  accountingRules: AccountingRule[];
  onClose: () => void;
  onInitiateConversion: (docs: InventoryDocument[]) => void;
}

const AllDocsModal: React.FC<Props> = ({ allDocuments, allWarehouses, docTypeInfos, accountingRules, onClose, onInitiateConversion }) => {
    const [filters, setFilters] = useState({
        templateStatus: 'all', // 'all', 'with', 'without'
        warehouseIds: new Set<string>(),
        dateFrom: '',
        dateTo: '',
        status: '', // DocumentStatus or '' for all
        docType: '', // docTypeCode or '' for all
    });
    const [filteredDocuments, setFilteredDocuments] = useState<InventoryDocument[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());

    const activeRules = useMemo(() => accountingRules.filter(r => r.isActive), [accountingRules]);

    const docHasTemplate = useMemo(() => {
        const ruleMap = new Map<string, boolean>();
        activeRules.forEach(rule => {
            const key = `${rule.warehouseId}-${rule.docTypeCode}`;
            ruleMap.set(key, true);
        });
        return (doc: InventoryDocument): boolean => {
            const docKey = `${doc.warehouseId}-${doc.docTypeCode}`;
            return ruleMap.has(docKey);
        };
    }, [activeRules]);

    const handleFilterChange = (key: keyof Omit<typeof filters, 'warehouseIds'>, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleWarehouseFilterChange = (id: string) => {
        setFilters(prev => {
            const newSet = new Set(prev.warehouseIds);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return { ...prev, warehouseIds: newSet };
        });
    };

    const handleSearch = () => {
        let results = allDocuments.filter(doc => {
            if (filters.templateStatus === 'with' && !docHasTemplate(doc)) return false;
            if (filters.templateStatus === 'without' && docHasTemplate(doc)) return false;
            if (filters.warehouseIds.size > 0 && !filters.warehouseIds.has(doc.warehouseId.toString())) return false;
            if (filters.dateFrom && doc.date < filters.dateFrom) return false;
            if (filters.dateTo && doc.date > filters.dateTo) return false;
            if (filters.status && doc.status !== filters.status) return false;
            if (filters.docType && doc.docTypeCode.toString() !== filters.docType) return false;
            return true;
        });
        setFilteredDocuments(results);
        setHasSearched(true);
        setSelectedDocIds(new Set()); // Reset selection on new search
    };
    
    const handleCheckboxChange = (docId: string, isChecked: boolean) => {
        setSelectedDocIds(prev => {
            const newSet = new Set(prev);
            if (isChecked) newSet.add(docId);
            else newSet.delete(docId);
            return newSet;
        });
    };

    const selectableDocs = useMemo(() => 
        filteredDocuments.filter(doc => doc.status === DocumentStatus.ReadyForConversion && docHasTemplate(doc)),
        [filteredDocuments, docHasTemplate]
    );

    const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedDocIds(new Set(selectableDocs.map(d => d.id)));
        } else {
            setSelectedDocIds(new Set());
        }
    };
    
    const handleConfirmConversion = () => {
        const selectedDocs = filteredDocuments.filter(doc => selectedDocIds.has(doc.id));
        if (selectedDocs.length > 0) {
            onInitiateConversion(selectedDocs);
            onClose();
        }
    };

    const documentStatusOptions = Object.values(DocumentStatus);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 modal-backdrop-animation" onClick={onClose}>
            <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-6 w-full max-w-7xl h-full max-h-[95vh] flex flex-col modal-content-animation text-[var(--text-primary)]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3 mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
                        <ListBulletIcon />
                        لیست جامع اسناد انبار
                    </h2>
                    <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-3xl font-light">&times;</button>
                </div>

                {/* Filters */}
                <div className="border border-[var(--border-color)] rounded-lg p-3 mb-4 space-y-3 flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {/* Warehouse Filter */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">انبارها</label>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 max-h-24 overflow-y-auto p-1 rounded-md border border-[var(--border-color)]">
                                {allWarehouses.map(w => (
                                    <label key={w.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[var(--background-tertiary)]">
                                        <input type="checkbox" className="rounded" checked={filters.warehouseIds.has(w.id.toString())} onChange={() => handleWarehouseFilterChange(w.id.toString())} />
                                        {w.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                        {/* Date Filters */}
                        <div>
                            <label htmlFor="dateFrom" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">از تاریخ</label>
                            <input type="text" id="dateFrom" value={filters.dateFrom} onChange={e => handleFilterChange('dateFrom', e.target.value)} placeholder="1403/01/01" className="w-full p-2 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="dateTo" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">تا تاریخ</label>
                            <input type="text" id="dateTo" value={filters.dateTo} onChange={e => handleFilterChange('dateTo', e.target.value)} placeholder="1403/12/29" className="w-full p-2 rounded-md" />
                        </div>
                        {/* Doc Type Filter */}
                        <div>
                            <label htmlFor="docType" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">نوع سند</label>
                            <select id="docType" value={filters.docType} onChange={e => handleFilterChange('docType', e.target.value)} className="w-full p-2.5 rounded-md text-sm">
                                <option value="">همه</option>
                                {docTypeInfos.map(dt => <option key={dt.id} value={dt.id.toString()}>{dt.name}</option>)}
                            </select>
                        </div>
                        {/* Status Filter */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">وضعیت سند</label>
                            <select id="status" value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className="w-full p-2.5 rounded-md text-sm">
                                <option value="">همه</option>
                                {documentStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="flex flex-wrap items-end gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">وضعیت شابلون</label>
                            <div className="flex items-center gap-4 p-2 border border-[var(--border-color)] rounded-md">
                                <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="templateStatus" value="all" checked={filters.templateStatus === 'all'} onChange={e => handleFilterChange('templateStatus', e.target.value)} className="ml-1" /> همه</label>
                                <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="templateStatus" value="with" checked={filters.templateStatus === 'with'} onChange={e => handleFilterChange('templateStatus', e.target.value)} className="ml-1" /> دارای شابلون</label>
                                <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="templateStatus" value="without" checked={filters.templateStatus === 'without'} onChange={e => handleFilterChange('templateStatus', e.target.value)} className="ml-1" /> فاقد شابلون</label>
                            </div>
                        </div>
                        <button onClick={handleSearch} className="btn btn-primary">جستجو</button>
                    </div>
                </div>

                {/* Results Table */}
                <div className="overflow-auto flex-grow border border-[var(--border-color)] rounded-lg">
                    <table className="w-full text-sm text-right">
                        <thead className="sticky top-0 bg-[var(--background-tertiary)] text-[var(--text-secondary)] z-10">
                            <tr>
                                <th className="p-2 w-10">
                                    <input 
                                        type="checkbox" 
                                        className="rounded"
                                        disabled={selectableDocs.length === 0}
                                        checked={selectableDocs.length > 0 && selectedDocIds.size === selectableDocs.length}
                                        onChange={handleSelectAllChange}
                                    />
                                </th>
                                <th className="p-2 font-medium">شماره سند</th>
                                <th className="p-2 font-medium">تاریخ</th>
                                <th className="p-2 font-medium w-1/4">نوع سند</th>
                                <th className="p-2 font-medium w-1/4">انبار</th>
                                <th className="p-2 font-medium">مبلغ کل</th>
                                <th className="p-2 font-medium">وضعیت</th>
                                <th className="p-2 font-medium">شابلون</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocuments.map(doc => {
                                const statusInfo = getDocStatusInfo(doc.status);
                                const hasTpl = docHasTemplate(doc);
                                const isSelectable = doc.status === DocumentStatus.ReadyForConversion && hasTpl;
                                return (
                                    <tr key={doc.id} className={`border-b border-[var(--border-color)] ${isSelectable ? 'hover:bg-[var(--background-tertiary)]' : 'opacity-60'}`}>
                                        <td className="p-2">
                                            <input 
                                                type="checkbox" 
                                                className="rounded"
                                                checked={selectedDocIds.has(doc.id)}
                                                onChange={e => handleCheckboxChange(doc.id, e.target.checked)}
                                                disabled={!isSelectable}
                                            />
                                        </td>
                                        <td className="p-2 font-mono">{doc.docNo}</td>
                                        <td className="p-2 font-mono">{doc.date}</td>
                                        <td className="p-2">{doc.docTypeDescription}</td>
                                        <td className="p-2 text-xs">{doc.warehouseName}</td>
                                        <td className="p-2 font-mono">{doc.totalAmount.toLocaleString('fa-IR')}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>{statusInfo.label}</span>
                                        </td>
                                        <td className="p-2 flex justify-center">{hasTpl ? <CheckCircleIcon /> : <XCircleIcon />}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {!hasSearched && <p className="text-center p-6 text-[var(--text-muted)]">برای مشاهده اسناد، فیلترها را تنظیم کرده و دکمه جستجو را بزنید.</p>}
                    {hasSearched && filteredDocuments.length === 0 && <p className="text-center p-6 text-[var(--text-muted)]">هیچ سندی با فیلترهای مشخص شده یافت نشد.</p>}
                </div>
                
                <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between items-center flex-shrink-0">
                    <span className="text-sm text-[var(--text-secondary)]">
                        تعداد انتخاب شده: <strong className="font-bold text-[var(--text-primary)]">{selectedDocIds.size}</strong> از <strong className="font-bold text-[var(--text-primary)]">{selectableDocs.length}</strong> سند قابل صدور
                    </span>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleConfirmConversion}
                            className="btn btn-primary"
                            disabled={selectedDocIds.size === 0}
                        >
                            <MagicWandIcon />
                            تبدیل به سند حسابداری
                        </button>
                        <button onClick={onClose} className="btn btn-secondary">بستن</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllDocsModal;