import React, { useState } from 'react';
import { AccountingRule, Warehouse, Account, CostCenterItem, RuleAction, DocTypeInfo, InventoryDocument } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import AutoTemplateModal from './AutoTemplateModal';

interface Props {
  allDocuments: InventoryDocument[];
  rules: AccountingRule[];
  warehouses: Warehouse[];
  docTypeInfos: DocTypeInfo[];
  accounts: Account[];
  costCenters: CostCenterItem[];
  onSave: (rules: AccountingRule[]) => void;
  onClose: () => void;
}

const TemplateModal: React.FC<Props> = ({ allDocuments, rules, warehouses, docTypeInfos, accounts, costCenters, onSave, onClose }) => {
  const [editableRules, setEditableRules] = useState<AccountingRule[]>(JSON.parse(JSON.stringify(rules)));
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [showAutoTemplateModal, setShowAutoTemplateModal] = useState(false);

  const handleRuleChange = (ruleIndex: number, field: keyof AccountingRule, value: any) => {
    const newRules = [...editableRules];
    (newRules[ruleIndex] as any)[field] = value;
    setEditableRules(newRules);
  };

  const handleActionChange = (ruleIndex: number, actionIndex: number, field: string, value: any) => {
    const newRules = [...editableRules];
    const actionToUpdate = { ...newRules[ruleIndex].actions[actionIndex] };

    if (field.includes('.')) {
        const [mainField, subField] = field.split('.');
        (actionToUpdate as any)[mainField] = {
            ...(actionToUpdate as any)[mainField],
            [subField]: value,
        };
    } else {
        (actionToUpdate as any)[field] = value;
    }
    
    newRules[ruleIndex].actions[actionIndex] = actionToUpdate;
    setEditableRules(newRules);
  };

  const addAction = (ruleIndex: number) => {
    const newRules = [...editableRules];
    newRules[ruleIndex].actions.push({
        id: `act-${Date.now()}`,
        transactionType: 'Debit',
        account: '',
        costCenters: { center1: '', center2: '', center3: '' },
        lineDescription: '',
    });
    setEditableRules(newRules);
  };

  const removeAction = (ruleIndex: number, actionIndex: number) => {
    const newRules = [...editableRules];
    newRules[ruleIndex].actions.splice(actionIndex, 1);
    setEditableRules(newRules);
  };

  const addRule = () => {
    setEditableRules([
      ...editableRules,
      {
        id: `rule-${Date.now()}`,
        isActive: true,
        warehouseId: warehouses[0]?.id || 0,
        docTypeCode: docTypeInfos[0]?.id || 0,
        docDescription: '',
        actions: [],
      },
    ]);
  };
  
  const handleAppendGeneratedRules = (generatedRules: AccountingRule[]) => {
      setEditableRules(prev => [...prev, ...generatedRules]);
  };

  const removeRule = (ruleIndex: number) => {
    const newRules = editableRules.filter((_, i) => i !== ruleIndex);
    setEditableRules(newRules);
  };

  const handleSaveChanges = () => {
    const newErrors: Record<string, any> = {};
    let hasError = false;

    editableRules.forEach((rule) => {
        if (!rule.isActive) return;

        const ruleErrors: Record<string, any> = {};

        if (!rule.docDescription.trim()) {
            ruleErrors.docDescription = 'شرح کلی سند الزامی است.';
            hasError = true;
        }

        if (rule.actions.length === 0) {
            ruleErrors.actions = 'حداقل یک ردیف آرتیکل برای قانون فعال الزامی است.';
            hasError = true;
        } else {
            const actionErrors: Record<string, any> = {};
            rule.actions.forEach((action) => {
                const currentActionErrors: Record<string, string> = {};
                if (!action.account) {
                    currentActionErrors.account = 'انتخاب حساب الزامی است.';
                    hasError = true;
                }
                if (!action.lineDescription.trim()) {
                    currentActionErrors.lineDescription = 'شرح ردیف الزامی است.';
                    hasError = true;
                }
                if (Object.keys(currentActionErrors).length > 0) {
                    actionErrors[action.id] = currentActionErrors;
                }
            });
            if (Object.keys(actionErrors).length > 0) {
                ruleErrors.actionDetails = actionErrors;
            }
        }
        
        if (Object.keys(ruleErrors).length > 0) {
            newErrors[rule.id] = ruleErrors;
        }
    });

    setErrors(newErrors);

    if (!hasError) {
        onSave(editableRules);
        onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 modal-backdrop-animation" onClick={onClose}>
        <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-6 w-full max-w-[95vw] xl:max-w-7xl h-full max-h-[95vh] flex flex-col modal-content-animation text-[var(--text-primary)]" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3 mb-4">
            <h2 className="text-xl font-bold text-[var(--color-primary)]">ویرایش شابلون صدور اسناد</h2>
            <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-3xl font-light">&times;</button>
          </div>
          
          <div className="overflow-auto flex-grow space-y-4 pr-2">
            {editableRules.map((rule, ruleIndex) => (
              <div key={rule.id} className={`border border-[var(--border-color)] rounded-lg p-4 transition-colors ${!rule.isActive ? 'bg-[var(--background-primary)] opacity-70' : 'bg-[var(--background-secondary)]'}`}>
                <div className="flex items-start gap-4 mb-4 flex-wrap">
                   <input type="checkbox" checked={rule.isActive} onChange={e => handleRuleChange(ruleIndex, 'isActive', e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)] mt-1" />
                   <select value={rule.warehouseId} onChange={e => handleRuleChange(ruleIndex, 'warehouseId', Number(e.target.value))} className="p-2 border border-[var(--border-color-strong)] rounded-md min-w-48">
                      {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                   </select>
                   <select value={rule.docTypeCode} onChange={e => handleRuleChange(ruleIndex, 'docTypeCode', Number(e.target.value))} className="p-2 border border-[var(--border-color-strong)] rounded-md min-w-48">
                      {docTypeInfos.map(dt => <option key={dt.id} value={dt.id}>{dt.name}</option>)}
                   </select>
                   <div className="flex-grow">
                      <input 
                          type="text" 
                          placeholder="شرح کلی سند" 
                          value={rule.docDescription} 
                          onChange={e => handleRuleChange(ruleIndex, 'docDescription', e.target.value)} 
                          className={`w-full p-2 border rounded-md ${errors[rule.id]?.docDescription ? 'border-red-500' : 'border-[var(--border-color-strong)]'}`}
                      />
                      {errors[rule.id]?.docDescription && <p className="text-red-500 text-xs mt-1">{errors[rule.id].docDescription}</p>}
                   </div>
                   <button onClick={() => removeRule(ruleIndex)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-500/10 mt-1">
                      <TrashIcon />
                   </button>
                </div>

                {errors[rule.id]?.actions && <p className="text-red-500 text-xs mb-2">{errors[rule.id].actions}</p>}

                {/* Actions Table */}
                <table className="w-full text-xs text-right border-collapse">
                   <thead className="bg-[var(--background-tertiary)] text-[var(--text-secondary)]">
                      <tr>
                        <th className="p-2 border border-[var(--border-color)]">نوع تراکنش</th>
                        <th className="p-2 border border-[var(--border-color)] min-w-[150px]">حساب</th>
                        <th className="p-2 border border-[var(--border-color)] min-w-[120px]">مرکز ۱</th>
                        <th className="p-2 border border-[var(--border-color)] min-w-[120px]">مرکز ۲</th>
                        <th className="p-2 border border-[var(--border-color)] min-w-[120px]">مرکز ۳</th>
                        <th className="p-2 border border-[var(--border-color)] min-w-[150px]">شرح ردیف</th>
                        <th className="p-2 border border-[var(--border-color)]"></th>
                      </tr>
                   </thead>
                   <tbody>
                      {rule.actions.map((action, actionIndex) => (
                          <tr key={action.id}>
                              <td className="p-1 border border-[var(--border-color)]"><select value={action.transactionType} onChange={e => handleActionChange(ruleIndex, actionIndex, 'transactionType', e.target.value)} className="w-full p-2 rounded-md border border-[var(--border-color-strong)]"><option value="Debit">بدهکار</option><option value="Credit">بستانکار</option></select></td>
                              <td className="p-1 border border-[var(--border-color)]"><select value={action.account} onChange={e => handleActionChange(ruleIndex, actionIndex, 'account', e.target.value)} className={`w-full p-2 rounded-md border ${errors[rule.id]?.actionDetails?.[action.id]?.account ? 'border-red-500' : 'border-[var(--border-color-strong)]'}`}><option value="">انتخاب کنید</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></td>
                              <td className="p-1 border border-[var(--border-color)]"><select value={action.costCenters.center1} onChange={e => handleActionChange(ruleIndex, actionIndex, 'costCenters.center1', e.target.value)} className="w-full p-2 rounded-md border border-[var(--border-color-strong)]"><option value="">انتخاب کنید</option>{costCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></td>
                              <td className="p-1 border border-[var(--border-color)]"><select value={action.costCenters.center2} onChange={e => handleActionChange(ruleIndex, actionIndex, 'costCenters.center2', e.target.value)} className="w-full p-2 rounded-md border border-[var(--border-color-strong)]"><option value="">انتخاب کنید</option>{costCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></td>
                              <td className="p-1 border border-[var(--border-color)]"><select value={action.costCenters.center3} onChange={e => handleActionChange(ruleIndex, actionIndex, 'costCenters.center3', e.target.value)} className="w-full p-2 rounded-md border border-[var(--border-color-strong)]"><option value="">انتخاب کنید</option>{costCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></td>
                              <td className="p-1 border border-[var(--border-color)]"><input type="text" value={action.lineDescription} onChange={e => handleActionChange(ruleIndex, actionIndex, 'lineDescription', e.target.value)} className={`w-full p-2 rounded-md border ${errors[rule.id]?.actionDetails?.[action.id]?.lineDescription ? 'border-red-500' : 'border-[var(--border-color-strong)]'}`} /></td>
                              <td className="p-1 border border-[var(--border-color)] text-center"><button onClick={() => removeAction(ruleIndex, actionIndex)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-500/10"><TrashIcon /></button></td>
                          </tr>
                      ))}
                   </tbody>
                </table>
                 <button onClick={() => addAction(ruleIndex)} className="mt-2 text-sm text-green-600 hover:text-green-500 font-semibold flex items-center gap-1 transition-colors">
                    <PlusIcon /> افزودن ردیف
                 </button>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
            <div className="flex gap-2">
                <button onClick={addRule} className="btn btn-secondary text-sm">
                    <PlusIcon /> افزودن قانون جدید
                </button>
                 <button onClick={() => setShowAutoTemplateModal(true)} className="btn btn-secondary text-sm">
                    <SparklesIcon /> تولید اتوماتیک شابلون
                </button>
            </div>
              <div className="flex gap-4 items-center">
                  {Object.keys(errors).length > 0 && <span className="text-red-500 text-sm animate-fade-in">لطفاً خطاهای مشخص‌شده را برطرف کنید.</span>}
                  <button onClick={onClose} className="btn btn-secondary">انصراف</button>
                  <button onClick={handleSaveChanges} className="btn btn-primary">ذخیره تغییرات</button>
              </div>
          </div>
        </div>
      </div>
      {showAutoTemplateModal && (
        <AutoTemplateModal
            allDocuments={allDocuments}
            currentRules={editableRules}
            warehouses={warehouses}
            docTypeInfos={docTypeInfos}
            accounts={accounts}
            costCenters={costCenters}
            onClose={() => setShowAutoTemplateModal(false)}
            onGenerate={handleAppendGeneratedRules}
        />
      )}
    </>
  );
};

export default TemplateModal;