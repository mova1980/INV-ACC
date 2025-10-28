import React from 'react';
import { Warehouse } from '../types';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  warehouses: Warehouse[];
  selectedWarehouseIds: Set<string>;
  onWarehouseSelectionChange: (id: string) => void;
  onSelectAllWarehouses: () => void;
}

const WarehouseSelectionModal: React.FC<Props> = ({ isOpen, onClose, warehouses, selectedWarehouseIds, onWarehouseSelectionChange, onSelectAllWarehouses }) => {
  useEscapeKey(onClose);
  if (!isOpen) return null;
  
  const allWarehousesSelected = selectedWarehouseIds.size === warehouses.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 modal-backdrop-animation" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-6 w-full max-w-md h-auto max-h-[80vh] flex flex-col modal-content-animation text-[var(--text-primary)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3 mb-4">
          <h2 className="text-xl font-bold text-[var(--color-primary)]">انتخاب انبار</h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-3xl font-light">&times;</button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 space-y-2">
            <button
                onClick={onSelectAllWarehouses}
                className={`w-full text-right p-3 rounded-lg transition-colors font-semibold ${allWarehousesSelected ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--background-tertiary)] hover:bg-[var(--border-color)]'}`}
            >
                {allWarehousesSelected ? 'لغو انتخاب همه انبارها' : 'انتخاب همه انبارها'}
            </button>
            <div className="border-t border-[var(--border-color)] my-2"></div>
            {warehouses.map(warehouse => {
                const isSelected = selectedWarehouseIds.has(warehouse.id.toString());
                return (
                    <label 
                        key={warehouse.id} 
                        className={`flex items-center w-full text-right p-3 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'hover:bg-[var(--background-tertiary)]'}`}
                    >
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onWarehouseSelectionChange(warehouse.id.toString())}
                            className="ml-4 h-5 w-5 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                        />
                        <span className="flex-grow">{warehouse.name}</span>
                    </label>
                );
            })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-end">
          <button onClick={onClose} className="btn btn-primary">بستن</button>
        </div>
      </div>
    </div>
  );
};

export default WarehouseSelectionModal;
