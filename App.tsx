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
import SettlePartialDocsModal from './components/SettlePartialDocsModal';
import StatusBar from './components/StatusBar';
import WarehouseSelectionModal from './components/WarehouseSelectionModal';
import AllDocsModal from './components/AllDocsModal';
import EditAccountingDocModal from './components/EditAccountingDocModal';
import GenerationProgress from './components/GenerationProgress';
import Dashboard from './components/Dashboard';
import LogModal from './components/LogModal';
import ViewDocsModal from './components/ViewDocsModal';
import WarehouseInfoModal from './components/WarehouseInfoModal';
import ToastContainer from './components/ToastContainer';
import FinancialReportsModal from './components/FinancialReportsModal';
import InventoryReportsModal from './components/InventoryReportsModal';
import LoginModal from './components/LoginModal';
import UserManagementModal from './components/UserManagementModal';


import { allDocuments, accountingRules as initialRules, allWarehouses, docTypeInfos as allDocTypes, allAccounts, allCostCenters, databaseSettings as initialDbSettings, allUsers as mockUsers } from './data/mockData';
import { generateAccountingDocument } from './services/accountingService';
import { InventoryDocument, JournalEntry, AccountingRule, DatabaseSettings, DocumentStatus, GeneratedDocInfo, ApprovalStatus, LogType, LogEntry, ToastInfo, User, UserRole } from './types';

export default function App() {
    const [inventoryDocuments, setInventoryDocuments] = useState<InventoryDocument[]>(allDocuments);
    const [selectedDoc, setSelectedDoc] = useState<InventoryDocument | null>(null);
    const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
    const [generatedEntry, setGeneratedEntry] = useState<JournalEntry | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Progress state for loading indicator
    const [progress, setProgress] = useState(0);
    const [progressStatusText, setProgressStatusText] = useState('');

    // User Management
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [showLoginModal, setShowLoginModal] = useState(true);
    const [showUserManagementModal, setShowUserManagementModal] = useState(false);


    // Modals state
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showDbSettingsModal, setShowDbSettingsModal] = useState(false);
    const [showConversionModal, setShowConversionModal] = useState(false);
    const [showGeneratedDocsModal, setShowGeneratedDocsModal] = useState(false);
    const [showBatchConversionModal, setShowBatchConversionModal] = useState(false);
    const [showSettlePartialDocsModal, setShowSettlePartialDocsModal] = useState(false);
    const [showWarehouseModal, setShowWarehouseModal] = useState(false);
    const [showAllDocsModal, setShowAllDocsModal] = useState(false);
    const [showEditDocModal, setShowEditDocModal] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);
    const [showWarehouseInfoModal, setShowWarehouseInfoModal] = useState(false);
    const [showFinancialReportsModal, setShowFinancialReportsModal] = useState(false);
    const [showInventoryReportsModal, setShowInventoryReportsModal] = useState(false);
    const [viewDocsModalData, setViewDocsModalData] = useState<{ title: string; docs: InventoryDocument[] } | null>(null);
    const [docsForNextConversion, setDocsForNextConversion] = useState<InventoryDocument[]>([]);
    const [docToEdit, setDocToEdit] = useState<GeneratedDocInfo | null>(null);
    const [toasts, setToasts] = useState<ToastInfo[]>([]);


    // Data state
    const [accountingRules, setAccountingRules] = useState<AccountingRule[]>(() => {
        try {
            const savedRules = localStorage.getItem('accountingRules');
            // If we have saved rules, use them. Otherwise, use the initial mock data.
            return savedRules ? JSON.parse(savedRules) : initialRules;
        } catch (error) {
            console.error("Could not load accounting rules from local storage", error);
            // Fallback to initial data in case of error
            return initialRules;
        }
    });
    const [dbSettings, setDbSettings] = useState<DatabaseSettings>(initialDbSettings);
    const [generatedDocsInfo, setGeneratedDocsInfo] = useState<GeneratedDocInfo[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]); // State for logs

    // Theme state
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Filter and Search state
    const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState<{ docType: string, year: string }>({ docType: '', year: '' });
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        // Automatically log in the admin user on first load to satisfy the prompt.
        const adminUser = users.find(u => u.role === UserRole.Admin);
        if (adminUser) {
            handleLogin(adminUser);
        }
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Persist accounting rules to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('accountingRules', JSON.stringify(accountingRules));
        } catch (error) {
            console.error("Could not save accounting rules to local storage", error);
        }
    }, [accountingRules]);

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        setShowLoginModal(false);
        // Reset selections for the new user
        setSelectedWarehouseIds(new Set());
        setSearchTerm('');
        setSelectedDoc(null);
        if (user.role === UserRole.Storekeeper && user.warehouseId) {
            setSelectedWarehouseIds(new Set([user.warehouseId.toString()]));
        }
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        setShowLoginModal(true);
    };
    
    const handleSaveUsers = (updatedUsers: User[]) => {
        setUsers(updatedUsers);
        addToast({ title: "موفق", message: "لیست کاربران با موفقیت به‌روزرسانی شد.", variant: 'success' });
        setShowUserManagementModal(false);
    };

    const handleDeleteUser = (userId: number) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
        addToast({ title: 'موفق', message: 'کاربر با موفقیت حذف شد.', variant: 'success' });
    };

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };
    
    const addToast = (toast: Omit<ToastInfo, 'id'>) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { ...toast, id }]);
    };
    
    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const addLog = (type: LogType, title: string, details: string | Record<string, any>) => {
      if (!currentUser) return; // Should not happen in practice
      const newLog: LogEntry = {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          userId: currentUser.id,
          userName: currentUser.name,
          type,
          title,
          details,
      };
      setLogs(prev => [newLog, ...prev]);
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
        addLog('info', 'ذخیره شابلون‌ها', { ruleCount: rules.length, activeCount: rules.filter(r => r.isActive).length });
        addToast({ title: 'موفق', message: 'شابلون‌ها با موفقیت ذخیره شدند.', variant: 'success'});
    };
    
    const handleSaveDbSettings = (settings: DatabaseSettings) => {
        setDbSettings(settings);
        addLog('info', 'ذخیره تنظیمات دیتابیس', { source: `${settings.source.server}/${settings.source.database}`, destination: `${settings.destination.server}/${settings.destination.database}` });
        addToast({ title: 'موفق', message: 'تنظیمات دیتابیس ذخیره شد.', variant: 'success'});
    };

    const handleFilterChange = (key: 'docType' | 'year', value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const initiateConsolidatedConversion = (docsToConvert: InventoryDocument[]) => {
        if (docsToConvert.length === 0) return;
        
        for (const doc of docsToConvert) {
            const hasRule = accountingRules.some(rule => 
                rule.isActive &&
                rule.warehouseId.toString() === doc.warehouseId.toString() &&
                rule.docTypeCode.toString() === doc.docTypeCode.toString()
            );
            if (!hasRule) {
                const warehouseName = allWarehouses.find(w => w.id.toString() === doc.warehouseId.toString())?.name || doc.warehouseId;
                const errorMsg = `برای سند "${doc.docTypeDescription}" از انبار "${warehouseName}" (شماره ${doc.docNo})، شابلون فعالی یافت نشد.`;
                addToast({ title: 'خطا در عملیات', message: errorMsg, variant: 'error'});
                addLog('error', 'پیش‌نیاز صدور سند ناموفق', { error: errorMsg, document: {id: doc.id, docNo: doc.docNo }});
                return;
            }
        }
        
        setDocsForNextConversion(docsToConvert);
        setShowConversionModal(true);
    };
    
    const initiateIndividualConversion = async (docsToConvert: InventoryDocument[]) => {
        if (docsToConvert.length === 0) return;

        // Validation check for templates before starting
        for (const doc of docsToConvert) {
            const hasRule = accountingRules.some(rule => 
                rule.isActive &&
                rule.warehouseId.toString() === doc.warehouseId.toString() &&
                rule.docTypeCode.toString() === doc.docTypeCode.toString()
            );
            if (!hasRule) {
                const warehouseName = allWarehouses.find(w => w.id.toString() === doc.warehouseId.toString())?.name || doc.warehouseId;
                const errorMsg = `برای سند "${doc.docTypeDescription}" از انبار "${warehouseName}" (شماره ${doc.docNo})، شابلون فعالی یافت نشد.`;
                addToast({ title: 'خطا در عملیات', message: errorMsg, variant: 'error' });
                addLog('error', 'پیش‌نیاز صدور سند ناموفق', { error: errorMsg, document: { id: doc.id, docNo: doc.docNo } });
                return;
            }
        }

        setIsLoading(true);
        setGeneratedEntry(null);
        
        let totalProgress = 0;
        const perDocProgress = 100 / docsToConvert.length;
        setProgress(0);
        setProgressStatusText(`شروع پردازش ${docsToConvert.length} سند...`);

        try {
            const generationPromises = docsToConvert.map(async (doc, index) => {
                const rule = accountingRules.find(r => 
                    r.isActive && 
                    r.warehouseId.toString() === doc.warehouseId.toString() && 
                    r.docTypeCode.toString() === doc.docTypeCode.toString()
                );
                const description = rule?.docDescription || `بر اساس سند انبار شماره ${doc.docNo}`;
                const amount = doc.totalAmount - doc.convertedAmount;
                
                const entry = await generateAccountingDocument([doc], accountingRules, allWarehouses, amount, doc.date, description);
                
                totalProgress += perDocProgress;
                setProgress(Math.min(99, totalProgress));
                setProgressStatusText(`(${index + 1}/${docsToConvert.length}) سند ${doc.docNo} پردازش شد...`);
                
                return { doc, entry };
            });

            const results = await Promise.all(generationPromises);

            setProgress(100);
            setProgressStatusText('عملیات با موفقیت انجام شد!');

            const newGeneratedDocs: GeneratedDocInfo[] = [];
            let updatedInventoryDocs = [...inventoryDocuments];

            results.forEach(({ doc, entry }) => {
                const newDocInfo = {
                    id: `gen-doc-${Date.now()}-${doc.id}`,
                    entry,
                    sourceDocIds: [doc.id],
                    sourceWarehouseNames: [doc.warehouseName],
                    approvalStatus: ApprovalStatus.Draft,
                };
                newGeneratedDocs.push(newDocInfo);
                addLog('success', `صدور سند انفرادی موفق: ${doc.docNo}`, { sourceDocId: doc.id, generatedDocId: newDocInfo.id, amount: doc.totalAmount - doc.convertedAmount });

                const docIndex = updatedInventoryDocs.findIndex(d => d.id === doc.id);
                if (docIndex !== -1) {
                    const newDocState = { ...updatedInventoryDocs[docIndex] };
                    newDocState.convertedAmount = newDocState.totalAmount;
                    newDocState.status = DocumentStatus.Issued;
                    updatedInventoryDocs[docIndex] = newDocState;
                }
            });

            setGeneratedDocsInfo(prev => [...prev, ...newGeneratedDocs]);
            setInventoryDocuments(updatedInventoryDocs);
            setSelectedDocIds(new Set());
            setSelectedDoc(null);
            
            setTimeout(() => {
                setIsLoading(false);
                addToast({ title: 'صدور انفرادی موفق', message: `${docsToConvert.length} سند حسابداری با موفقیت تولید شد.`, variant: 'success' });
            }, 500);

        } catch (error: any) {
            const errorMsg = error.message || 'یکی از اسناد موفق به تولید نشد.';
             setTimeout(() => {
                setIsLoading(false);
                addToast({ title: 'خطا در عملیات', message: errorMsg, variant: 'error' });
            }, 500);
            addLog('error', 'خطا در صدور انفرادی سند', { error: errorMsg, docCount: docsToConvert.length });
        }
    };
    
    const handleConfirmBatchSelection = (selectedDocs: InventoryDocument[]) => {
        setShowBatchConversionModal(false);
        initiateConsolidatedConversion(selectedDocs);
    };

    const handleConfirmConversion = async (docsToConvert: InventoryDocument[], amount: number, date: string, description: string) => {
        setShowConversionModal(false);
        setIsLoading(true);
        setGeneratedEntry(null);

        let progressTimeout: ReturnType<typeof setTimeout>;
        
        const startProgressSimulation = () => {
            setProgress(0);
            setProgressStatusText('شروع پردازش...');
            let currentProgress = 0;
            const messages: { [key: number]: string } = {
                25: 'تحلیل اسناد انبار...',
                50: 'اعمال قوانین حسابداری...',
                75: 'تولید آرتیکل‌های سند...',
                95: 'نهایی‌سازی سند...',
            };
            
            const update = () => {
                currentProgress += 1;
                if (currentProgress <= 99) {
                    setProgress(currentProgress);
                    if (messages[currentProgress]) {
                        setProgressStatusText(messages[currentProgress]);
                    }
                    let nextTimeout = 80;
                    if (currentProgress < 25) nextTimeout = 40;
                    else if (currentProgress < 80) nextTimeout = 120;
                    else nextTimeout = 50;
                    progressTimeout = setTimeout(update, nextTimeout);
                }
            };
            update();
        };

        startProgressSimulation();

        try {
            const entry = await generateAccountingDocument(docsToConvert, accountingRules, allWarehouses, amount, date, description);
            
            clearTimeout(progressTimeout);
            setProgress(100);
            setProgressStatusText('سند با موفقیت تولید شد!');

            setGeneratedEntry(entry);

            const newGeneratedDoc: GeneratedDocInfo = {
                id: `gen-doc-${Date.now()}`,
                entry,
                sourceDocIds: docsToConvert.map(d => d.id),
                sourceWarehouseNames: [...new Set(docsToConvert.map(d => d.warehouseName))],
                approvalStatus: ApprovalStatus.Draft,
            };
            setGeneratedDocsInfo(prev => [...prev, newGeneratedDoc]);

            addLog('success', `صدور سند تجمیعی موفق`, { generatedDocId: newGeneratedDoc.id, sourceDocCount: docsToConvert.length, amount });

            setInventoryDocuments(prevDocs => {
                let remainingAmountToAllocate = amount;
                const updatedDocs = JSON.parse(JSON.stringify(prevDocs));
                const docsToUpdateFromConversion = docsToConvert.map(d => d.id);
                for (const doc of updatedDocs) {
                    if (!docsToUpdateFromConversion.includes(doc.id) || remainingAmountToAllocate <= 0) continue;
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
            
            setTimeout(() => {
                setIsLoading(false);
                addToast({ title: 'صدور سند موفق', message: `سند حسابداری با موفقیت برای ${docsToConvert.length} سند انبار تولید شد.`, variant: 'success' });
            }, 500);

        } catch (error: any) {
            clearTimeout(progressTimeout);
            const errorMsg = error.message || 'خطا در ارتباط با مدل هوش مصنوعی. لطفا دوباره تلاش کنید.';
            setTimeout(() => {
                setIsLoading(false);
                addToast({ title: 'خطا در تولید سند', message: errorMsg, variant: 'error' });
            }, 500);
            addLog('error', 'خطا در صدور سند تجمیعی', { error: errorMsg, sourceDocCount: docsToConvert.length, amount });
        }
    };
    
    const filteredDocuments = useMemo(() => {
        let docsToFilter = inventoryDocuments;

        if (currentUser?.role === UserRole.Storekeeper && currentUser.warehouseId) {
            docsToFilter = docsToFilter.filter(doc => doc.warehouseId === currentUser.warehouseId);
        }

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            docsToFilter = docsToFilter.filter(doc =>
                doc.docNo.toLowerCase().includes(lowerSearchTerm) ||
                doc.docTypeDescription.toLowerCase().includes(lowerSearchTerm) ||
                doc.warehouseName.toLowerCase().includes(lowerSearchTerm) ||
                doc.totalAmount.toString().includes(lowerSearchTerm) ||
                doc.details.some(d => 
                    d.itemName.toLowerCase().includes(lowerSearchTerm) || 
                    d.costCenterName.toLowerCase().includes(lowerSearchTerm)
                )
            );
        } else if (selectedWarehouseIds.size > 0) {
            docsToFilter = docsToFilter.filter(doc => selectedWarehouseIds.has(doc.warehouseId.toString()));
        } else {
             if (currentUser?.role === UserRole.Storekeeper) {
                // Storekeeper sees their warehouse docs by default
             } else {
                return []; // No warehouse selected for other roles
             }
        }
        
        return docsToFilter.filter(doc => {
            const docTypeMatch = filters.docType ? doc.docTypeCode.toString() === filters.docType : true;
            const yearMatch = filters.year ? doc.date.startsWith(filters.year) : true;
            return docTypeMatch && yearMatch;
        });
    }, [inventoryDocuments, selectedWarehouseIds, filters, searchTerm, currentUser]);


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
    
    const handleApproveGeneratedDoc = (docId: string) => {
        setGeneratedDocsInfo(prev =>
            prev.map(doc =>
                doc.id === docId ? { ...doc, approvalStatus: ApprovalStatus.Approved } : doc
            )
        );
        addLog('info', `سند حسابداری تصویب شد`, { generatedDocId: docId });
        addToast({ title: 'موفق', message: 'سند با موفقیت تصویب شد.', variant: 'success' });
    };

    const handleApproveAllGeneratedDocs = (docIds: string[]) => {
        const idsToApprove = new Set(docIds);
        setGeneratedDocsInfo(prev =>
            prev.map(doc =>
                idsToApprove.has(doc.id) ? { ...doc, approvalStatus: ApprovalStatus.Approved } : doc
            )
        );
        addLog('info', `تصویب گروهی اسناد حسابداری`, { approvedCount: docIds.length, docIds });
        addToast({ title: 'موفق', message: `${docIds.length} سند با موفقیت تصویب شد.`, variant: 'success' });
    };
    
    const handleDeleteGeneratedDoc = (docId: string) => {
        setGeneratedDocsInfo(prev => prev.filter(doc => doc.id !== docId));
        addLog('info', `سند حسابداری حذف شد`, { generatedDocId: docId });
        addToast({ title: 'موفق', message: 'سند پیش‌نویس حذف شد.', variant: 'success' });
    };
    
    const handleDeleteSelectedGeneratedDocs = (docIds: string[]) => {
        const idsToDelete = new Set(docIds);
        setGeneratedDocsInfo(prev => prev.filter(doc => !idsToDelete.has(doc.id)));
        addLog('info', `حذف گروهی اسناد حسابداری`, { deletedCount: docIds.length, docIds });
        addToast({ title: 'موفق', message: `${docIds.length} سند پیش‌نویس حذف شد.`, variant: 'success' });
    };

    const handleOpenEditDocModal = (docInfo: GeneratedDocInfo) => {
        setDocToEdit(docInfo);
        setShowEditDocModal(true);
    };

    const handleSaveEditedDoc = (docId: string, updatedEntry: JournalEntry) => {
        setGeneratedDocsInfo(prev =>
            prev.map(doc =>
                doc.id === docId ? { ...doc, entry: updatedEntry } : doc
            )
        );
        setShowEditDocModal(false);
        setDocToEdit(null);
        addLog('info', `سند حسابداری ویرایش شد`, { generatedDocId: docId });
        addToast({ title: 'موفق', message: 'تغییرات سند ذخیره شد.', variant: 'success' });
    };

    const warehouseSelectionTitle = useMemo(() => {
        if (currentUser?.role === UserRole.Storekeeper) {
            return allWarehouses.find(w => w.id === currentUser.warehouseId)?.name || 'انبار من';
        }
        if (searchTerm) return `نتایج جستجو برای: "${searchTerm}"`;
        if (selectedWarehouseIds.size === 0) return 'انبار انتخاب نشده';
        if (selectedWarehouseIds.size === allWarehouses.length) return 'همه انبارها';
        if (selectedWarehouseIds.size === 1) {
            const id = selectedWarehouseIds.values().next().value;
            return allWarehouses.find(w => w.id.toString() === id)?.name || '';
        }
        return `${selectedWarehouseIds.size} انبار انتخاب شده`;
    }, [selectedWarehouseIds, allWarehouses, searchTerm, currentUser]);
    
    const handleOpenViewDocsModal = (title: string, docs: InventoryDocument[]) => {
        setViewDocsModalData({ title, docs });
    };

    const docHasTemplate = useMemo(() => {
        const ruleMap = new Map<string, boolean>();
        accountingRules.filter(r => r.isActive).forEach(rule => {
            const key = `${rule.warehouseId}-${rule.docTypeCode}`;
            ruleMap.set(key, true);
        });
        return (doc: InventoryDocument): boolean => {
            const docKey = `${doc.warehouseId}-${doc.docTypeCode}`;
            return ruleMap.has(docKey);
        };
    }, [accountingRules]);

    const dashboardInventoryDocuments = useMemo(() => {
        return inventoryDocuments.filter(doc => {
            const yearMatch = filters.year ? doc.date.startsWith(filters.year) : true;
            const docTypeMatch = filters.docType ? doc.docTypeCode.toString() === filters.docType : true;
            return yearMatch && docTypeMatch;
        });
    }, [inventoryDocuments, filters.year, filters.docType]);

    const dashboardGeneratedDocsInfo = useMemo(() => {
        const inventoryDocTypeMap = new Map<string, number>();
        inventoryDocuments.forEach(doc => {
            inventoryDocTypeMap.set(doc.id, doc.docTypeCode);
        });

        return generatedDocsInfo.filter(gDoc => {
            const yearMatch = filters.year ? gDoc.entry.date.startsWith(filters.year) : true;
            if (!yearMatch) return false;

            if (!filters.docType) return true;

            return gDoc.sourceDocIds.some(sourceId => {
                const docTypeCode = inventoryDocTypeMap.get(sourceId);
                return docTypeCode?.toString() === filters.docType;
            });
        });
    }, [generatedDocsInfo, inventoryDocuments, filters.year, filters.docType]);
    
    const availableYears = useMemo(() => {
        const years = new Set(inventoryDocuments.map(doc => doc.date.substring(0, 4)));
        return Array.from(years).sort(); // Sorts them ascendingly
    }, [inventoryDocuments]);
    
    if (!currentUser) {
        return <LoginModal users={users} onLogin={handleLogin} />;
    }

    return (
        <div className="p-4 bg-[var(--background-primary)]">
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
            <div className="h-[calc(100vh-2rem)] bg-[var(--background-secondary)] text-[var(--text-primary)] transition-colors duration-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <Header 
                    onToggleTheme={toggleTheme} 
                    currentTheme={theme}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />
                
                <main className="flex flex-row-reverse gap-4 flex-grow p-4 overflow-hidden">
                    <div className="flex-grow space-y-4 overflow-y-auto">
                      {(selectedWarehouseIds.size > 0 || searchTerm) ? (
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
                        <Dashboard 
                            inventoryDocuments={dashboardInventoryDocuments}
                            generatedDocsInfo={dashboardGeneratedDocsInfo}
                            onOpenViewDocsModal={handleOpenViewDocsModal}
                            docHasTemplate={docHasTemplate}
                        />
                      )}
                    </div>

                    <Sidebar
                        currentUser={currentUser}
                        onLogout={handleLogout}
                        onShowTemplateEditor={() => setShowTemplateModal(true)}
                        onShowDbSettings={() => setShowDbSettingsModal(true)}
                        onShowGeneratedDocs={() => setShowGeneratedDocsModal(true)}
                        onShowBatchConversion={() => setShowBatchConversionModal(true)}
                        onShowSettlePartialDocs={() => setShowSettlePartialDocsModal(true)}
                        onShowWarehouseSelector={() => setShowWarehouseModal(true)}
                        onShowWarehouseInfo={() => setShowWarehouseInfoModal(true)}
                        onShowAllDocs={() => setShowAllDocsModal(true)}
                        onShowLogs={() => setShowLogModal(true)}
                        onShowFinancialReports={() => setShowFinancialReportsModal(true)}
                        onShowInventoryReports={() => setShowInventoryReportsModal(true)}
                        onShowUserManagement={() => setShowUserManagementModal(true)}
                        warehouseSelectionTitle={warehouseSelectionTitle}
                        docTypeInfos={allDocTypes}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        isSearching={!!searchTerm}
                        availableYears={availableYears}
                    />
                </main>

                <StatusBar docs={inventoryDocuments} />

                {isLoading && <GenerationProgress progress={progress} statusText={progressStatusText} />}

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
                        onLog={addLog}
                        onAddToast={addToast}
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
                    />
                )}
                {showGeneratedDocsModal && (
                    <GeneratedDocsModal
                        docs={generatedDocsInfo}
                        onClose={() => setShowGeneratedDocsModal(false)}
                        warehouses={allWarehouses}
                        onApprove={handleApproveGeneratedDoc}
                        onApproveAll={handleApproveAllGeneratedDocs}
                        onEdit={handleOpenEditDocModal}
                        onDelete={handleDeleteGeneratedDoc}
                        onDeleteAll={handleDeleteSelectedGeneratedDocs}
                        currentUser={currentUser}
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
                {showSettlePartialDocsModal && (
                    <SettlePartialDocsModal
                        allDocuments={inventoryDocuments}
                        onClose={() => setShowSettlePartialDocsModal(false)}
                        onInitiateConversion={initiateConsolidatedConversion}
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
                        onInitiateConsolidatedConversion={initiateConsolidatedConversion}
                        onInitiateIndividualConversion={initiateIndividualConversion}
                    />
                )}
                {showEditDocModal && docToEdit && (
                    <EditAccountingDocModal
                        docInfo={docToEdit}
                        accounts={allAccounts}
                        costCenters={allCostCenters}
                        onSave={handleSaveEditedDoc}
                        onClose={() => {
                            setShowEditDocModal(false);
                            setDocToEdit(null);
                        }}
                    />
                )}
                {showLogModal && (
                    <LogModal
                        logs={logs}
                        onClose={() => setShowLogModal(false)}
                    />
                )}
                {viewDocsModalData && (
                    <ViewDocsModal
                        isOpen={!!viewDocsModalData}
                        onClose={() => setViewDocsModalData(null)}
                        title={viewDocsModalData.title}
                        docs={viewDocsModalData.docs}
                        docHasTemplate={docHasTemplate}
                    />
                )}
                {showWarehouseInfoModal && (
                   <WarehouseInfoModal
                       isOpen={showWarehouseInfoModal}
                       onClose={() => setShowWarehouseInfoModal(false)}
                       warehouses={allWarehouses}
                   />
                )}
                {showFinancialReportsModal && (
                    <FinancialReportsModal
                        isOpen={showFinancialReportsModal}
                        onClose={() => setShowFinancialReportsModal(false)}
                        generatedDocs={generatedDocsInfo}
                        accounts={allAccounts}
                    />
                )}
                 {showInventoryReportsModal && (
                    <InventoryReportsModal
                        isOpen={showInventoryReportsModal}
                        onClose={() => setShowInventoryReportsModal(false)}
                        inventoryDocs={inventoryDocuments}
                        warehouses={allWarehouses}
                    />
                )}
                 {showUserManagementModal && (
                    <UserManagementModal
                        isOpen={showUserManagementModal}
                        onClose={() => setShowUserManagementModal(false)}
                        users={users}
                        warehouses={allWarehouses}
                        onSave={handleSaveUsers}
                        onDeleteUser={handleDeleteUser}
                    />
                )}
            </div>
        </div>
    );
}