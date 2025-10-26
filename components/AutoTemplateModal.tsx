import React, { useState, useMemo } from 'react';
import { InventoryDocument, AccountingRule, Warehouse, DocTypeInfo, Account, CostCenterItem, AutoGenRuleHint } from '../types';
import { generateAccountingRules } from '../services/accountingService';
import { SparklesIcon } from './icons/SparklesIcon';
import Spinner from './Spinner';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface Props {
  allDocuments: InventoryDocument[];
  currentRules: AccountingRule[];
  warehouses: Warehouse[];
  docTypeInfos: DocTypeInfo[];
  accounts: Account[];
  costCenters: CostCenterItem[];
  onClose: () => void;
  onGenerate: (newRules: AccountingRule[]) => void;
}

type MissingTemplate = {
  warehouse: Warehouse;
  docType: DocTypeInfo;
  key: string;
};

const AutoTemplateModal: React.FC<Props> = ({ allDocuments, currentRules, warehouses, docTypeInfos, accounts, costCenters, onClose, onGenerate }) => {
  const [selectedCombinations, setSelectedCombinations] = useState<Set<string>>(new Set());
  const [hints, setHints] = useState<AutoGenRuleHint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const missingTemplates = useMemo((): MissingTemplate[] => {
    const activeRuleKeys = new Set(currentRules.filter(r => r.isActive).map(r => `${r.warehouseId}-${r.docTypeCode}`));
    const missing = new Map<string, MissingTemplate>();

    for (const doc of allDocuments) {
      const key = `${doc.warehouseId}-${doc.docTypeCode}`;
      if (!activeRuleKeys.has(key) && !missing.has(key)) {
        const warehouse = warehouses.find(w => w.id === doc.warehouseId);
        const docType = docTypeInfos.find(dt => dt.id === doc.docTypeCode);
        if (warehouse && docType) {
          missing.set(key, { warehouse, docType, key });
        }
      }
    }
    return Array.from(missing.values());
  }, [allDocuments, currentRules, warehouses, docTypeInfos]);
  
  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedCombinations(new Set(missingTemplates.map(t => t.key)));
    } else {
      setSelectedCombinations(new Set());
    }
  };

  const handleSelectCombination = (key: string, isChecked: boolean) => {
    setSelectedCombinations(prev => {
      const newSet = new Set(prev);
      if (isChecked) newSet.add(key);
      else newSet.delete(key);
      return newSet;
    });
  };

  const addHint = () => {
    setHints(prev => [...prev, { id: `hint-${Date.now()}`, transactionType: 'Debit', account: '', costCenters: { center1: '', center2: '', center3: '' } }]);
  };

  const removeHint = (id: string) => {
    setHints(prev => prev.filter(h => h.id !== id));
  };

  const handleHintChange = (id: string, field: keyof Omit<AutoGenRuleHint, 'id' | 'costCenters'> | string, value: string) => {
    setHints(prev => prev.map(h => {
      if (h.id === id) {
        const newHint = { ...h };
        if (field.startsWith('costCenters.')) {
            const subField = field.split('.')[1] as keyof AutoGenRuleHint['costCenters'];
            newHint.costCenters[subField] = value;
        } else {
            (newHint as any)[field] = value;
        }
        return newHint;
      }
      return h;
    }));
  };

  const handleGenerateClick = async () => {
    if (selectedCombinations.size === 0) {
      setError('لطفاً حداقل یک مورد را برای تولید شابلون انتخاب کنید.');
      return;
    }
    setError('');
    setIsLoading(true);

    const combinationsToGenerate = missingTemplates.filter(t => selectedCombinations.has(t.key));

    try {
      const newRules = await generateAccountingRules(combinationsToGenerate, hints, accounts, costCenters);
      onGenerate(newRules);
      onClose();
    } catch (e: any) {
      setError(e.message || 'یک خطای ناشناخته رخ داد.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex justify-center items-center p-4 modal-backdrop-animation" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-6 w-full max-w-4xl h-full max-h-[90vh] flex flex-col modal-content-animation text-[var(--text-primary)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3 mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2"><SparklesIcon /> تولید اتوماتیک شابلون</h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-3xl font-light">&times;</button>
        </div>

        <div className="flex-grow overflow-y-auto space-y-4 pr-2">
            {missingTemplates.length > 0 ? (
                <>
                {/* Step 1: Select Combinations */}
                <div>
                    <h3 className="font-semibold mb-2">۱. موارد فاقد شابلون را انتخاب کنید:</h3>
                    <div className="border border-[var(--border-color)] rounded-lg max-h-48 overflow-y-auto">
                        <table className="w-full text-sm text-right">
                            <thead className="sticky top-0 bg-[var(--background-tertiary)]">
                                <tr>
                                    <th className="p-2 w-10"><input type="checkbox" className="rounded" onChange={e => handleSelectAll(e.target.checked)} checked={selectedCombinations.size === missingTemplates.length && missingTemplates.length > 0} /></th>
                                    <th className="p-2 font-medium text-right">انبار</th>
                                    <th className="p-2 font-medium text-right">نوع سند</th>
                                </tr>
                            </thead>
                            <tbody>
                                {missingTemplates.map(t => (
                                    <tr key={t.key} className="border-t border-[var(--border-color)]">
                                        <td className="p-2"><input type="checkbox" className="rounded" checked={selectedCombinations.has(t.key)} onChange={e => handleSelectCombination(t.key, e.target.checked)} /></td>
                                        <td className="p-2">{t.warehouse.name}</td>
                                        <td className="p-2">{t.docType.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Step 2: Provide Hints */}
                <div>
                    <h3 className="font-semibold mb-2">۲. راهنمایی‌های اختیاری برای AI (پیشنهادی):</h3>
                    <div className="border border-[var(--border-color)] rounded-lg p-3 space-y-2">
                        <p className="text-xs text-[var(--text-muted)]">می‌توانید حساب‌ها یا مراکز هزینه مورد نظر را مشخص کنید. اگر خالی بگذارید، هوش مصنوعی بهترین گزینه را انتخاب می‌کند.</p>
                        {hints.map(hint => (
                             <div key={hint.id} className="grid grid-cols-6 gap-2 items-center text-xs">
                                <select value={hint.transactionType} onChange={e => handleHintChange(hint.id, 'transactionType', e.target.value)} className="w-full p-2 rounded-md border border-[var(--border-color-strong)]"><option value="Debit">بدهکار</option><option value="Credit">بستانکار</option></select>
                                <select value={hint.account} onChange={e => handleHintChange(hint.id, 'account', e.target.value)} className="col-span-2 w-full p-2 rounded-md border border-[var(--border-color-strong)]"><option value="">حساب (اختیاری)</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
                                <select value={hint.costCenters.center1} onChange={e => handleHintChange(hint.id, 'costCenters.center1', e.target.value)} className="w-full p-2 rounded-md border border-[var(--border-color-strong)]"><option value="">مرکز ۱</option>{costCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                                <select value={hint.costCenters.center2} onChange={e => handleHintChange(hint.id, 'costCenters.center2', e.target.value)} className="w-full p-2 rounded-md border border-[var(--border-color-strong)]"><option value="">مرکز ۲</option>{costCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                                <button onClick={() => removeHint(hint.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-500/10 justify-self-center"><TrashIcon /></button>
                             </div>
                        ))}
                        <button onClick={addHint} className="text-sm text-green-600 hover:text-green-500 font-semibold flex items-center gap-1 transition-colors"><PlusIcon /> افزودن راهنما</button>
                    </div>
                </div>
                </>
            ) : (
                <div className="text-center p-10 text-[var(--text-muted)]">
                    <p className="font-semibold text-lg text-green-600">عالی!</p>
                    <p>به نظر می‌رسد تمام انواع اسناد موجود دارای شابلون فعال هستند.</p>
                </div>
            )}
        </div>

        {error && <p className="mt-2 text-sm text-red-600 bg-red-500/10 p-2 rounded-md animate-fade-in">{error}</p>}
        
        <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between items-center flex-shrink-0">
          <span className="text-sm text-[var(--text-secondary)]">
            تعداد انتخاب شده: <strong className="font-bold text-[var(--text-primary)]">{selectedCombinations.size}</strong>
          </span>
          <div className="flex gap-4">
            <button onClick={onClose} className="btn btn-secondary">انصراف</button>
            <button onClick={handleGenerateClick} className="btn btn-primary min-w-48" disabled={isLoading || selectedCombinations.size === 0}>
                {isLoading ? <><Spinner /><span>در حال تولید...</span></> : "تولید شابلون‌ها"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoTemplateModal;
