import React from 'react';
import { InventoryDocument, DocumentType } from '../types';

interface Props {
  document: InventoryDocument;
}

const InventoryDocDetail: React.FC<Props> = ({ document }) => {
  const docTypeLabel = document.type === DocumentType.Receipt ? 'رسید انبار' : 'حواله انبار';
  const totalAmount = document.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <div className="animate-slide-in-up">
      <div className="flex justify-between items-start border-b pb-4 mb-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">{docTypeLabel} - {document.id}</h2>
            <p className="text-slate-500">تاریخ: {document.date}</p>
            <p className="text-slate-500 font-medium">انبار: {document.warehouseName}</p>
        </div>
        <div className="text-left">
            <p className="text-slate-500">مبلغ کل</p>
            <p className="text-2xl font-bold text-[var(--color-primary)]">{totalAmount.toLocaleString('fa-IR')} ریال</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3">کالا</th>
              <th className="p-3 text-center">تعداد</th>
              <th className="p-3">مبلغ واحد (ریال)</th>
              <th className="p-3">مبلغ کل (ریال)</th>
            </tr>
          </thead>
          <tbody>
            {document.items.map((item, index) => (
              <tr 
                key={item.id} 
                className="border-b hover:bg-slate-50 list-item-animation"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <td className="p-3 font-medium">{item.name}</td>
                <td className="p-3 text-center">{item.quantity}</td>
                <td className="p-3">{item.unitPrice.toLocaleString('fa-IR')}</td>
                <td className="p-3 font-semibold">{(item.quantity * item.unitPrice).toLocaleString('fa-IR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryDocDetail;