import React, { useState, useEffect, useCallback } from 'react';
import { DatabaseSettings } from '../types';
import ComboBox, { Option } from './ComboBox';
import { mockServers, mockDatabases, mockTables } from '../data/mockDatabaseSchema';
import Spinner from './Spinner';

interface Props {
  initialSettings: DatabaseSettings;
  onSave: (settings: DatabaseSettings) => void;
  onClose: () => void;
}

const DatabaseSettingsModal: React.FC<Props> = ({ initialSettings, onSave, onClose }) => {
  const [settings, setSettings] = useState<DatabaseSettings>(initialSettings);

  const [serverOptions] = useState<Option[]>(mockServers.map(s => ({ value: s.id, label: s.name })));
  
  const [sourceDbOptions, setSourceDbOptions] = useState<Option[]>([]);
  const [sourceTableOptions, setSourceTableOptions] = useState<Option[]>([]);
  const [isSourceDbLoading, setIsSourceDbLoading] = useState(false);
  const [isSourceTableLoading, setIsSourceTableLoading] = useState(false);

  const [destDbOptions, setDestDbOptions] = useState<Option[]>([]);
  const [destTableOptions, setDestTableOptions] = useState<Option[]>([]);
  const [isDestDbLoading, setIsDestDbLoading] = useState(false);
  const [isDestTableLoading, setIsDestTableLoading] = useState(false);


  const loadDatabases = useCallback((server: string, setOptions: React.Dispatch<React.SetStateAction<Option[]>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (!server) return;
    setLoading(true);
    setTimeout(() => {
      const dbs = mockDatabases[server] || [];
      setOptions(dbs.map(db => ({ value: db.id, label: db.name })));
      setLoading(false);
    }, 500);
  }, []);

  const loadTables = useCallback((database: string, setOptions: React.Dispatch<React.SetStateAction<Option[]>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (!database) return;
    setLoading(true);
    setTimeout(() => {
      const tables = mockTables[database] || [];
      setOptions(tables.map(t => ({ value: t.id, label: t.name })));
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if(initialSettings.source.server) loadDatabases(initialSettings.source.server, setSourceDbOptions, setIsSourceDbLoading);
    if(initialSettings.source.database) loadTables(initialSettings.source.database, setSourceTableOptions, setIsSourceTableLoading);
    if(initialSettings.destination.server) loadDatabases(initialSettings.destination.server, setDestDbOptions, setIsDestDbLoading);
    if(initialSettings.destination.database) loadTables(initialSettings.destination.database, setDestTableOptions, setIsDestTableLoading);
  }, [initialSettings, loadDatabases, loadTables]);


  const handleChange = (section: 'source' | 'destination', field: keyof DatabaseSettings['source'] | keyof DatabaseSettings['destination'], value: string) => {
    setSettings(prev => {
        const newSettings = {
            ...prev,
            [section]: { ...prev[section], [field]: value },
        };
        
        // Reset dependent fields
        if (field === 'server') {
            newSettings[section].database = '';
            newSettings[section].headerTable = '';
            if ('detailTable' in newSettings[section]) {
                (newSettings[section] as any).detailTable = '';
            }
        }
        if (field === 'database') {
             newSettings[section].headerTable = '';
            if ('detailTable' in newSettings[section]) {
                (newSettings[section] as any).detailTable = '';
            }
        }
        return newSettings;
    });

    if (field === 'server') {
        if (section === 'source') {
            setSourceDbOptions([]);
            setSourceTableOptions([]);
            loadDatabases(value, setSourceDbOptions, setIsSourceDbLoading);
        } else {
            setDestDbOptions([]);
            setDestTableOptions([]);
            loadDatabases(value, setDestDbOptions, setIsDestDbLoading);
        }
    }
    if (field === 'database') {
        if (section === 'source') {
            setSourceTableOptions([]);
            loadTables(value, setSourceTableOptions, setIsSourceTableLoading);
        } else {
            setDestTableOptions([]);
            loadTables(value, setDestTableOptions, setIsDestTableLoading);
        }
    }
  };


  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center modal-backdrop-animation" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col modal-content-animation" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-[var(--color-primary)]">تنظیمات اتصال به دیتابیس</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
        </div>
        
        <div className="overflow-y-auto space-y-6 p-2">
            {/* Source Settings */}
            <fieldset className="border rounded-lg p-4">
                <legend className="px-2 font-semibold text-lg text-slate-700">مبدا (انبارداری)</legend>
                <div className="space-y-4 mt-2">
                    <ComboBox label="نام سرور SQL" options={serverOptions} value={settings.source.server} onChange={val => handleChange('source', 'server', val)} placeholder="انتخاب یا جستجوی سرور..." isLoading={isSourceDbLoading} />
                    <ComboBox label="نام دیتابیس" options={sourceDbOptions} value={settings.source.database} onChange={val => handleChange('source', 'database', val)} placeholder="انتخاب یا جستجوی دیتابیس..." disabled={!settings.source.server || isSourceDbLoading} isLoading={isSourceTableLoading} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ComboBox label="جدول اصلی اسناد" options={sourceTableOptions} value={settings.source.headerTable} onChange={val => handleChange('source', 'headerTable', val)} placeholder="انتخاب جدول..." disabled={!settings.source.database || isSourceTableLoading} />
                        <ComboBox label="جدول اقلام اسناد" options={sourceTableOptions} value={settings.source.detailTable} onChange={val => handleChange('source', 'detailTable', val)} placeholder="انتخاب جدول..." disabled={!settings.source.database || isSourceTableLoading} />
                    </div>
                </div>
            </fieldset>

            {/* Destination Settings */}
            <fieldset className="border rounded-lg p-4">
                <legend className="px-2 font-semibold text-lg text-slate-700">مقصد (حسابداری)</legend>
                 <div className="space-y-4 mt-2">
                    <ComboBox label="نام سرور SQL" options={serverOptions} value={settings.destination.server} onChange={val => handleChange('destination', 'server', val)} placeholder="انتخاب یا جستجuy سرور..." isLoading={isDestDbLoading} />
                    <ComboBox label="نام دیتابیس" options={destDbOptions} value={settings.destination.database} onChange={val => handleChange('destination', 'database', val)} placeholder="انتخاب یا جستجوی دیتابیس..." disabled={!settings.destination.server || isDestDbLoading} isLoading={isDestTableLoading} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ComboBox label="جدول هدر اسناد حسابداری" options={destTableOptions} value={settings.destination.headerTable} onChange={val => handleChange('destination', 'headerTable', val)} placeholder="انتخاب جدول..." disabled={!settings.destination.database || isDestTableLoading} />
                        <ComboBox label="جدول جزئیات اسناد حسابداری" options={destTableOptions} value={settings.destination.detailTable} onChange={val => handleChange('destination', 'detailTable', val)} placeholder="انتخاب جدول..." disabled={!settings.destination.database || isDestTableLoading} />
                    </div>
                </div>
            </fieldset>
        </div>

        <div className="mt-auto pt-4 flex justify-end gap-4 border-t">
            <button onClick={onClose} className="btn btn-secondary">انصراف</button>
            <button onClick={handleSave} className="btn btn-primary">ذخیره تغییرات</button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSettingsModal;