
import React, { useState, useMemo } from 'react';
import { GeneratedDocInfo, Account, ApprovalStatus } from '../types';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  generatedDocs: GeneratedDocInfo[];
  accounts: Account[];
}

const FinancialReportsModal: React.FC<Props> = ({ isOpen, onClose, generatedDocs, accounts }) => {
  useEscapeKey(onClose);
  const [activeTab, setActiveTab] = useState<'trialBalance' | 'generalLedger'>('trialBalance');

  const approvedDocs = useMemo(() => 
    generatedDocs.filter(doc => doc.approvalStatus === ApprovalStatus.Approved), 
    [generatedDocs]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 modal-backdrop-animation" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-6 w-full max-w-6xl h-full max-h-[95vh] flex flex-col modal-content-animation text-[var(--text-primary)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3 mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
            <CurrencyDollarIcon />
            گزارشات مالی
          </h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-3xl font-light">&times;</button>
        </div>

        <div className="flex border-b border-[var(--border-color)] mb-4">
            <button onClick={() => setActiveTab('trialBalance')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'trialBalance' ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]' : 'text-[var(--text-secondary)]'}`}>تراز آزمایشی</button>
            <button onClick={() => setActiveTab('generalLedger')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'generalLedger' ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]' : 'text-[var(--text-secondary)]'}`}>دفتر کل</button>
        </div>

        <div className="flex-grow overflow-auto">
            {activeTab === 'trialBalance' && <TrialBalance approvedDocs={approvedDocs} />}
            {activeTab === 'generalLedger' && <GeneralLedger approvedDocs={approvedDocs} allAccounts={accounts} />}
        </div>
      </div>
    </div>
  );
};

// Trial Balance Component
const TrialBalance: React.FC<{ approvedDocs: GeneratedDocInfo[] }> = ({ approvedDocs }) => {
    const trialBalanceData = useMemo(() => {
        const balances = new Map<string, { accountName: string, debit: number, credit: number }>();
        approvedDocs.forEach(doc => {
            doc.entry.lines.forEach(line => {
                const current = balances.get(line.accountCode) || { accountName: line.accountName, debit: 0, credit: 0 };
                current.debit += line.debit;
                current.credit += line.credit;
                balances.set(line.accountCode, current);
            });
        });

        const result: { accountCode: string, accountName: string, debit: number, credit: number }[] = [];
        balances.forEach((value, key) => {
            result.push({ accountCode: key, ...value });
        });
        
        return result.sort((a,b) => a.accountCode.localeCompare(b.accountCode));
    }, [approvedDocs]);

    const totalDebit = trialBalanceData.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = trialBalanceData.reduce((sum, item) => sum + item.credit, 0);

    return (
        <table className="w-full text-sm text-right">
            <thead className="sticky top-0 bg-[var(--background-tertiary)] text-[var(--text-secondary)] z-10">
                <tr>
                    <th className="p-2 font-medium">کد حساب</th>
                    <th className="p-2 font-medium w-1/2">نام حساب</th>
                    <th className="p-2 font-medium">بدهکار</th>
                    <th className="p-2 font-medium">بستانکار</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
                {trialBalanceData.map(item => (
                    <tr key={item.accountCode}>
                        <td className="p-2 font-mono">{item.accountCode}</td>
                        <td className="p-2">{item.accountName}</td>
                        <td className="p-2 font-mono">{item.debit > 0 ? item.debit.toLocaleString('fa-IR') : '-'}</td>
                        <td className="p-2 font-mono">{item.credit > 0 ? item.credit.toLocaleString('fa-IR') : '-'}</td>
                    </tr>
                ))}
            </tbody>
             <tfoot className="font-bold bg-[var(--background-tertiary)] text-[var(--text-primary)]">
                <tr className="border-t-2 border-[var(--border-color-strong)]">
                    <td className="p-2" colSpan={2}>جمع کل</td>
                    <td className="p-2 font-mono">{totalDebit.toLocaleString('fa-IR')}</td>
                    <td className="p-2 font-mono">{totalCredit.toLocaleString('fa-IR')}</td>
                </tr>
            </tfoot>
        </table>
    );
};

// General Ledger Component
const GeneralLedger: React.FC<{ approvedDocs: GeneratedDocInfo[], allAccounts: Account[] }> = ({ approvedDocs, allAccounts }) => {
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    
    const ledgerData = useMemo(() => {
        if (!selectedAccount) return [];
        let runningBalance = 0;
        const transactions: {date: string, description: string, debit: number, credit: number, balance: number}[] = [];

        approvedDocs.sort((a,b) => a.entry.date.localeCompare(b.entry.date)).forEach(doc => {
            doc.entry.lines.forEach(line => {
                if (line.accountCode === selectedAccount) {
                    runningBalance += line.debit - line.credit;
                    transactions.push({
                        date: doc.entry.date,
                        description: line.description || doc.entry.description,
                        debit: line.debit,
                        credit: line.credit,
                        balance: runningBalance,
                    });
                }
            });
        });
        return transactions;
    }, [selectedAccount, approvedDocs]);

    return (
        <div>
            <div className="mb-4">
                <label htmlFor="accountSelect" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">انتخاب حساب</label>
                <select id="accountSelect" value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)} className="w-full max-w-md p-2 rounded-md">
                    <option value="">یک حساب را انتخاب کنید...</option>
                    {allAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
            </div>
            {selectedAccount && (
                <table className="w-full text-sm text-right">
                    <thead className="sticky top-0 bg-[var(--background-tertiary)] text-[var(--text-secondary)] z-10">
                        <tr>
                            <th className="p-2 font-medium">تاریخ</th>
                            <th className="p-2 font-medium w-2/5">شرح</th>
                            <th className="p-2 font-medium">بدهکار</th>
                            <th className="p-2 font-medium">بستانکار</th>
                            <th className="p-2 font-medium">مانده</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                        {ledgerData.map((item, index) => (
                            <tr key={index}>
                                <td className="p-2 font-mono">{item.date}</td>
                                <td className="p-2 text-xs">{item.description}</td>
                                <td className="p-2 font-mono">{item.debit > 0 ? item.debit.toLocaleString('fa-IR') : '-'}</td>
                                <td className="p-2 font-mono">{item.credit > 0 ? item.credit.toLocaleString('fa-IR') : '-'}</td>
                                <td className="p-2 font-mono">{item.balance.toLocaleString('fa-IR')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default FinancialReportsModal;
      