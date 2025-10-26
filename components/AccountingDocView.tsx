import React from 'react';
import { JournalEntry } from '../types';

interface Props {
  entry: JournalEntry;
}

const AccountingDocView: React.FC<Props> = ({ entry }) => {
  const { totalDebit, totalCredit, date, description, lines } = entry;

  return (
    <div className="bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-xl shadow-sm p-4 animate-slide-in-up">
       <div className="text-center mb-4 border-b border-[var(--border-color)] pb-3">
            <h4 className="font-bold text-lg text-[var(--text-primary)]">
                سند حسابداری تولید شده
            </h4>
            <div className="flex justify-around text-sm text-[var(--text-secondary)] mt-2">
                <span>تاریخ: <span className="font-semibold text-[var(--text-primary)]">{date}</span></span>
                <span className="max-w-md truncate">شرح: <span className="font-semibold text-[var(--text-primary)]">{description}</span></span>
            </div>
       </div>
      <table className="w-full text-sm text-right animated-table">
        <thead className="border-b-2 border-[var(--border-color-strong)] text-[var(--text-secondary)]">
          <tr>
            <th className="p-3 w-1/3 font-semibold">شرح حساب</th>
            <th className="p-3 w-1/6 font-semibold">مرکز هزینه</th>
            <th className="p-3 w-1/6 font-semibold">بدهکار (ریال)</th>
            <th className="p-3 w-1/6 font-semibold">بستانکار (ریال)</th>
            <th className="p-3 w-1/6 font-semibold">توضیحات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)]">
          {lines.map((line, index) => {
            const costCenter = [line.costCenter1, line.costCenter2, line.costCenter3].filter(Boolean).join(' - ');
            return (
                <tr 
                key={index} 
                className="list-item-animation"
                style={{ animationDelay: `${index * 70}ms` }}
                >
                <td className="p-3 font-medium">
                    {line.accountName}
                    <span className="block text-xs text-[var(--text-muted)] font-mono">{line.accountCode}</span>
                </td>
                <td className="p-3 text-[var(--text-secondary)] font-mono text-xs">{costCenter || '-'}</td>
                <td className="p-3 text-[var(--text-primary)] font-mono">{line.debit > 0 ? line.debit.toLocaleString('fa-IR') : '-'}</td>
                <td className="p-3 text-[var(--text-primary)] font-mono">{line.credit > 0 ? line.credit.toLocaleString('fa-IR') : '-'}</td>
                <td className="p-3 text-xs text-[var(--text-muted)]">{line.description}</td>
                </tr>
            );
        })}
        </tbody>
        <tfoot className="font-bold bg-[var(--background-tertiary)] text-[var(--text-primary)]">
            <tr>
                <td className="p-3" colSpan={2}>جمع کل</td>
                <td className="p-3 text-[var(--color-success)] font-mono">{totalDebit.toLocaleString('fa-IR')}</td>
                <td className="p-3 text-[var(--color-success)] font-mono">{totalCredit.toLocaleString('fa-IR')}</td>
                <td className="p-3"></td>
            </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default AccountingDocView;