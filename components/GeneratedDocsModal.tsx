import React, { useState, useMemo } from 'react';
import { GeneratedDocInfo, Warehouse, ApprovalStatus, User, UserRole } from '../types';
import { ArchiveIcon } from './icons/ArchiveIcon';
import { exportToCSV, exportToPDF, exportToXLS } from '../utils/exportUtils';
import { FileTextIcon } from './icons/FileTextIcon';
import { FilePdfIcon } from './icons/FilePdfIcon';
import { FileXlsxIcon } from './icons/FileXlsxIcon';
import Spinner from './Spinner';
import { getApprovalStatusInfo } from '../utils/approvalStatusUtils';
import { PencilIcon } from './icons/PencilIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useSortableData } from '../hooks/useSortableData';
import { SortIcon } from './shared/SortIcon';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface Props {
  docs: GeneratedDocInfo[];
  warehouses: Warehouse[];
  onClose: () => void;
  onApprove: (docId: string) => void;
  onApproveAll: (docIds: string[]) => void;
  onEdit: (docInfo: GeneratedDocInfo) => void;
  onDelete: (docId: string) => void;
  onDeleteAll: (docIds: string[]) => void;
  currentUser: User;
}

type SortableGeneratedDoc = GeneratedDocInfo & {
    date: string;
    description: string;
    totalDebit: number;
};

const GeneratedDocsModal: React.FC<Props> = ({ docs, warehouses, onClose, onApprove, onApproveAll, onEdit, onDelete, onDeleteAll, currentUser }) => {
  useEscapeKey(onClose);
  const [filters, setFilters] = useState({ warehouse: '', date: '' });
  const [isExporting, setIsExporting] = useState(false);
  const [selectedDocIndex, setSelectedDocIndex] = useState<number | null>(null);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());

  const [docToConfirmApprove, setDocToConfirmApprove] = useState<GeneratedDocInfo | null>(null);
  const [docToConfirmDelete, setDocToConfirmDelete] = useState<GeneratedDocInfo | null>(null);
  const [showConfirmApproveAll, setShowConfirmApproveAll] = useState(false);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);

  const canApprove = currentUser.role === UserRole.Admin || currentUser.role === UserRole.FinancialManager;
  const canEdit = currentUser.role !== UserRole.Storekeeper;


  const enrichedDocs = useMemo((): SortableGeneratedDoc[] => {
    return docs.map(doc => ({
      ...doc,
      date: doc.entry.date,
      description: doc.entry.description,
      totalDebit: doc.entry.totalDebit,
    }));
  }, [docs]);

  const { items: sortedAndFilteredDocs, requestSort, sortConfig } = useSortableData<SortableGeneratedDoc>(enrichedDocs, { key: 'date', direction: 'descending' });

  const handleFilterChange = (key: 'warehouse' | 'date', value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSelectedDocIds(new Set());
  };

  const filteredDocs = useMemo(() => {
    setSelectedDocIndex(null); // Reset selection when filters change
    return sortedAndFilteredDocs.filter(docInfo => {
      const dateMatch = filters.date ? docInfo.entry.date.includes(filters.date) : true;
      const warehouseMatch = filters.warehouse ? docInfo.sourceWarehouseNames.includes(filters.warehouse) : true;
      return dateMatch && warehouseMatch;
    });
  }, [sortedAndFilteredDocs, filters]);

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
      setSelectedDocIds(new Set(filteredDocs.map(d => d.id)));
    } else {
      setSelectedDocIds(new Set());
    }
  };

  const draftDocsToApprove = useMemo(() => 
    filteredDocs.filter(d => d.approvalStatus === ApprovalStatus.Draft),
    [filteredDocs]
  );

  const draftDocsToDelete = useMemo(() =>
    Array.from(selectedDocIds).filter(id => {
        const doc = filteredDocs.find(d => d.id === id);
        return doc && doc.approvalStatus === ApprovalStatus.Draft;
    }),
    [selectedDocIds, filteredDocs]
  );
  
  const handleExport = async (format: 'csv' | 'pdf' | 'xls') => {
    setIsExporting(true);
    const docsToExport = selectedDocIds.size > 0 
        ? filteredDocs.filter(doc => selectedDocIds.has(doc.id)) 
        : filteredDocs;

    if(docsToExport.length === 0) {
        setIsExporting(false);
        return;
    }
    try {
        if (format === 'csv') {
            exportToCSV(docsToExport);
        } else if (format === 'pdf') {
            await exportToPDF(docsToExport);
        } else {
            exportToXLS(docsToExport);
        }
    } catch (error) {
        console.error(`Error exporting to ${format}:`, error);
    } finally {
        setIsExporting(false);
    }
  };
  
  const selectedDocInfo = selectedDocIndex !== null ? filteredDocs[selectedDocIndex] : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 modal-backdrop-animation" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-6 w-full max-w-[95vw] lg:max-w-6xl h-full max-h-[95vh] flex flex-col modal-content-animation text-[var(--text-primary)] relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3 mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
            <ArchiveIcon />
            لیست اسناد حسابداری تولید شده
          </h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-3xl font-light">&times;</button>
        </div>
        
        {/* Filters */}
        <div className="flex gap-4 mb-4 flex-shrink-0">
            <div className="flex-1">
                <label htmlFor="warehouseFilter" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">فیلتر بر اساس انبار</label>
                <select 
                    id="warehouseFilter"
                    value={filters.warehouse} 
                    onChange={e => handleFilterChange('warehouse', e.target.value)}
                    className="w-full p-2.5 rounded-md text-sm"
                >
                    <option value="">همه انبارها</option>
                    {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                </select>
            </div>
             <div className="flex-1">
                <label htmlFor="dateFilter" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">فیلتر بر اساس تاریخ</label>
                <input 
                    type="text" 
                    id="dateFilter"
                    placeholder="مثال: 1403/05"
                    value={filters.date} 
                    onChange={e => handleFilterChange('date', e.target.value)}
                    className="w-full p-2.5 rounded-md text-sm"
                />
            </div>
        </div>

        <div className="flex flex-col flex-grow overflow-hidden gap-4">
            {/* Master View: List of Document Headers */}
            <div className="overflow-auto flex-grow border border-[var(--border-color)] rounded-lg">
                <table className="w-full text-sm text-right animated-table">
                    <thead className="sticky top-0 bg-[var(--background-tertiary)] text-[var(--text-secondary)] z-10">
                    <tr>
                        <th className="p-3 font-semibold border-b border-[var(--border-color)] w-12">
                           <input type="checkbox" className="rounded" onChange={handleSelectAllChange} checked={filteredDocs.length > 0 && selectedDocIds.size === filteredDocs.length} />
                        </th>
                        <th className="p-3 font-semibold border-b border-[var(--border-color)]"><button onClick={() => requestSort('date')} className="flex items-center gap-1">تاریخ سند <SortIcon direction={sortConfig?.key === 'date' ? sortConfig.direction : undefined} /></button></th>
                        <th className="p-3 font-semibold border-b border-[var(--border-color)] w-2/5"><button onClick={() => requestSort('description')} className="flex items-center gap-1">شرح کلی <SortIcon direction={sortConfig?.key === 'description' ? sortConfig.direction : undefined} /></button></th>
                        <th className="p-3 font-semibold border-b border-[var(--border-color)]"><button onClick={() => requestSort('totalDebit')} className="flex items-center gap-1">مبلغ کل <SortIcon direction={sortConfig?.key === 'totalDebit' ? sortConfig.direction : undefined} /></button></th>
                        <th className="p-3 font-semibold border-b border-[var(--border-color)]">انبارهای مبدا</th>
                        <th className="p-3 font-semibold border-b border-[var(--border-color)]"><button onClick={() => requestSort('approvalStatus')} className="flex items-center gap-1">وضعیت <SortIcon direction={sortConfig?.key === 'approvalStatus' ? sortConfig.direction : undefined} /></button></th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredDocs.map((docInfo, index) => {
                        const statusInfo = getApprovalStatusInfo(docInfo.approvalStatus);
                        return (
                        <tr 
                            key={docInfo.id} 
                            onClick={() => setSelectedDocIndex(index)}
                            className={`cursor-pointer ${selectedDocIndex === index ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}
                        >
                            <td className="p-3"><input type="checkbox" className="rounded" checked={selectedDocIds.has(docInfo.id)} onChange={e => handleCheckboxChange(docInfo.id, e.target.checked)} onClick={e => e.stopPropagation()} /></td>
                            <td className="p-3 font-mono">{docInfo.entry.date}</td>
                            <td className="p-3">{docInfo.entry.description}</td>
                            <td className="p-3 font-mono text-[var(--color-success)]">{docInfo.entry.totalDebit.toLocaleString('fa-IR')}</td>
                            <td className="p-3">
                                <div className="flex flex-wrap gap-1">
                                    {docInfo.sourceWarehouseNames.map(name => (
                                        <span key={name} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="p-3">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                                    {statusInfo.label}
                                </span>
                            </td>
                        </tr>
                    )})}
                    </tbody>
                </table>
                 {filteredDocs.length === 0 && (
                    <div className="text-center p-10 text-[var(--text-muted)]">
                    <p>هیچ سند تولید شده‌ای با این فیلترها یافت نشد.</p>
                    {docs.length === 0 && <p className="mt-2 text-sm">هنوز هیچ سندی توسط هوش مصنوعی تولید نشده است.</p>}
                    </div>
                )}
            </div>

            {/* Detail View: Document Lines */}
            {selectedDocInfo && (
                <div className="border border-[var(--border-color)] rounded-lg p-4 animate-fade-in flex-shrink-0 bg-[var(--background-tertiary)]">
                     <h4 className="font-bold text-md text-[var(--text-primary)] mb-3 pb-3 border-b border-[var(--border-color)]">
                        جزئیات سند: <span className="font-normal text-[var(--text-secondary)]">{selectedDocInfo.entry.description}</span> - تاریخ: <span className="font-normal text-[var(--text-secondary)] font-mono">{selectedDocInfo.entry.date}</span>
                    </h4>
                    <div className="overflow-auto max-h-60">
                        <table className="w-full text-sm text-right">
                             <thead className="border-b-2 border-[var(--border-color-strong)] text-[var(--text-secondary)] sticky top-0 bg-[var(--background-tertiary)]">
                                <tr>
                                    <th className="p-2 w-1/3 font-semibold">شرح حساب</th>
                                    <th className="p-2 w-1/6 font-semibold">مرکز هزینه</th>
                                    <th className="p-2 w-1/6 font-semibold">بدهکار (ریال)</th>
                                    <th className="p-2 w-1/6 font-semibold">بستانکار (ریال)</th>
                                    <th className="p-2 w-1/6 font-semibold">توضیحات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)] bg-[var(--background-secondary)]">
                                {selectedDocInfo.entry.lines.map((line, lineIndex) => {
                                    const costCenter = [line.costCenter1, line.costCenter2, line.costCenter3].filter(Boolean).join(' - ');
                                    return (
                                        <tr key={lineIndex}>
                                        <td className="p-2 font-medium">
                                            {line.accountName}
                                            <span className="block text-xs text-[var(--text-muted)] font-mono">{line.accountCode}</span>
                                        </td>
                                        <td className="p-2 text-[var(--text-secondary)] font-mono text-xs">{costCenter || '-'}</td>
                                        <td className="p-2 text-[var(--text-primary)] font-mono">{line.debit > 0 ? line.debit.toLocaleString('fa-IR') : '-'}</td>
                                        <td className="p-2 text-[var(--text-primary)] font-mono">{line.credit > 0 ? line.credit.toLocaleString('fa-IR') : '-'}</td>
                                        <td className="p-2 text-xs text-[var(--text-muted)]">{line.description}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                             <tfoot className="font-bold bg-[var(--background-tertiary)] text-[var(--text-primary)]">
                                <tr>
                                    <td className="p-2" colSpan={2}>جمع کل</td>
                                    <td className="p-2 text-[var(--color-success)] font-mono">{selectedDocInfo.entry.totalDebit.toLocaleString('fa-IR')}</td>
                                    <td className="p-2 text-[var(--color-success)] font-mono">{selectedDocInfo.entry.totalCredit.toLocaleString('fa-IR')}</td>
                                    <td className="p-2">
                                        <div className="flex items-center justify-end gap-2">
                                            {selectedDocInfo.approvalStatus === ApprovalStatus.Draft && canEdit && (
                                                <>
                                                 <button onClick={() => setDocToConfirmDelete(selectedDocInfo)} className="btn btn-secondary btn-sm text-xs !text-red-600 border-red-500 hover:bg-red-500/10">
                                                     <TrashIcon /> حذف
                                                 </button>
                                                 <button onClick={() => onEdit(selectedDocInfo)} className="btn btn-secondary btn-sm text-xs">
                                                     <PencilIcon /> اصلاح
                                                 </button>
                                                  {canApprove && (
                                                      <button onClick={() => setDocToConfirmApprove(selectedDocInfo)} className="btn btn-primary btn-sm text-xs bg-green-600 hover:bg-green-700">
                                                          <CheckBadgeIcon /> تصویب نهایی
                                                      </button>
                                                  )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between items-center flex-shrink-0">
          <div className="flex gap-2">
             <button onClick={() => handleExport('csv')} className="btn btn-secondary text-sm" disabled={(selectedDocIds.size === 0 && filteredDocs.length === 0) || isExporting}>
                {isExporting ? <Spinner /> : <FileTextIcon />}
                CSV
             </button>
             <button onClick={() => handleExport('xls')} className="btn btn-secondary text-sm" disabled={(selectedDocIds.size === 0 && filteredDocs.length === 0) || isExporting}>
                {isExporting ? <Spinner /> : <FileXlsxIcon />}
                XLS
             </button>
             <button onClick={() => handleExport('pdf')} className="btn btn-secondary text-sm" disabled={(selectedDocIds.size === 0 && filteredDocs.length === 0) || isExporting}>
                {isExporting ? <Spinner /> : <FilePdfIcon />}
                PDF
             </button>
            {canApprove && (
                <button
                    onClick={() => setShowConfirmApproveAll(true)}
                    className="btn btn-secondary text-sm text-green-600 border-green-500 hover:bg-green-500/10"
                    disabled={draftDocsToApprove.length === 0}
                >
                    <CheckBadgeIcon />
                    تصویب همه
                </button>
            )}
            {canEdit && (
              <button
                onClick={() => setShowConfirmDeleteAll(true)}
                className="btn btn-secondary text-sm text-red-600 border-red-500 hover:bg-red-500/10"
                disabled={draftDocsToDelete.length === 0}
              >
                  <TrashIcon />
                  حذف منتخب
              </button>
            )}
          </div>
          <button onClick={onClose} className="btn btn-secondary">بستن</button>
        </div>
        
        {/* Confirmation Modals */}
        {(docToConfirmApprove || docToConfirmDelete || showConfirmApproveAll || showConfirmDeleteAll) && (
            <div className="absolute inset-0 bg-black bg-opacity-40 z-20 flex justify-center items-center rounded-xl">
                {docToConfirmApprove && (
                    <div className="bg-[var(--background-secondary)] p-6 rounded-lg shadow-xl animate-fade-in w-full max-w-md">
                        <h3 className="font-bold text-lg text-center">تایید تصویب نهایی</h3>
                        <p className="py-4 text-center">آیا میخواهید سند مورخ <strong className="font-mono">{docToConfirmApprove.entry.date}</strong> با شرح <strong className="truncate max-w-xs inline-block">"{docToConfirmApprove.entry.description}"</strong> را تایید نهایی کنید؟</p>
                        <div className="flex justify-center gap-4 mt-4">
                            <button onClick={() => setDocToConfirmApprove(null)} className="btn btn-secondary w-24">خیر</button>
                            <button onClick={() => {
                                onApprove(docToConfirmApprove.id);
                                setDocToConfirmApprove(null);
                            }} className="btn btn-primary bg-green-600 hover:bg-green-700 w-24">بله</button>
                        </div>
                    </div>
                )}
                 {docToConfirmDelete && (
                    <div className="bg-[var(--background-secondary)] p-6 rounded-lg shadow-xl animate-fade-in w-full max-w-md">
                        <h3 className="font-bold text-lg text-center text-red-600">تایید حذف سند</h3>
                        <p className="py-4 text-center">آیا از حذف این سند حسابداری اطمینان دارید؟ این عمل قابل بازگشت نیست.</p>
                        <div className="flex justify-center gap-4 mt-4">
                            <button onClick={() => setDocToConfirmDelete(null)} className="btn btn-secondary w-24">خیر</button>
                            <button onClick={() => {
                                onDelete(docToConfirmDelete.id);
                                setDocToConfirmDelete(null);
                            }} className="btn btn-primary bg-red-600 hover:bg-red-700 w-24">بله، حذف کن</button>
                        </div>
                    </div>
                )}
                 {showConfirmApproveAll && (
                    <div className="bg-[var(--background-secondary)] p-6 rounded-lg shadow-xl animate-fade-in w-full max-w-md">
                        <h3 className="font-bold text-lg text-center">تایید تصویب گروهی</h3>
                        <p className="py-4 text-center">آیا از تصویب نهایی <strong className="font-mono">{draftDocsToApprove.length}</strong> سند پیش‌نویس اطمینان دارید؟</p>
                        <div className="flex justify-center gap-4 mt-4">
                            <button onClick={() => setShowConfirmApproveAll(false)} className="btn btn-secondary w-24">خیر</button>
                            <button onClick={() => {
                                onApproveAll(draftDocsToApprove.map(d => d.id));
                                setShowConfirmApproveAll(false);
                            }} className="btn btn-primary bg-green-600 hover:bg-green-700 w-24">بله</button>
                        </div>
                    </div>
                )}
                 {showConfirmDeleteAll && (
                    <div className="bg-[var(--background-secondary)] p-6 rounded-lg shadow-xl animate-fade-in w-full max-w-md">
                        <h3 className="font-bold text-lg text-center text-red-600">تایید حذف گروهی</h3>
                        <p className="py-4 text-center">آیا از حذف <strong className="font-mono">{draftDocsToDelete.length}</strong> سند پیش‌نویس انتخاب شده اطمینان دارید؟</p>
                        <div className="flex justify-center gap-4 mt-4">
                            <button onClick={() => setShowConfirmDeleteAll(false)} className="btn btn-secondary w-24">خیر</button>
                            <button onClick={() => {
                                onDeleteAll(draftDocsToDelete);
                                setSelectedDocIds(new Set());
                                setShowConfirmDeleteAll(false);
                            }} className="btn btn-primary bg-red-600 hover:bg-red-700 w-24">بله، حذف کن</button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedDocsModal;