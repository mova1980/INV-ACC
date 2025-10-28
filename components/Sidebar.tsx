

import React, { useState } from 'react';
import { DocTypeInfo, User, UserRole } from '../types';
import { TemplateIcon } from './icons/TemplateIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { ArchiveIcon } from './icons/ArchiveIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { SettlePartialIcon } from './icons/SettlePartialIcon';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';
import { LogIcon } from './icons/LogIcon';
import Clock from './Clock';
import { WarehouseIcon } from './icons/WarehouseIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { CubeIcon } from './icons/CubeIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { UsersIcon } from './icons/UsersIcon';


interface Props {
  currentUser: User;
  onLogout: () => void;
  onShowTemplateEditor: () => void;
  onShowDbSettings: () => void;
  onShowGeneratedDocs: () => void;
  onShowBatchConversion: () => void;
  onShowSettlePartialDocs: () => void;
  onShowWarehouseSelector: () => void;
  onShowWarehouseInfo: () => void;
  onShowAllDocs: () => void;
  onShowLogs: () => void;
  onShowFinancialReports: () => void;
  onShowInventoryReports: () => void;
  onShowUserManagement: () => void;
  warehouseSelectionTitle: string;
  docTypeInfos: DocTypeInfo[];
  filters: { docType: string, year: string };
  onFilterChange: (key: 'docType' | 'year', value: string) => void;
  isSearching: boolean;
  availableYears: string[];
}

const Sidebar: React.FC<Props> = ({
  currentUser,
  onLogout,
  onShowTemplateEditor,
  onShowDbSettings,
  onShowGeneratedDocs,
  onShowBatchConversion,
  onShowSettlePartialDocs,
  onShowWarehouseSelector,
  onShowWarehouseInfo,
  onShowAllDocs,
  onShowLogs,
  onShowFinancialReports,
  onShowInventoryReports,
  onShowUserManagement,
  warehouseSelectionTitle,
  docTypeInfos,
  filters,
  onFilterChange,
  isSearching,
  availableYears,
}) => {
  const [reportsOpen, setReportsOpen] = useState(false);
  const canAccessAdvancedFeatures = currentUser.role === UserRole.Admin || currentUser.role === UserRole.FinancialManager;
  const canAccessAccountingFeatures = canAccessAdvancedFeatures || currentUser.role === UserRole.Accountant;
  
  return (
    <aside className="w-80 bg-[var(--background-secondary)] border-r border-[var(--border-color)] p-4 flex flex-col gap-4">
      <div className="flex-shrink-0 flex justify-center py-2 border-b border-[var(--border-color)]">
        <Clock size={70} />
      </div>
      <div className="flex-grow flex flex-col gap-4 overflow-y-auto">
        {/* Main Operations Section */}
        <div className="bg-[var(--sidebar-section-1-bg)] p-3 rounded-xl border border-[var(--border-color)] transition-colors duration-300">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] px-2 mb-3">عملیات اصلی</h3>
          <div className="space-y-3">
            <div className={isSearching || currentUser.role === UserRole.Storekeeper ? 'opacity-50' : ''}>
              <label className="text-xs text-[var(--text-muted)] mb-1 block px-2">انتخاب انبار</label>
              <button
                onClick={onShowWarehouseSelector}
                className="btn btn-sidebar-main w-full justify-between"
                disabled={isSearching || currentUser.role === UserRole.Storekeeper}
                title={isSearching ? "فیلتر انبار در حین جستجو غیرفعال است" : currentUser.role === UserRole.Storekeeper ? "دسترسی شما به انبار خودتان محدود است" : ""}
              >
                <span className="truncate">{warehouseSelectionTitle}</span>
                <ChevronDownIcon />
              </button>
            </div>
            
            <div>
                <label htmlFor="yearFilter" className="text-xs text-[var(--text-muted)] mb-1 block">سال انبار</label>
                <select
                    id="yearFilter"
                    value={filters.year}
                    onChange={(e) => onFilterChange('year', e.target.value)}
                    className="w-full p-2.5 rounded-md text-sm"
                >
                    <option value="">همه سال‌ها</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
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

            <button id="all-docs-btn" onClick={onShowAllDocs} className="btn btn-sidebar-main w-full">
                <ListBulletIcon />
                <span>لیست اسناد انبار</span>
            </button>
            {canAccessAccountingFeatures && (
                <>
                <button id="archive-btn" onClick={onShowGeneratedDocs} className="btn btn-sidebar-main w-full">
                    <ArchiveIcon />
                    <span>مشاهده اسناد تولید شده</span>
                </button>

                <button id="settle-partial-btn" onClick={onShowSettlePartialDocs} className="btn btn-sidebar-main w-full">
                    <SettlePartialIcon />
                    <span>تسویه اسناد ناقص</span>
                </button>
                
                <button id="batch-convert-btn" onClick={onShowBatchConversion} className="btn btn-sidebar-main w-full">
                    <DocumentDuplicateIcon />
                    <span>صدور سند گروهی</span>
                </button>
                </>
            )}

            {canAccessAdvancedFeatures && (
              <div>
                <button onClick={() => setReportsOpen(!reportsOpen)} className="btn btn-sidebar-main w-full justify-between">
                  <div className="flex items-center gap-2">
                    <ChartBarIcon />
                    <span>گزارشات پیشرفته</span>
                  </div>
                  <ChevronDownIcon />
                </button>
                {reportsOpen && (
                  <div className="mt-2 space-y-2 pl-4 animate-fade-in">
                    <button onClick={onShowFinancialReports} className="btn btn-secondary w-full text-sm">
                      <CurrencyDollarIcon />
                      <span>گزارشات مالی</span>
                    </button>
                    <button onClick={onShowInventoryReports} className="btn btn-secondary w-full text-sm">
                      <CubeIcon />
                      <span>گزارشات انبار</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Base Information Section */}
        <div className="bg-[var(--sidebar-section-2-bg)] p-3 rounded-xl border border-[var(--border-color)] transition-colors duration-300">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] px-2 mb-3">اطلاعات پایه</h3>
          <div className="space-y-3">
            {currentUser.role === UserRole.Admin && (
              <>
                <button id="template-btn" onClick={onShowTemplateEditor} className="btn btn-sidebar-base w-full">
                    <TemplateIcon />
                    <span>ویرایش شابلون‌ها</span>
                </button>
                <button id="db-settings-btn" onClick={onShowDbSettings} className="btn btn-sidebar-base w-full">
                    <DatabaseIcon />
                    <span>تنظیمات دیتابیس</span>
                </button>
                 <button id="user-management-btn" onClick={onShowUserManagement} className="btn btn-sidebar-base w-full">
                    <UsersIcon />
                    <span>مدیریت کاربران</span>
                </button>
              </>
            )}
            
            <button id="warehouse-info-btn" onClick={onShowWarehouseInfo} className="btn btn-sidebar-base w-full">
                <WarehouseIcon />
                <span>اطلاعات انبارها</span>
            </button>
            
            <button id="logs-btn" onClick={onShowLogs} className="btn btn-sidebar-base w-full">
                <LogIcon />
                <span>مشاهده لاگ‌ها</span>
            </button>
          </div>
        </div>
      </div>
      {/* User Info and Logout */}
      <div className="flex-shrink-0 mt-auto pt-4 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                  <UserCircleIcon />
              </div>
              <div className="flex-grow">
                  <p className="font-bold text-sm text-[var(--text-primary)]">{currentUser.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{currentUser.role}</p>
              </div>
              <button onClick={onLogout} title="خروج از سیستم" className="p-2 text-[var(--text-secondary)] hover:text-[var(--color-danger)] transition-colors rounded-full hover:bg-red-500/10">
                  <LogoutIcon />
              </button>
          </div>
      </div>
    </aside>
  );
};

export default Sidebar;