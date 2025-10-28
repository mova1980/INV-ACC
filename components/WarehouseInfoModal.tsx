import React, { useState } from 'react';
import { Warehouse } from '../types';
import { useSortableData } from '../hooks/useSortableData';
import { SortIcon } from './shared/SortIcon';
import Spinner from './Spinner';
import { WarehouseIcon } from './icons/WarehouseIcon';
import { exportWarehousesToCSV, exportWarehousesToPDF, exportWarehousesToXLS } from '../utils/exportUtils';
import { FileTextIcon } from './icons/FileTextIcon';
import { FilePdfIcon } from './icons/FilePdfIcon';
import { FileXlsxIcon } from './icons/FileXlsxIcon';
import { useEscapeKey } from '../hooks/useEscapeKey';


interface Props {
  isOpen: boolean;
  onClose: () => void;
  warehouses: Warehouse[];
}

const WarehouseInfoModal: React.FC<Props> = ({ isOpen, onClose, warehouses }) => {
  useEscapeKey(onClose);
  const [isExporting, setIsExporting] = useState(false);
  const { items: sortedWarehouses, requestSort, sortConfig } = useSortableData<Warehouse>(warehouses, { key: 'id', direction: 'ascending' });

  const handleExport = async (format: 'csv' | 'pdf' | 'xls') => {
    setIsExporting(true);
    try {
        if (format === 'csv') {
            exportWarehousesToCSV(sortedWarehouses);
        } else if (format === 'pdf') {
            await exportWarehousesToPDF(sortedWarehouses);
        } else {
            exportWarehousesToXLS(sortedWarehouses);
        }
    } catch (error) {
        console.error(`Error exporting to ${format}:`, error);
    } finally {
        setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  const headers: { key: keyof Warehouse, label: string, className?: string }[] = [
      { key: 'id', label: 'کد انبار' },
      { key: 'name', label: 'شرح انبار', className: 'w-1/4' },
      { key: 'workshop', label: 'کارگاه مرتبط' },
      { key: 'manager', label: 'مسئول انبار' },
      { key: 'location', label: 'آدرس و محل انبار', className: 'w-1/4' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 modal-backdrop-animation" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-6 w-full max-w-7xl h-full max-h-[95vh] flex flex-col modal-content-animation text-[var(--text-primary)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3 mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
            <WarehouseIcon />
            اطلاعات انبارها
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
                {sortedWarehouses.map(wh => (
                    <tr key={wh.id} className="hover:bg-[var(--background-tertiary)]">
                       <td className="p-2 font-mono">{wh.id}</td>
                       <td className="p-2">{wh.name}</td>
                       <td className="p-2">{wh.workshop}</td>
                       <td className="p-2">{wh.manager}</td>
                       <td className="p-2">{wh.location}</td>
                    </tr>
                ))}
              </tbody>
           </table>
           {warehouses.length === 0 && <p className="text-center p-6 text-[var(--text-muted)]">انباری برای نمایش وجود ندارد.</p>}
        </div>
        
        <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between items-center flex-shrink-0">
          <div className="flex gap-2">
             <button onClick={() => handleExport('csv')} className="btn btn-secondary text-sm" disabled={warehouses.length === 0 || isExporting}>
                {isExporting ? <Spinner /> : <FileTextIcon />}
                CSV
             </button>
             <button onClick={() => handleExport('xls')} className="btn btn-secondary text-sm" disabled={warehouses.length === 0 || isExporting}>
                {isExporting ? <Spinner /> : <FileXlsxIcon />}
                XLS
             </button>
             <button onClick={() => handleExport('pdf')} className="btn btn-secondary text-sm" disabled={warehouses.length === 0 || isExporting}>
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

export default WarehouseInfoModal;
