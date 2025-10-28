import React, { useState, useEffect, useMemo } from 'react';
import { GeneratedDocInfo, JournalEntry, JournalLine, Account, CostCenterItem } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface Props {
  docInfo: GeneratedDocInfo;
  accounts: Account[];
  costCenters: CostCenterItem[];
  onSave: (docId: string, updatedEntry: JournalEntry) => void;
  onClose: () => void;
}

const EditAccountingDocModal: React.FC<Props> = ({ docInfo, accounts, costCenters, onSave, onClose }) => {
  useEscapeKey(onClose);
  const [editableEntry, setEditableEntry] = useState<JournalEntry>(JSON.parse(JSON.stringify(docInfo.entry)));
  const [error, setError] = useState('');

  useEffect(() => {
    // Recalculate totals whenever lines change
    const totalDebit = editableEntry.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = editableEntry.lines.reduce((sum, line) => sum + line.credit, 0);
    setEditableEntry(prev => ({ ...prev, totalDebit, totalCredit }));
  }, [editableEntry.lines]);

  const handleHeaderChange = (field: 'date' | 'description', value: string) => {
    setEditableEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleLineChange = (index: number, field: keyof JournalLine, value: string | number) => {
    const newLines = [...editableEntry.lines];
    const lineToUpdate = { ...newLines[index] };
    
    if (field === 'accountCode') {
        const selectedAccount = accounts.find(a => a.id === value);
        lineToUpdate.accountCode = selectedAccount?.id || '';
        lineToUpdate.accountName = selectedAccount?.name || '';
    } else if (field === 'debit' || field === 'credit') {
        const numValue = Number(value);
        (lineToUpdate as any)[field] = isNaN(numValue) ? 0 : numValue;
    } 
    else {
        (lineToUpdate as any)[field] = value;
    }

    newLines[index] = lineToUpdate;
    setEditableEntry(prev => ({ ...prev, lines: newLines }));
  };

  const addLine = () => {
    const newLines = [...editableEntry.lines];
    const newRowNumber = newLines.length > 0 ? Math.max(...newLines.map(l => l.row)) + 1 : 1;
    newLines.push({
      row: newRowNumber,
      accountCode: '',
      accountName: '',
      debit: 0,
      credit: 0,
      description: '',
      costCenter1: '',
      costCenter2: '',
      costCenter3: '',
    });
    setEditableEntry(prev => ({...prev, lines: newLines}));
  };

  const removeLine = (index: number) => {
    const newLines = editableEntry.lines.filter((_, i) => i !== index);
    setEditableEntry(prev => ({...prev, lines: newLines}));
  };

  const handleSaveChanges = () => {
    if (editableEntry.totalDebit !== editableEntry.totalCredit) {
        setError('جمع ستون بدهکار و بستانکار باید برابر باشد.');
        return;
    }
    if (editableEntry.totalDebit === 0) {
        setError('مبلغ سند نمی‌تواند صفر باشد.');
        return;
    }
    setError('');
    onSave(docInfo.id, editableEntry);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 modal-backdrop-animation" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-6 w-full max-w-6xl h-full max-h-[95vh] flex flex-col modal-content-animation text-[var(--text-primary)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3 mb-4">
          <h2 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
            <PencilIcon />
            ویرایش سند حسابداری
          </h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-3xl font-light">&times;</button>
        </div>
        
        <div className="flex-grow overflow-auto pr-2 space-y-4">
            {/* Header Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="docDate" className="text-sm font-medium text-[var(--text-secondary)]">تاریخ سند</label>
                    <input type="text" id="docDate" value={editableEntry.date} onChange={e => handleHeaderChange('date', e.target.value)} className="w-full p-2 mt-1 rounded-md" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="docDesc" className="text-sm font-medium text-[var(--text-secondary)]">شرح کلی سند</label>
                    <input type="text" id="docDesc" value={editableEntry.description} onChange={e => handleHeaderChange('description', e.target.value)} className="w-full p-2 mt-1 rounded-md" />
                </div>
            </div>

            {/* Lines Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                    <thead className="bg-[var(--background-tertiary)] text-[var(--text-secondary)]">
                    <tr>
                        <th className="p-2 border border-[var(--border-color)] min-w-[200px]">حساب</th>
                        <th className="p-2 border border-[var(--border-color)]">بدهکار</th>
                        <th className="p-2 border border-[var(--border-color)]">بستانکار</th>
                        <th className="p-2 border border-[var(--border-color)] min-w-[150px]">شرح ردیف</th>
                        <th className="p-2 border border-[var(--border-color)] min-w-[130px]">مرکز ۱</th>
                        <th className="p-2 border border-[var(--border-color)] min-w-[130px]">مرکز ۲</th>
                        <th className="p-2 border border-[var(--border-color)]"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {editableEntry.lines.map((line, index) => (
                        <tr key={index}>
                            <td className="p-1 border border-[var(--border-color)]"><select value={line.accountCode} onChange={e => handleLineChange(index, 'accountCode', e.target.value)} className="w-full p-2 rounded-md"><option value="">انتخاب کنید</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></td>
                            <td className="p-1 border border-[var(--border-color)]"><input type="number" value={line.debit} onChange={e => handleLineChange(index, 'debit', e.target.value)} className="w-full p-2 rounded-md" /></td>
                            <td className="p-1 border border-[var(--border-color)]"><input type="number" value={line.credit} onChange={e => handleLineChange(index, 'credit', e.target.value)} className="w-full p-2 rounded-md" /></td>
                            <td className="p-1 border border-[var(--border-color)]"><input type="text" value={line.description} onChange={e => handleLineChange(index, 'description', e.target.value)} className="w-full p-2 rounded-md" /></td>
                            <td className="p-1 border border-[var(--border-color)]"><select value={line.costCenter1} onChange={e => handleLineChange(index, 'costCenter1', e.target.value)} className="w-full p-2 rounded-md"><option value="">انتخاب</option>{costCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></td>
                            <td className="p-1 border border-[var(--border-color)]"><select value={line.costCenter2} onChange={e => handleLineChange(index, 'costCenter2', e.target.value)} className="w-full p-2 rounded-md"><option value="">انتخاب</option>{costCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></td>
                            <td className="p-1 border border-[var(--border-color)] text-center"><button onClick={() => removeLine(index)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-500/10"><TrashIcon /></button></td>
                        </tr>
                    ))}
                    </tbody>
                    <tfoot className="font-bold bg-[var(--background-tertiary)] text-[var(--text-primary)]">
                        <tr>
                            <td className="p-2 text-left">جمع کل</td>
                            <td className="p-2 font-mono">{editableEntry.totalDebit.toLocaleString('fa-IR')}</td>
                            <td className="p-2 font-mono">{editableEntry.totalCredit.toLocaleString('fa-IR')}</td>
                            <td colSpan={4}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <button onClick={addLine} className="mt-2 text-sm text-green-600 hover:text-green-500 font-semibold flex items-center gap-1 transition-colors">
                <PlusIcon /> افزودن ردیف
            </button>
        </div>
        
        {error && <p className="mt-3 text-sm text-red-600 bg-red-500/10 p-2 rounded-md">{error}</p>}

        <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
          <span className={`text-sm font-semibold ${editableEntry.totalDebit !== editableEntry.totalCredit ? 'text-red-500' : 'text-green-600'}`}>
            اختلاف: {(editableEntry.totalDebit - editableEntry.totalCredit).toLocaleString('fa-IR')}
          </span>
          <div className="flex gap-4">
            <button onClick={onClose} className="btn btn-secondary">انصراف</button>
            <button onClick={handleSaveChanges} className="btn btn-primary">ذخیره تغییرات</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAccountingDocModal;
