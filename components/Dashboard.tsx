import React, { useMemo } from 'react';
import { InventoryDocument, GeneratedDocInfo, DocumentStatus } from '../types';
import PieChart from './charts/PieChart';
import BarChart, { GroupedBarChartData } from './charts/BarChart';
import { getDocStatusInfo } from '../utils/statusUtils';
import { PercentIcon } from './icons/PercentIcon';

// Simple icons for stat cards
const ValueIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5A6.5 6.5 0 015.5 12 6.5 6.5 0 0112 5.5a6.5 6.5 0 016.5 6.5 6.5 6.5 0 01-6.5 6.5z" /></svg>;
const DocIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const AllDocsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>

interface Props {
  inventoryDocuments: InventoryDocument[];
  generatedDocsInfo: GeneratedDocInfo[];
  onOpenViewDocsModal: (title: string, docs: InventoryDocument[]) => void;
  docHasTemplate: (doc: InventoryDocument) => boolean;
}

const Dashboard: React.FC<Props> = ({ inventoryDocuments, generatedDocsInfo, onOpenViewDocsModal, docHasTemplate }) => {

  const stats = useMemo(() => {
    const totalGeneratedValue = generatedDocsInfo.reduce((sum, doc) => sum + doc.entry.totalDebit, 0);
    const totalValue = inventoryDocuments.reduce((sum, doc) => sum + doc.totalAmount, 0);
    const readyForConversionCount = inventoryDocuments.filter(doc => doc.status === DocumentStatus.ReadyForConversion).length;
    const partiallySettledCount = inventoryDocuments.filter(doc => doc.status === DocumentStatus.PartiallySettled).length;
    const conversionRatio = totalValue > 0 ? (totalGeneratedValue / totalValue) * 100 : 0;

    return { totalGeneratedValue, totalValue, readyForConversionCount, partiallySettledCount, totalDocsCount: inventoryDocuments.length, conversionRatio };
  }, [inventoryDocuments, generatedDocsInfo]);

  const warehouseChartData = useMemo((): GroupedBarChartData[] => {
    const dataByWarehouse: { [key: string]: { total: number, converted: number } } = {};
    for (const doc of inventoryDocuments) {
        if (!dataByWarehouse[doc.warehouseName]) {
            dataByWarehouse[doc.warehouseName] = { total: 0, converted: 0 };
        }
        dataByWarehouse[doc.warehouseName].total += doc.totalAmount;
        dataByWarehouse[doc.warehouseName].converted += doc.convertedAmount;
    }
    return Object.entries(dataByWarehouse)
      .map(([label, values]) => ({
        label: label.split('-')[1]?.trim() || label,
        values: [
          { name: 'ارزش کل', value: values.total, color: 'var(--color-accent)' },
          { name: 'ارزش صادره', value: values.converted, color: 'var(--color-success)' }
        ]
      }))
      .sort((a,b) => b.values[0].value - a.values[0].value)
      .slice(0, 10); // show top 10 warehouses
  }, [inventoryDocuments]);
  
  const statusChartData = useMemo(() => {
    const statusCounts: { [key in DocumentStatus]?: number } = {};
    for (const doc of inventoryDocuments) {
        statusCounts[doc.status] = (statusCounts[doc.status] || 0) + 1;
    }
    
    return Object.entries(statusCounts).map(([status, value]) => {
      const statusInfo = getDocStatusInfo(status as DocumentStatus);
      const colorMap: { [key: string]: string } = {
        'آماده صدور': '#3b82f6', // blue-500
        'تسویه ناقص': '#f59e0b', // amber-500
        'سند صادر شده': '#8b5cf6' // violet-500
      };
      return {
        label: statusInfo.label,
        value: value || 0,
        color: colorMap[statusInfo.label] || '#6b7280' // gray-500
      };
    });
  }, [inventoryDocuments]);

  const valueDistributionData = useMemo(() => {
    const totalValue = inventoryDocuments.reduce((sum, doc) => sum + doc.totalAmount, 0);
    const totalConvertedValue = inventoryDocuments.reduce((sum, doc) => sum + doc.convertedAmount, 0);
    const remainingValue = totalValue - totalConvertedValue;

    if (totalValue === 0) return [];

    return [
        { label: 'ارزش صادره', value: totalConvertedValue, color: '#10b981' /* emerald-500 */ },
        { label: 'ارزش باقیمانده', value: remainingValue, color: '#64748b' /* slate-500 */ }
    ];
  }, [inventoryDocuments]);


  const statCards = [
    { 
      title: 'کلیه اسناد انبار', 
      value: stats.totalDocsCount.toLocaleString('fa-IR'), 
      icon: <AllDocsIcon />, 
      color: 'text-blue-500', 
      onClick: () => onOpenViewDocsModal('کلیه اسناد انبار', inventoryDocuments) 
    },
    { 
      title: 'اسناد آماده صدور', 
      value: stats.readyForConversionCount.toLocaleString('fa-IR'), 
      icon: <DocIcon />, 
      color: 'text-indigo-500', 
      onClick: () => onOpenViewDocsModal('اسناد آماده صدور', inventoryDocuments.filter(doc => doc.status === DocumentStatus.ReadyForConversion)) 
    },
    { 
      title: 'اسناد تسویه ناقص', 
      value: stats.partiallySettledCount.toLocaleString('fa-IR'), 
      icon: <DocIcon />, 
      color: 'text-amber-500', 
      onClick: () => onOpenViewDocsModal('اسناد تسویه ناقص', inventoryDocuments.filter(doc => doc.status === DocumentStatus.PartiallySettled)) 
    },
    { title: 'ارزش کل اسناد (ریال)', value: stats.totalValue.toLocaleString('fa-IR'), icon: <ValueIcon />, color: 'text-purple-500', onClick: null },
    { title: 'ارزش اسناد صادره (ریال)', value: stats.totalGeneratedValue.toLocaleString('fa-IR'), icon: <ValueIcon />, color: 'text-green-500', onClick: null },
    { title: 'نسبت اسناد صادره', value: `${stats.conversionRatio.toFixed(1)}%`, icon: <PercentIcon />, color: 'text-teal-500', onClick: null },
  ];

  return (
    <div className="relative flex-grow p-3 space-y-3 overflow-y-auto animate-fade-in">

        <h2 className="text-xl font-bold text-right text-[var(--text-primary)]">داشبورد مدیریت اسناد</h2>
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {statCards.map((card, index) => {
                 const isClickable = !!card.onClick;
                 return (
                 <div 
                    key={index} 
                    className={`bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-lg p-3 flex items-center gap-3 animate-slide-in-up ${isClickable ? 'cursor-pointer transition-transform hover:scale-105 hover:shadow-lg' : ''}`}
                    style={{ animationDelay: `${index * 100}ms`}}
                    onClick={card.onClick || undefined}
                 >
                     <div className={`p-3 bg-slate-100 dark:bg-slate-700 rounded-full ${card.color}`}>
                        {card.icon}
                     </div>
                     <div>
                        <p className="text-sm text-[var(--text-secondary)]">{card.title}</p>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{card.value}</p>
                     </div>
                 </div>
                 )
            })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="lg:col-span-2 bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-lg h-80 animate-slide-in-up" style={{ animationDelay: '400ms'}}>
                <BarChart data={warehouseChartData} title="ارزش کل در برابر ارزش صادره به تفکیک انبار" />
            </div>
             <div className="bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-lg h-72 animate-slide-in-up" style={{ animationDelay: '500ms'}}>
                <PieChart data={statusChartData} title="پراکندگی وضعیت اسناد انبار" />
            </div>
            <div className="bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-lg h-72 animate-slide-in-up" style={{ animationDelay: '600ms'}}>
                <PieChart data={valueDistributionData} title="توزیع ارزش اسناد (صادره / باقیمانده)" />
            </div>
        </div>

        <div className="text-center text-[var(--text-muted)] p-3">
            برای شروع عملیات، یک یا چند انبار را از منوی سمت راست انتخاب کنید.
        </div>
    </div>
  );
};

export default Dashboard;