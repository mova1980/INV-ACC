import React from 'react';
import { DatabaseSettings } from '../types';
import { ConnectionIcon } from './icons/ConnectionIcon';

interface Props {
  settings: DatabaseSettings;
}

const ConnectionStatus: React.FC<Props> = ({ settings }) => {
  return (
    <div className="border border-slate-200 rounded-lg p-3 text-xs text-slate-600 bg-slate-50 space-y-2">
      <div className="flex items-center gap-2 font-semibold text-slate-700">
        <ConnectionIcon />
        <span>وضعیت اتصال شبیه‌سازی شده</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium">مبدا (انبار):</span>
        <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded">{settings.source.server}/{settings.source.database}</span>
      </div>
       <div className="flex justify-between items-center">
        <span className="font-medium">مقصد (حسابداری):</span>
        <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded">{settings.destination.server}/{settings.destination.database}</span>
      </div>
    </div>
  );
};

export default ConnectionStatus;
