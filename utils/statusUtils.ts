import { DocumentStatus } from '../types';

interface StatusInfo {
    label: string;
    color: string;
    bgColor: string;
}

export const getDocStatusInfo = (status: DocumentStatus): StatusInfo => {
    switch (status) {
        case DocumentStatus.ReadyForConversion:
            return { 
                label: 'آماده صدور',
                color: 'text-blue-800 dark:text-blue-200', 
                bgColor: 'bg-blue-100 dark:bg-blue-900/50'
            };
        case DocumentStatus.PartiallySettled:
            return { 
                label: 'تسویه ناقص', 
                color: 'text-amber-800 dark:text-amber-200', 
                bgColor: 'bg-amber-100 dark:bg-amber-900/50'
            };
        case DocumentStatus.Issued:
            return {
                label: 'سند صادر شده',
                color: 'text-purple-800 dark:text-purple-200',
                bgColor: 'bg-purple-100 dark:bg-purple-900/50'
            };
        default:
            return { 
                label: 'نامشخص', 
                color: 'text-gray-800 dark:text-gray-200', 
                bgColor: 'bg-gray-100 dark:bg-gray-700'
            };
    }
};
