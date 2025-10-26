import React from 'react';
import { Warehouse, DocumentType } from '../types';

interface Props {
  warehouses: Warehouse[];
  selectedWarehouseId: string;
  onWarehouseChange: (id: string) => void;
  selectedDocType: DocumentType | 'all';
  onDocTypeChange: (type: DocumentType | 'all') => void;
  dateRange: { from: string, to: string };
  onDateRangeChange: (range: { from: string, to: string }) => void;
}

const FilterControls: React.FC<Props> = ({
  warehouses,
  selectedWarehouseId,
  onWarehouseChange,
  selectedDocType,
  onDocTypeChange,
  dateRange,
  onDateRangeChange,
}) => {
  return (
    <div className="space-y-4 p-2">
      <div>
        <label htmlFor="warehouse" className="block text-sm font-medium text-gray-700 mb-1">
          انبار
        </label>
        <select
          id="warehouse"
          value={selectedWarehouseId}
          onChange={(e) => onWarehouseChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
        >
          <option value="all">همه انبارها</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="docType" className="block text-sm font-medium text-gray-700 mb-1">
          نوع سند
        </label>
        <select
          id="docType"
          value={selectedDocType}
          onChange={(e) => onDocTypeChange(e.target.value as DocumentType | 'all')}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
        >
          <option value="all">همه انواع</option>
          <option value={DocumentType.Receipt}>رسید انبار</option>
          <option value={DocumentType.Dispatch}>حواله انبار</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
            <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
                از تاریخ
            </label>
            <input
                type="text"
                id="fromDate"
                placeholder="مثال: 1403/01/01"
                value={dateRange.from}
                onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
            />
        </div>
        <div>
            <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
                تا تاریخ
            </label>
            <input
                type="text"
                id="toDate"
                placeholder="مثال: 1403/12/29"
                value={dateRange.to}
                onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
            />
        </div>
      </div>
    </div>
  );
};

export default FilterControls;