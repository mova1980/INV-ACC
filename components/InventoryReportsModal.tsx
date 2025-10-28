
import React, { useState, useMemo } from 'react';
import { InventoryDocument, Warehouse } from '../types';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { CubeIcon } from './icons/CubeIcon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  inventoryDocs: InventoryDocument[];
  warehouses: Warehouse[];
}

const InventoryReportsModal: React.FC<Props> = ({ isOpen, onClose, inventoryDocs, warehouses }) => {
  useEscapeKey(onClose);
  const [activeTab, setActiveTab] = useState<'warehouseValue' | 'turnover' | 'stagnant'>('warehouseValue');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 modal-backdrop-animation" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-6 w-full max-w-4xl h-full max-h-[95vh] flex flex-col modal-content-animation text-[var(--text-primary)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3 mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
            <CubeIcon />
            گزارشات انبار
          </h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-3xl font-light">&times;</button>
        </div>

        <div className="flex border-b border-[var(--border-color)] mb-4">
            <button onClick={() => setActiveTab('warehouseValue')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'warehouseValue' ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]' : 'text-[var(--text-secondary)]'}`}>ارزش موجودی انبار</button>
            <button onClick={() => setActiveTab('turnover')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'turnover' ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]' : 'text-[var(--text-secondary)]'}`}>نرخ گردش کالا</button>
            <button onClick={() => setActiveTab('stagnant')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'stagnant' ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]' : 'text-[var(--text-secondary)]'}`}>کالاهای راکد</button>
        </div>

        <div className="flex-grow overflow-auto">
            {activeTab === 'warehouseValue' && <WarehouseValueReport inventoryDocs={inventoryDocs} />}
            {activeTab === 'turnover' && <PlaceholderReport title="گزارش نرخ گردش کالا" />}
            {activeTab === 'stagnant' && <PlaceholderReport title="گزارش کالاهای راکد" />}
        </div>
      </div>
    </div>
  );
};

const WarehouseValueReport: React.FC<{ inventoryDocs: InventoryDocument[] }> = ({ inventoryDocs }) => {
    const warehouseValues = useMemo(() => {
        const valueMap = new Map<string, number>();
        inventoryDocs.forEach(doc => {
            const currentValue = valueMap.get(doc.warehouseName) || 0;
            // Note: This is a simplified calculation based on total document amounts, not real-time stock levels.
            valueMap.set(doc.warehouseName, currentValue + doc.totalAmount); 
        });
        return Array.from(valueMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [inventoryDocs]);

    return (
        <table className="w-full text-sm text-right">
            <thead className="sticky top-0 bg-[var(--background-tertiary)] text-[var(--text-secondary)] z-10">
                <tr>
                    <th className="p-2 font-medium w-2/3">نام انبار</th>
                    <th className="p-2 font-medium">ارزش کل موجودی (ریال)</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
                {warehouseValues.map(item => (
                    <tr key={item.name}>
                        <td className="p-2">{item.name}</td>
                        <td className="p-2 font-mono">{item.value.toLocaleString('fa-IR')}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const PlaceholderReport: React.FC<{ title: string }> = ({ title }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center text-[var(--text-muted)] p-8">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
            <p>این گزارش در حال حاضر در دست توسعه است و در نسخه‌های آینده در دسترس خواهد بود.</p>
            <p className="text-xs mt-4">برای پیاده‌سازی این گزارش، به داده‌های دقیق‌تر و محاسبات پیچیده‌تری نیاز است که در این نسخه آزمایشی فراهم نشده است.</p>
        </div>
    );
};


export default InventoryReportsModal;
      