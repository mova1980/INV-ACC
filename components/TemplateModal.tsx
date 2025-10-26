import React, { useState } from 'react';
import { AccountingRule, DocumentType, Warehouse, Account, CostCenterItem } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface Props {
  rules: AccountingRule[];
  warehouses: Warehouse[];
  accounts: Account[];
  costCenters: CostCenterItem[];
  onSave: (rules: AccountingRule[]) => void;
  onClose: () => void;
}

const TemplateModal: React.FC<Props> = ({ rules, warehouses, accounts, costCenters, onSave, onClose }) => {
  const [editableRules, setEditableRules] = useState<AccountingRule[]>(JSON.parse(JSON.stringify(rules)));

  const handleRuleChange = (index: number, field: string, value: any) => {
    const newRules = [...editableRules];
    const ruleToUpdate = { ...newRules[index] };

    // Handle nested properties
    if (field.includes('.')) {
        const [mainField, subField] = field.split('.');
        (ruleToUpdate as any)[mainField] = {
            ...(ruleToUpdate as any)[mainField],
            [subField]: value,
        };
    } else {
        (ruleToUpdate as any)[field] = value;
    }
    
    newRules[index] = ruleToUpdate;
    setEditableRules(newRules);
  };

  const handleAddRule = () => {
    setEditableRules([
      ...editableRules,
      {
        id: `rule-${Date.now()}`,
        isActive: true,
        warehouseId: warehouses[0]?.id || '',
        docType: DocumentType.Receipt,
        debitAccount: '',
        debitCostCenters: { center1: '', center2: '', center3: '' },
        creditAccount: '',
        creditCostCenters: { center1: '', center2: '', center3: '' },
        docDescription: '',
        lineDescription: '',
      },
    ]);
  };

  const handleDeleteRule = (index: number) => {
    const newRules = editableRules.filter((_, i) => i !== index);
    setEditableRules(newRules);
  };

  const handleSaveChanges = () => {
    onSave(editableRules);
    onClose();
  };
  
  const totalRules = editableRules.length;
  const activeRules = editableRules.filter(r => r.isActive).length;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 modal-backdrop-animation"
        onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-[95vw] xl:max-w-7xl h-full max-h-[95vh] flex flex-col modal-content-animation"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start border-b pb-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-primary)]">ویرایش شابلون صدور اسناد</h2>
            <div className="text-xs text-gray-500 mt-2 flex items-center gap-4">
                <span>تعداد کل قوانین: <span className="font-semibold">{totalRules}</span></span>
                <span className="text-green-600">فعال: <span className="font-semibold">{activeRules}</span></span>
                <span className="text-red-600">غیرفعال: <span className="font-semibold">{totalRules - activeRules}</span></span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl font-light">&times;</button>
        </div>
        
        <div className="overflow-auto flex-grow">
            <table className="w-full text-xs text-right border-collapse">
                <thead className="sticky top-0 bg-gray-100 text-gray-700 z-10">
                    <tr>
                        <th rowSpan={2} className="p-2 border align-middle">فعال</th>
                        <th rowSpan={2} className="p-2 border align-middle">انبار</th>
                        <th rowSpan={2} className="p-2 border align-middle">نوع سند</th>
                        <th colSpan={4} className="p-2 border text-center">بدهکار</th>
                        <th colSpan={4} className="p-2 border text-center">بستانکار</th>
                        <th rowSpan={2} className="p-2 border align-middle min-w-[150px]">شرح سند</th>
                        <th rowSpan={2} className="p-2 border align-middle min-w-[150px]">شرح ردیف</th>
                        <th rowSpan={2} className="p-2 border align-middle"></th>
                    </tr>
                    <tr>
                        <th className="p-2 border min-w-[150px]">حساب</th>
                        <th className="p-2 border min-w-[120px]">مرکز ۱</th>
                        <th className="p-2 border min-w-[120px]">مرکز ۲</th>
                        <th className="p-2 border min-w-[120px]">مرکز ۳</th>
                        <th className="p-2 border min-w-[150px]">حساب</th>
                        <th className="p-2 border min-w-[120px]">مرکز ۱</th>
                        <th className="p-2 border min-w-[120px]">مرکز ۲</th>
                        <th className="p-2 border min-w-[120px]">مرکز ۳</th>
                    </tr>
                </thead>
                <tbody>
                    {editableRules.map((rule, index) => (
                        <tr key={rule.id} className={`hover:bg-gray-50 ${!rule.isActive ? 'bg-red-50 text-gray-500' : ''}`}>
                            <td className="p-1 border text-center">
                                <input type="checkbox" checked={rule.isActive} onChange={e => handleRuleChange(index, 'isActive', e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]" />
                            </td>
                            <td className="p-1 border">
                                <select value={rule.warehouseId} onChange={e => handleRuleChange(index, 'warehouseId', e.target.value)} className="w-full p-2 border-gray-200 rounded-md focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]">
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </td>
                            <td className="p-1 border">
                                <select value={rule.docType} onChange={e => handleRuleChange(index, 'docType', e.target.value)} className="w-full p-2 border-gray-200 rounded-md focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]">
                                    <option value={DocumentType.Receipt}>رسید</option>
                                    <option value={DocumentType.Dispatch}>حواله</option>
                                </select>
                            </td>
                            {/* Debit Side */}
                            <td className="p-1 border"><select value={rule.debitAccount} onChange={e => handleRuleChange(index, 'debitAccount', e.target.value)} className="w-full p-2 border-gray-200 rounded-md"><option value="">انتخاب کنید</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></td>
                            <td className="p-1 border"><select value={rule.debitCostCenters.center1} onChange={e => handleRuleChange(index, 'debitCostCenters.center1', e.target.value)} className="w-full p-2 border-gray-200 rounded-md"><option value="">انتخاب کنید</option>{costCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></td>
                            <td className="p-1 border"><select value={rule.debitCostCenters.center2} onChange={e => handleRuleChange(index, 'debitCostCenters.center2', e.target.value)} className="w-full p-2 border-gray-200 rounded-md"><option value="">انتخاب کنید</option>{costCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></td>
                            <td className="p-1 border"><select value={rule.debitCostCenters.center3} onChange={e => handleRuleChange(index, 'debitCostCenters.center3', e.target.value)} className="w-full p-2 border-gray-200 rounded-md"><option value="">انتخاب کنید</option>{costCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></td>
                            {/* Credit Side */}
                            <td className="p-1 border"><select value={rule.creditAccount} onChange={e => handleRuleChange(index, 'creditAccount', e.target.value)} className="w-full p-2 border-gray-200 rounded-md"><option value="">انتخاب کنید</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></td>
                            <td className="p-1 border"><select value={rule.creditCostCenters.center1} onChange={e => handleRuleChange(index, 'creditCostCenters.center1', e.target.value)} className="w-full p-2 border-gray-200 rounded-md"><option value="">انتخاب کنید</option>{costCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></td>
                            <td className="p-1 border"><select value={rule.creditCostCenters.center2} onChange={e => handleRuleChange(index, 'creditCostCenters.center2', e.target.value)} className="w-full p-2 border-gray-200 rounded-md"><option value="">انتخاب کنید</option>{costCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></td>
                            <td className="p-1 border"><select value={rule.creditCostCenters.center3} onChange={e => handleRuleChange(index, 'creditCostCenters.center3', e.target.value)} className="w-full p-2 border-gray-200 rounded-md"><option value="">انتخاب کنید</option>{costCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></td>
                            
                            <td className="p-1 border">
                                <input type="text" value={rule.docDescription} onChange={e => handleRuleChange(index, 'docDescription', e.target.value)} className="w-full p-2 border-gray-200 rounded-md" />
                            </td>
                             <td className="p-1 border">
                                <input type="text" value={rule.lineDescription} onChange={e => handleRuleChange(index, 'lineDescription', e.target.value)} className="w-full p-2 border-gray-200 rounded-md" />
                            </td>
                            <td className="p-1 border text-center">
                                <button onClick={() => handleDeleteRule(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100">
                                    <TrashIcon />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="mt-4">
            <button onClick={handleAddRule} className="btn-secondary py-2 px-4 rounded-lg text-sm font-semibold">
                + افزودن قانون جدید
            </button>
        </div>
        <div className="mt-6 pt-4 flex justify-end gap-4 border-t">
            <button onClick={onClose} className="btn-secondary py-2 px-6 rounded-lg">انصراف</button>
            <button onClick={handleSaveChanges} className="btn-primary py-2 px-6 rounded-lg">ذخیره تغییرات</button>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;