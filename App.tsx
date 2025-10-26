import React, { useState, useMemo, useCallback } from 'react';
import { InventoryDocument, JournalEntry, DocumentType, AccountingRule, Warehouse, DatabaseSettings } from './types';
import { allDocuments, warehouses, accountingRules as initialRules, mockAccounts, mockCostCenters } from './data/mockData';
import { generateAccountingDocument } from './services/accountingService';
import Header from './components/Header';
import InventoryDocList from './components/InventoryDocList';
import InventoryDocDetail from './components/InventoryDocDetail';
import AccountingDocView from './components/AccountingDocView';
import Spinner from './components/Spinner';
import FilterControls from './components/FilterControls';
import TemplateModal from './components/TemplateModal';
import DatabaseSettingsModal from './components/DatabaseSettingsModal';
import { MagicWandIcon } from './components/icons/MagicWandIcon';
import { TemplateIcon } from './components/icons/TemplateIcon';
import { DatabaseIcon } from './components/icons/DatabaseIcon';


const App: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<InventoryDocument | null>(null);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [journalEntry, setJournalEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all');
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | 'all'>('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [isDbSettingsModalOpen, setDbSettingsModalOpen] = useState(false);
  const [accountingRules, setAccountingRules] = useState<AccountingRule[]>(initialRules);
  const [dbSettings, setDbSettings] = useState<DatabaseSettings>({
    source: { server: 'SRV_INVENTORY', database: 'InventoryDB', headerTable: 'InvDocs', detailTable: 'InvDocItems' },
    destination: { server: 'SRV_FINANCE', database: 'AccountingDB', headerTable: 'AccDocs', detailTable: 'AccDocItems' }
  });

  const handleSaveDbSettings = (newSettings: DatabaseSettings) => {
    setDbSettings(newSettings);
    console.log("Database settings saved:", newSettings);
  };
  
  const handleSaveRules = (newRules: AccountingRule[]) => {
    setAccountingRules(newRules);
    console.log("Accounting rules updated:", newRules);
  };

  const filteredDocuments = useMemo(() => {
    return allDocuments.filter(doc => {
      const warehouseMatch = selectedWarehouseId === 'all' || doc.warehouseId === selectedWarehouseId;
      const docTypeMatch = selectedDocType === 'all' || doc.type === selectedDocType;
      const dateFromMatch = !dateRange.from || doc.date >= dateRange.from;
      const dateToMatch = !dateRange.to || doc.date <= dateRange.to;
      return warehouseMatch && docTypeMatch && dateFromMatch && dateToMatch;
    });
  }, [selectedWarehouseId, selectedDocType, dateRange]);

  const handleSelectDocForView = (doc: InventoryDocument) => {
    setActiveDoc(doc);
    setJournalEntry(null);
    setError(null);
  };
  
  const handleSelectionChange = (docId: string) => {
    setSelectedDocIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
        setSelectedDocIds(new Set(filteredDocuments.map(d => d.id)));
    } else {
        setSelectedDocIds(new Set());
    }
  };

  const performConversion = useCallback(async (docsToConvert: InventoryDocument[]) => {
    if (docsToConvert.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    setJournalEntry(null);
    setActiveDoc(null);

    try {
      const entry = await generateAccountingDocument(docsToConvert, accountingRules, warehouses);
      setJournalEntry(entry);
    } catch (err) {
      setError('خطا در تولید سند حسابداری. لطفاً دوباره تلاش کنید.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [accountingRules]);

  const handleConvertSingle = () => {
    if (activeDoc) {
      performConversion([activeDoc]);
    }
  };
  
  const handleConvertBulk = () => {
    const docsToConvert = allDocuments.filter(doc => selectedDocIds.has(doc.id));
    performConversion(docsToConvert);
  };

  const selectedDocsForBulk = allDocuments.filter(doc => selectedDocIds.has(doc.id));
  const totalBulkAmount = selectedDocsForBulk.reduce((sum, doc) => 
    sum + doc.items.reduce((itemSum, item) => itemSum + item.quantity * item.unitPrice, 0), 0);


  return (
    <div className="bg-[var(--color-background)] min-h-screen text-[var(--color-text-primary)]">
      <Header />
      <main className="flex flex-col md:flex-row max-w-8xl mx-auto p-4 gap-6">
        <aside className="w-full md:w-2/5 lg:w-1/3 flex-shrink-0 bg-white rounded-xl shadow-lg p-4 flex flex-col">
          <FilterControls
            warehouses={warehouses}
            selectedWarehouseId={selectedWarehouseId}
            onWarehouseChange={setSelectedWarehouseId}
            selectedDocType={selectedDocType}
            onDocTypeChange={setSelectedDocType}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <div className="border-t my-4"></div>
          <InventoryDocList
            documents={filteredDocuments}
            selectedDocIds={selectedDocIds}
            activeDocId={activeDoc?.id}
            onSelectDocForView={handleSelectDocForView}
            onSelectionChange={handleSelectionChange}
            onSelectAll={handleSelectAll}
          />
           <div className="mt-auto pt-4 space-y-3">
              <button 
                onClick={() => setDbSettingsModalOpen(true)}
                className="w-full btn-secondary font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                <DatabaseIcon />
                <span>تنظیمات دیتابیس</span>
              </button>
              <button 
                onClick={() => setTemplateModalOpen(true)}
                className="w-full btn-secondary font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                <TemplateIcon/>
                <span>شابلون صدور سند</span>
              </button>
              <button
                onClick={handleConvertBulk}
                disabled={isLoading || selectedDocIds.size === 0}
                className={`w-full btn-primary font-semibold py-3 px-6 rounded-lg shadow-md flex items-center justify-center gap-2 ${selectedDocIds.size > 0 && !isLoading ? 'animate-subtle-pulse' : ''}`}
              >
                {isLoading && selectedDocIds.size > 0 ? (
                  <>
                    <Spinner />
                    <span>در حال پردازش...</span>
                  </>
                ) : (
                  <>
                   <MagicWandIcon />
                    <span>تبدیل {selectedDocIds.size} سند انتخابی</span>
                  </>
                )}
              </button>
           </div>
        </aside>

        <section className="w-full md:w-3/5 lg:w-2/3 bg-white rounded-xl shadow-lg p-6">
          {activeDoc && !journalEntry && (
            <div className="space-y-6">
              <InventoryDocDetail document={activeDoc} />
              <div className="border-t border-slate-200 pt-6 flex flex-col items-center">
                <button
                  onClick={handleConvertSingle}
                  disabled={isLoading}
                  className="btn-primary font-semibold py-3 px-8 rounded-lg shadow-md flex items-center gap-2"
                >
                  {isLoading && !selectedDocIds.size ? (<><Spinner /><span>در حال پردازش...</span></>) : (<><MagicWandIcon /><span>تبدیل این سند به سند حسابداری</span></>)}
                </button>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">
              {error}
            </div>
          )}

          {journalEntry && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">
                {selectedDocIds.size > 1 ? 'سند حسابداری تجمیعی' : 'سند حسابداری تولید شده'}
              </h3>
              <AccountingDocView entry={journalEntry} originalDocCount={selectedDocIds.size || 1} totalAmount={totalBulkAmount || activeDoc?.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) || 0}/>
            </div>
          )}

          {!activeDoc && !journalEntry && !isLoading && (
            <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)]">
              <p>برای مشاهده جزئیات، یک سند را از لیست انتخاب کنید.</p>
            </div>
          )}
        </section>
      </main>
      {isTemplateModalOpen && 
        <TemplateModal 
          rules={accountingRules} 
          warehouses={warehouses}
          accounts={mockAccounts}
          costCenters={mockCostCenters}
          onSave={handleSaveRules}
          onClose={() => setTemplateModalOpen(false)} 
        />
      }
      {isDbSettingsModalOpen && 
        <DatabaseSettingsModal 
            initialSettings={dbSettings} 
            onSave={handleSaveDbSettings}
            onClose={() => setDbSettingsModalOpen(false)} 
        />
      }
    </div>
  );
};

export default App;