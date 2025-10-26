import React from 'react';
import { Warehouse, DocTypeInfo } from '../types';
import Spinner from './Spinner';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { TemplateIcon } from './icons/TemplateIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { ArchiveIcon } from './icons/ArchiveIcon';
import { WarehouseIcon } from './icons/WarehouseIcon';
import { FilterIcon } from './icons/FilterIcon';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ListBulletIcon } from './icons/ListBulletIcon';


interface Props {
  onConvertToAccounting: () => void;
  onShowTemplateEditor: () => void;
  onShowDbSettings: () => void;
  onShowGeneratedDocs: () => void;
  onShowBatchConversion: () => void;
  onShowWarehouseSelector: () => void;
  onShowAllDocs: () => void;
  isConvertDisabled: boolean;
  isLoading: boolean;
  warehouseSelectionTitle: string;
  docTypeInfos: DocTypeInfo[];
  filters: { docType: string, year: string };
  onFilterChange: (key: 'docType' | 'year', value: string) => void;
}

const Sidebar: React.FC<Props> = ({
  onConvertToAccounting,
  onShowTemplateEditor,
  onShowDbSettings,
  onShowGeneratedDocs,
  onShowBatchConversion,
  onShowWarehouseSelector,
  onShowAllDocs,
  isConvertDisabled,
  isLoading,
  warehouseSelectionTitle,
  docTypeInfos,
  filters,
  onFilterChange,
}) => {

  return (
    <aside className="w-80 bg-[var(--background-secondary)] border-r border-[var(--border-color)] p-4 flex flex-col gap-6 flex-shrink-0">
      
      {/* Action Buttons */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] px-2">عملیات اصلی</h3>
        <button
          id="convert-btn"
          onClick={onConvertToAccounting}
          disabled={isConvertDisabled || isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? <Spinner /> : <MagicWandIcon />}
          <span>تبدیل به سند حسابداری</span>
        </button>
         <button id="batch-convert-btn" onClick={onShowBatchConversion} className="btn btn-secondary w-full">
            <DocumentDuplicateIcon />
            <span>صدور سند گروهی</span>
        </button>
         <button id="all-docs-btn" onClick={onShowAllDocs} className="btn btn-secondary w-full">
            <ListBulletIcon />
            <span>لیست اسناد انبار</span>
        </button>
        <button id="template-btn" onClick={onShowTemplateEditor} className="btn btn-secondary w-full">
            <TemplateIcon />
            <span>ویرایش شابلون‌ها</span>
        </button>
        <button id="db-settings-btn" onClick={onShowDbSettings} className="btn btn-secondary w-full">
            <DatabaseIcon />
            <span>تنظیمات دیتابیس</span>
        </button>
         <button id="archive-btn" onClick={onShowGeneratedDocs} className="btn btn-secondary w-full">
            <ArchiveIcon />
            <span>مشاهده اسناد تولید شده</span>
        </button>
      </div>

      <div className="flex-grow flex flex-col gap-6 overflow-y-auto">
        {/* Warehouse Selection */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] px-2 flex items-center gap-2">
            <WarehouseIcon />
            انتخاب انبار
          </h3>
          <button
            onClick={onShowWarehouseSelector}
            className="btn btn-secondary w-full justify-between"
          >
            <span className="truncate">{warehouseSelectionTitle}</span>
            <ChevronLeftIcon />
          </button>
        </div>
        
        {/* Filters */}
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] px-2 flex items-center gap-2">
                <FilterIcon />
                فیلترها
            </h3>
            <div>
                <label htmlFor="yearFilter" className="text-xs text-[var(--text-muted)] mb-1 block">سال</label>
                <select
                    id="yearFilter"
                    value={filters.year}
                    onChange={(e) => onFilterChange('year', e.target.value)}
                    className="w-full p-2.5 rounded-md text-sm"
                >
                    <option value="1403">1403</option>
                    <option value="1402">1402</option>
                    <option value="1404">1404</option>
                    <option value="">همه سال‌ها</option>
                </select>
            </div>
             <div>
                <label htmlFor="docTypeFilter" className="text-xs text-[var(--text-muted)] mb-1 block">نوع سند</label>
                <select
                    id="docTypeFilter"
                    value={filters.docType}
                    onChange={(e) => onFilterChange('docType', e.target.value)}
                    className="w-full p-2.5 rounded-md text-sm"
                >
                    <option value="">همه انواع</option>
                    {docTypeInfos.map(dt => (
                        <option key={dt.id} value={dt.id.toString()}>{dt.name}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
