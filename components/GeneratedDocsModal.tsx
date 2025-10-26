import React, { useState, useMemo } from 'react';
import { GeneratedDocInfo, Warehouse } from '../types';
import { ArchiveIcon } from './icons/ArchiveIcon';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';
import { FileTextIcon } from './icons/FileTextIcon';
import { FilePdfIcon } from './icons/FilePdfIcon';
import Spinner from './Spinner';

interface Props {
  docs: GeneratedDocInfo[];
  warehouses: Warehouse[];
  onClose: () => void;
}

const GeneratedDocsModal: React.FC<Props> = ({ docs, warehouses, onClose }) => {
  const [filters, setFilters] = useState({ warehouse: '', date: '' });
  const [isExporting, setIsExporting] = useState(false);

  const handleFilterChange = (key: 'warehouse' | 'date', value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredDocs = useMemo(() => {
    return docs.filter(docInfo => {
      const dateMatch = filters.date ? docInfo.entry.date.includes(filters.date) : true;
      const warehouseMatch = filters.warehouse ? docInfo.sourceWarehouseNames.includes(filters.warehouse) : true;
      return dateMatch && warehouseMatch;
    }).sort((a, b) => b.entry.date.localeCompare(a.entry.date)); // Sort by date descending
  }, [docs, filters]);
  
  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
        if (format === 'csv') {
            exportToCSV(filteredDocs);
        } else {
            await exportToPDF(filteredDocs);
        }
    } catch (error) {
        console.error(`Error exporting to ${format}:`, error);
        // You could show an error toast to the user here
    } finally {
        setIsExporting(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 modal-backdrop-animation" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-6 w-full max-w-[95vw] lg:max-w-6xl h-full max-h-[95vh] flex flex-col modal-content-animation text-[var(--text-primary)]" onClick={e => e.stopPropagation()}>
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

        <div className="overflow-auto flex-grow">
          <table className="w-full text-sm text-right border-collapse animated-table">
            <thead className="sticky top-0 bg-[var(--background-tertiary)] text-[var(--text-secondary)] z-20">
              <tr>
                <th className="p-3 font-semibold border-b border-[var(--border-color)]">تاریخ سند</th>
                <th className="p-3 font-semibold border-b border-[var(--border-color)] w-2/5">شرح کلی</th>
                <th className="p-3 font-semibold border-b border-[var(--border-color)]">مبلغ کل</th>
                <th className="p-3 font-semibold border-b border-[var(--border-color)]">انبارهای مبدا</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredDocs.map((docInfo, index) => (
                <tr key={index} >
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
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDocs.length === 0 && (
            <div className="text-center p-10 text-[var(--text-muted)]">
              <p>هیچ سند تولید شده‌ای با این فیلترها یافت نشد.</p>
              {docs.length === 0 && <p className="mt-2 text-sm">هنوز هیچ سندی توسط هوش مصنوعی تولید نشده است.</p>}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between items-center flex-shrink-0">
          <div className="flex gap-2">
             <button onClick={() => handleExport('csv')} className="btn btn-secondary text-sm" disabled={filteredDocs.length === 0 || isExporting}>
                {isExporting ? <Spinner /> : <FileTextIcon />}
                خروجی CSV
             </button>
             <button onClick={() => handleExport('pdf')} className="btn btn-secondary text-sm" disabled={filteredDocs.length === 0 || isExporting}>
                {isExporting ? <Spinner /> : <FilePdfIcon />}
                خروجی PDF
             </button>
          </div>
          <button onClick={onClose} className="btn btn-secondary">بستن</button>
        </div>
      </div>
    </div>
  );
};

export default GeneratedDocsModal;