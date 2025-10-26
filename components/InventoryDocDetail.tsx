import React from 'react';
import { InventoryDocument } from '../types';
import { getDocStatusInfo } from '../utils/statusUtils';

interface Props {
  doc: InventoryDocument | null;
}

const InventoryDocDetail: React.FC<Props> = ({ doc }) => {
  if (!doc) {
    return null; // The parent component now handles the placeholder
  }
  
  const statusInfo = getDocStatusInfo(doc.status);

  return (
    <div className="bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-xl shadow-sm p-4 animate-fade-in">
        <div className="border-b border-[var(--border-color)] pb-3 mb-3">
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-lg text-[var(--text-primary)]">
                    جزئیات سند انبار شماره {doc.docNo}
                </h4>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                    {statusInfo.label}
                </span>
            </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm text-[var(--text-secondary)] mt-3">
                <span>انبار: <span className="font-semibold text-[var(--text-primary)]">{doc.warehouseName}</span></span>
                <span>تاریخ: <span className="font-semibold text-[var(--text-primary)]">{doc.date}</span></span>
                <span>نوع: <span className="font-semibold text-[var(--text-primary)]">{doc.docTypeDescription}</span></span>
                <span>کد محصول: <span className="font-semibold text-[var(--text-primary)] font-mono">{doc.productCode}</span></span>
                 <span>درخواست: <span className="font-semibold text-[var(--text-primary)] font-mono">{doc.requestNumber}</span></span>
                <span>سند مرجع: <span className="font-semibold text-[var(--text-primary)] font-mono">{doc.referenceDoc}</span></span>
            </div>
        </div>
      
      <table className="w-full text-sm text-right">
        <thead className="text-[var(--text-secondary)]">
          <tr className="border-b border-[var(--border-color)]">
            <th className="p-2 font-medium">ردیف</th>
            <th className="p-2 font-medium text-right w-2/5">نام کالا</th>
            <th className="p-2 font-medium">مرکز هزینه</th>
            <th className="p-2 font-medium">تعداد</th>
            <th className="p-2 font-medium">مبلغ واحد</th>
            <th className="p-2 font-medium">مبلغ کل</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)]">
          {doc.details.map((item) => (
            <tr key={item.row}>
              <td className="p-2">{item.row}</td>
              <td className="p-2 text-right">{item.itemName}</td>
              <td className="p-2 text-xs">{item.costCenterName}</td>
              <td className="p-2 font-mono">{item.quantity.toLocaleString('fa-IR')}</td>
              <td className="p-2 font-mono">{item.unitPrice.toLocaleString('fa-IR')}</td>
              <td className="p-2 font-mono">{item.totalPrice.toLocaleString('fa-IR')}</td>
            </tr>
          ))}
        </tbody>
         <tfoot className="font-bold text-[var(--text-primary)]">
            <tr className="border-t-2 border-[var(--border-color-strong)]">
                <td className="p-2" colSpan={5}>جمع کل سند</td>
                <td className="p-2 font-mono">{doc.totalAmount.toLocaleString('fa-IR')}</td>
            </tr>
            <tr>
                <td className="p-2 text-[var(--text-muted)]" colSpan={5}>مبلغ تبدیل شده</td>
                <td className="p-2 font-mono text-[var(--text-muted)]">{doc.convertedAmount.toLocaleString('fa-IR')}</td>
            </tr>
             <tr className="text-[var(--color-success)]">
                <td className="p-2" colSpan={5}>مبلغ باقیمانده</td>
                <td className="p-2 font-mono">{(doc.totalAmount - doc.convertedAmount).toLocaleString('fa-IR')}</td>
            </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default InventoryDocDetail;