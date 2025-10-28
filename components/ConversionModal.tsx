import React, { useState, useMemo } from 'react';
import { InventoryDocument } from '../types';
import { CashIcon } from './icons/CashIcon';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface Props {
  docs: InventoryDocument[];
  onClose: () => void;
  onConfirm: (docs: InventoryDocument[], amount: number, date: string, description:string) => void;
}

const ConversionModal: React.FC<Props> = ({ docs, onClose, onConfirm }) => {
  useEscapeKey(onClose);
  const totalRemainingAmount = useMemo(() => {
    return docs.reduce((sum, doc) => sum + (doc.totalAmount - doc.convertedAmount), 0);
  }, [docs]);

  const [amountToConvert, setAmountToConvert] = useState(totalRemainingAmount);
  const [accountingDate, setAccountingDate] = useState('');
  const [accountingDescription, setAccountingDescription] = useState('');
  const [error, setError] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0) {
        setAmountToConvert(0);
    } else {
        setAmountToConvert(value);
    }
  };

  const handleConfirm = () => {
    if (amountToConvert <= 0) {
        setError('مبلغ تبدیل باید بیشتر از صفر باشد.');
        return;
    }
    if (amountToConvert > totalRemainingAmount) {
        setError(`مبلغ تبدیل نمی‌تواند از مبلغ باقیمانده (${totalRemainingAmount.toLocaleString('fa-IR')}) بیشتر باشد.`);
        return;
    }
    if (docs.length > 1 && !accountingDate.trim()) {
        setError('برای تبدیل چندین سند، وارد کردن تاریخ سند حسابداری الزامی است.');
        return;
    }
    
    const dateRegex = /^14\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/;
    if (accountingDate.trim() && !dateRegex.test(accountingDate.trim())) {
        setError('فرمت تاریخ صحیح نیست. لطفا از فرمت YYYY/MM/DD استفاده کنید (مثال: 1403/05/21).');
        return;
    }

    setError('');
    const finalDate = accountingDate.trim() || (docs.length === 1 ? docs[0].date : '');
    onConfirm(docs, amountToConvert, finalDate, accountingDescription);
  };
  
  const today = new Date().toLocaleDateString('fa-IR-u-nu-latn').replace(/\//g, '/');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center modal-backdrop-animation" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] text-[var(--text-primary)] rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col modal-content-animation" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3 mb-4">
          <h2 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
            <CashIcon />
            تایید تبدیل اسناد
          </h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-2xl font-bold">&times;</button>
        </div>
        
        <div className="space-y-4">
            <p className="text-[var(--text-secondary)]">
                شما در حال تبدیل <span className="font-bold text-[var(--text-primary)]">{docs.length}</span> سند انبار با مجموع مبلغ باقیمانده <span className="font-bold text-[var(--color-success)]">{totalRemainingAmount.toLocaleString('fa-IR')}</span> ریال هستید.
            </p>

            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-[var(--text-secondary)]">مبلغ مورد نظر برای تبدیل (ریال)</label>
                <input
                    type="number"
                    id="amount"
                    value={amountToConvert}
                    onChange={handleAmountChange}
                    className="mt-1 w-full p-2 rounded-md shadow-sm"
                />
            </div>
             <div>
                <label htmlFor="accDate" className="block text-sm font-medium text-[var(--text-secondary)]">تاریخ سند حسابداری (اختیاری)</label>
                <input
                    type="text"
                    id="accDate"
                    value={accountingDate}
                    onChange={(e) => setAccountingDate(e.target.value)}
                    placeholder={docs.length > 1 ? `الزامی برای ${docs.length} سند` : `پیش‌فرض: ${docs[0]?.date || today}`}
                    className="mt-1 w-full p-2 rounded-md shadow-sm"
                />
            </div>
             <div>
                <label htmlFor="accDesc" className="block text-sm font-medium text-[var(--text-secondary)]">شرح کلی سند (اختیاری)</label>
                <input
                    type="text"
                    id="accDesc"
                    value={accountingDescription}
                    onChange={(e) => setAccountingDescription(e.target.value)}
                    placeholder="در صورت خالی بودن، از شابلون استفاده می‌شود"
                    className="mt-1 w-full p-2 rounded-md shadow-sm"
                />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-500/10 p-2 rounded-md">{error}</p>}
        </div>

        <div className="mt-auto pt-6 flex justify-end gap-4 border-t border-[var(--border-color)]">
            <button onClick={onClose} className="btn btn-secondary">انصراف</button>
            <button onClick={handleConfirm} className="btn btn-primary min-w-48" disabled={amountToConvert <= 0}>
                تولید سند حسابداری
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConversionModal;
