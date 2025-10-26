import React from 'react';
import { JournalEntry } from '../types';

interface Props {
  entry: JournalEntry;
  originalDocCount: number;
  totalAmount: number;
}

const AccountingDocView: React.FC<Props> = ({ entry, originalDocCount }) => {
  const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = entry.lines.reduce((sum, line) => sum + line.credit, 0);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 animate-slide-in-up">
       <div className="text-center mb-4">
            <h4 className="font-bold text-lg">
                {originalDocCount > 1 ? `سند حسابداری تجمیعی` : `سند حسابداری`}
            </h4>
            <p className="text-sm text-slate-500">
                {originalDocCount > 1 ? `بر اساس ${originalDocCount} سند انبار` : `مربوط به سند انبار`}
            </p>
       </div>
      <table className="w-full text-sm text-right">
        <thead className="border-b-2 border-slate-300 text-slate-600">
          <tr>
            <th className="p-3 w-1/3">شرح حساب</th>
            <th className="p-3 w-1/6">مرکز هزینه</th>
            <th className="p-3 w-1/6">بدهکار (ریال)</th>
            <th className="p-3 w-1/6">بستانکار (ریال)</th>
            <th className="p-3 w-1/6">توضیحات</th>
          </tr>
        </thead>
        <tbody>
          {entry.lines.map((line, index) => (
            <tr 
              key={index} 
              className="border-b border-slate-200 list-item-animation"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <td className="p-3 font-medium">{line.account}</td>
              <td className="p-3 text-slate-700 font-mono text-xs">{line.costCenter || '-'}</td>
              <td className="p-3 text-slate-700">{line.debit > 0 ? line.debit.toLocaleString('fa-IR') : '-'}</td>
              <td className="p-3 text-slate-700">{line.credit > 0 ? line.credit.toLocaleString('fa-IR') : '-'}</td>
              <td className="p-3 text-xs text-slate-500">{line.description}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="font-bold bg-slate-100">
            <tr>
                <td className="p-3" colSpan={2}>جمع کل</td>
                <td className="p-3 text-green-700">{totalDebit.toLocaleString('fa-IR')}</td>
                <td className="p-3 text-green-700">{totalCredit.toLocaleString('fa-IR')}</td>
                <td className="p-3"></td>
            </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default AccountingDocView;