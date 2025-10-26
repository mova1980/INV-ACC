import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import InventoryDocList from './components/InventoryDocList';
import InventoryDocDetail from './components/InventoryDocDetail';
import AccountingDocView from './components/AccountingDocView';
import TemplateModal from './components/TemplateModal';
import DatabaseSettingsModal from './components/DatabaseSettingsModal';
import ConversionModal from './components/ConversionModal';
import GeneratedDocsModal from './components/GeneratedDocsModal';
import BatchConversionModal from './components/BatchConversionModal';
import StatusBar from './components/StatusBar';
import WarehouseSelectionModal from './components/WarehouseSelectionModal';
import AllDocsModal from './components/AllDocsModal'; // Import new modal

import { allDocuments, accountingRules as initialRules, allWarehouses, docTypeInfos as allDocTypes, allAccounts, allCostCenters, databaseSettings as initialDbSettings } from './data/mockData';
import { generateAccountingDocument } from './services/accountingService';
import { InventoryDocument, JournalEntry, AccountingRule, DatabaseSettings, DocumentStatus, DocTypeInfo, GeneratedDocInfo } from './types';

export default function App() {
    const [inventoryDocuments, setInventoryDocuments] = useState<InventoryDocument[]>(allDocuments);
    const [selectedDoc, setSelectedDoc] = useState<InventoryDocument | null>(null);
    const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
    const [generatedEntry, setGeneratedEntry] = useState<JournalEntry | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string>('');
    const [globalSuccess, setGlobalSuccess] = useState<string>('');

    // Modals state
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showDbSettingsModal, setShowDbSettingsModal] = useState(false);
    const [showConversionModal, setShowConversionModal] = useState(false);
    const [showGeneratedDocsModal, setShowGeneratedDocsModal] = useState(false);
    const [showBatchConversionModal, setShowBatchConversionModal] = useState(false);
    const [showWarehouseModal, setShowWarehouseModal] = useState(false);
    const [showAllDocsModal, setShowAllDocsModal] = useState(false); // New modal state
    const [docsForNextConversion, setDocsForNextConversion] = useState<InventoryDocument[]>([]);

    // Data state
    const [accountingRules, setAccountingRules] = useState<AccountingRule[]>(initialRules);
    const [dbSettings, setDbSettings] = useState<DatabaseSettings>(initialDbSettings);
    const [generatedDocsInfo, setGeneratedDocsInfo] = useState<GeneratedDocInfo[]>([]);

    // Theme state
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Filter state
    const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState<{ docType: string, year: string }>({ docType: '', year: '1403' });
    
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleSelectDoc = (doc: InventoryDocument) => {
        setSelectedDoc(doc);
    };

    const handleCheckboxChange = (docId: string, isChecked: boolean) => {
        setSelectedDocIds(prev => {
            const newSet = new Set(prev);
            if (isChecked) {
                newSet.add(docId);
            } else {
                newSet.delete(docId);
            }
            return newSet;
        });
    };

    const handleSaveRules = (rules: AccountingRule[]) => {
        setAccountingRules(rules);
    };
    
    const handleSaveDbSettings = (settings: DatabaseSettings) => {
        setDbSettings(settings);
    };

    const handleFilterChange = (key: 'docType' | 'year', value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const initiateConversion = (docsToConvert: InventoryDocument[]) => {
        if (docsToConvert.length === 0) return;
        
        for (const doc of docsToConvert) {
            const hasRule = accountingRules.some(rule => 
                rule.isActive &&
                rule.warehouseId.toString() === doc.warehouseId.toString() &&
                rule.docTypeCode.toString() === doc.docTypeCode.toString()
            );
            if (!hasRule) {
                const warehouseName = allWarehouses.find(w => w.id.toString() === doc.warehouseId.toString())?.name || doc.warehouseId;
                setGlobalError(`برای سند "${doc.docTypeDescription}" از انبار "${warehouseName}" (شماره ${doc.docNo})، شابلون فعالی یافت نشد.`);
                setTimeout(() => setGlobalError(''), 6000);
                return;
            }
        }
        
        setDocsForNextConversion(docsToConvert);
        setShowConversionModal(true);
    };

    const handleConvertToAccountingFromMain = () => {
        const selectedDocs = inventoryDocuments.filter(doc => selectedDocIds.has(doc.id));
        initiateConversion(selectedDocs);
    };
    
    const handleConfirmBatchSelection = (selectedDocs: InventoryDocument[]) => {
        setShowBatchConversionModal(false);
        initiateConversion(selectedDocs);
    };

    const handleConfirmConversion = async (docsToConvert: InventoryDocument[], amount: number, date: string, description: string) => {
        setIsLoading(true);
        setGeneratedEntry(null);
        try {
            const entry = await generateAccountingDocument(docsToConvert, accountingRules, allWarehouses, amount, date, description);
            setGeneratedEntry(entry);

            const newGeneratedDoc: GeneratedDocInfo = {
                entry,
                sourceDocIds: docsToConvert.map(d => d.id),
                sourceWarehouseNames: [...new Set(docsToConvert.map(d => d.warehouseName))]
            };
            setGeneratedDocsInfo(prev => [...prev, newGeneratedDoc]);

            setInventoryDocuments(prevDocs => {
                let remainingAmountToAllocate = amount;
                const updatedDocs = JSON.parse(JSON.stringify(prevDocs));

                const docsToUpdateFromConversion = docsToConvert.map(d => d.id);

                for (const doc of updatedDocs) {
                    if (!docsToUpdateFromConversion.includes(doc.id) || remainingAmountToAllocate <= 0) {
                        continue;
                    }

                    const remainingInDoc = doc.totalAmount - doc.convertedAmount;
                    const amountToApply = Math.min(remainingAmountToAllocate, remainingInDoc);

                    doc.convertedAmount += amountToApply;
                    remainingAmountToAllocate -= amountToApply;

                    if (doc.convertedAmount >= doc.totalAmount) {
                        doc.status = DocumentStatus.Issued;
                    } else if (doc.convertedAmount > 0) {
                        doc.status = DocumentStatus.PartiallySettled;
                    }
                }
                return updatedDocs;
            });

            setSelectedDocIds(new Set());
            setSelectedDoc(null);
            
            setGlobalSuccess(`سند حسابداری با موفقیت برای ${docsToConvert.length} سند انبار تولید شد.`);
            setTimeout(() => setGlobalSuccess(''), 5000);

        } catch (error: any) {
            setGlobalError(error.message || 'خطا در ارتباط با مدل هوش مصنوعی');
            setTimeout(() => setGlobalError(''), 5000);
        } finally {
            setIsLoading(false);
            setShowConversionModal(false);
        }
    };
    
    const filteredDocuments = useMemo(() => {
        if (selectedWarehouseIds.size === 0) return [];
        return inventoryDocuments.filter(doc => {
             const warehouseMatch = selectedWarehouseIds.has(doc.warehouseId.toString());
             const docTypeMatch = filters.docType ? doc.docTypeCode.toString() === filters.docType : true;
             const yearMatch = filters.year ? doc.date.startsWith(filters.year) : true;
             return warehouseMatch && docTypeMatch && yearMatch;
        });
    }, [inventoryDocuments, selectedWarehouseIds, filters]);

    const handleWarehouseSelectionChange = (warehouseId: string) => {
        setSelectedWarehouseIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(warehouseId)) {
                newSet.delete(warehouseId);
            } else {
                newSet.add(warehouseId);
            }
            return newSet;
        });
    };

    const handleSelectAllWarehouses = () => {
        if (selectedWarehouseIds.size === allWarehouses.length) {
            setSelectedWarehouseIds(new Set());
        } else {
            setSelectedWarehouseIds(new Set(allWarehouses.map(w => w.id.toString())));
        }
    };
    
    const warehouseSelectionTitle = useMemo(() => {
        if (selectedWarehouseIds.size === 0) return 'انبار انتخاب نشده';
        if (selectedWarehouseIds.size === allWarehouses.length) return 'همه انبارها';
        if (selectedWarehouseIds.size === 1) {
            const id = selectedWarehouseIds.values().next().value;
            return allWarehouses.find(w => w.id.toString() === id)?.name || '';
        }
        return `${selectedWarehouseIds.size} انبار انتخاب شده`;
    }, [selectedWarehouseIds, allWarehouses]);

    return (
        <div className="p-4 bg-[var(--background-primary)]">
            <div className="h-[calc(100vh-2rem)] bg-[var(--background-secondary)] text-[var(--text-primary)] transition-colors duration-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <Header onToggleTheme={toggleTheme} currentTheme={theme} />
                
                {globalError && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-[100] animate-fade-in" role="alert">
                        <strong className="font-bold">خطا! </strong>
                        <span className="block sm:inline">{globalError}</span>
                    </div>
                )}
                
                {globalSuccess && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-[100] animate-fade-in" role="alert">
                        <strong className="font-bold">موفق! </strong>
                        <span className="block sm:inline">{globalSuccess}</span>
                    </div>
                )}
                
                <main className="flex flex-row-reverse gap-4 flex-grow p-4 overflow-hidden">
                    <div className="flex-grow space-y-4 overflow-y-auto">
                      {selectedWarehouseIds.size > 0 ? (
                        <>
                          <InventoryDocList
                              docs={filteredDocuments}
                              onSelectDoc={handleSelectDoc}
                              selectedDocId={selectedDoc?.id}
                              onCheckboxChange={handleCheckboxChange}
                              selectedDocIds={selectedDocIds}
                              warehouseSelectionTitle={warehouseSelectionTitle}
                          />
                          {selectedDoc ? <InventoryDocDetail doc={selectedDoc} /> : (
                             <div className="bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-lg p-6 text-center text-[var(--text-muted)]">
                               <p>برای مشاهده جزئیات، یک سند را از لیست بالا انتخاب کنید.</p>
                             </div>
                          )}
                          
                          {generatedEntry && <AccountingDocView entry={generatedEntry} />}
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-lg welcome-bg">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-[var(--text-primary)]">به سیستم تبدیل اسناد خوش آمدید</h2>
                                <p className="text-lg text-[var(--text-secondary)] mt-2">لطفا برای شروع کار، یک یا چند انبار را از منوی سمت راست انتخاب کنید.</p>
                            </div>
                        </div>
                      )}
                    </div>

                    <Sidebar
                        onConvertToAccounting={handleConvertToAccountingFromMain}
                        onShowTemplateEditor={() => setShowTemplateModal(true)}
                        onShowDbSettings={() => setShowDbSettingsModal(true)}
                        onShowGeneratedDocs={() => setShowGeneratedDocsModal(true)}
                        onShowBatchConversion={() => setShowBatchConversionModal(true)}
                        onShowWarehouseSelector={() => setShowWarehouseModal(true)}
                        onShowAllDocs={() => setShowAllDocsModal(true)}
                        isConvertDisabled={selectedDocIds.size === 0}
                        isLoading={isLoading}
                        warehouseSelectionTitle={warehouseSelectionTitle}
                        docTypeInfos={allDocTypes}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                </main>

                <StatusBar docs={inventoryDocuments} />

                {showTemplateModal && (
                    <TemplateModal 
                        allDocuments={inventoryDocuments}
                        rules={accountingRules} 
                        warehouses={allWarehouses}
                        docTypeInfos={allDocTypes}
                        accounts={allAccounts}
                        costCenters={allCostCenters}
                        onSave={handleSaveRules} 
                        onClose={() => setShowTemplateModal(false)} 
                    />
                )}
                {showDbSettingsModal && (
                     <DatabaseSettingsModal 
                        initialSettings={dbSettings}
                        onSave={handleSaveDbSettings}
                        onClose={() => setShowDbSettingsModal(false)}
                     />
                )}
                {showConversionModal && (
                    <ConversionModal
                        docs={docsForNextConversion}
                        onClose={() => setShowConversionModal(false)}
                        onConfirm={handleConfirmConversion}
                        isLoading={isLoading}
                    />
                )}
                {showGeneratedDocsModal && (
                    <GeneratedDocsModal
                        docs={generatedDocsInfo}
                        onClose={() => setShowGeneratedDocsModal(false)}
                        warehouses={allWarehouses}
                    />
                )}
                {showBatchConversionModal && (
                    <BatchConversionModal
                        allDocuments={inventoryDocuments}
                        allWarehouses={allWarehouses}
                        accountingRules={accountingRules}
                        onClose={() => setShowBatchConversionModal(false)}
                        onConfirm={handleConfirmBatchSelection}
                    />
                )}
                 {showWarehouseModal && (
                    <WarehouseSelectionModal
                        isOpen={showWarehouseModal}
                        onClose={() => setShowWarehouseModal(false)}
                        warehouses={allWarehouses}
                        selectedWarehouseIds={selectedWarehouseIds}
                        onWarehouseSelectionChange={handleWarehouseSelectionChange}
                        onSelectAllWarehouses={handleSelectAllWarehouses}
                    />
                )}
                {showAllDocsModal && (
                    <AllDocsModal
                        allDocuments={inventoryDocuments}
                        allWarehouses={allWarehouses}
                        docTypeInfos={allDocTypes}
                        accountingRules={accountingRules}
                        onClose={() => setShowAllDocsModal(false)}
                        onInitiateConversion={initiateConversion}
                    />
                )}
            </div>
        </div>
    );
}