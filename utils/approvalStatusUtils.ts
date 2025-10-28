import { ApprovalStatus } from '../types';

interface StatusInfo {
    label: string;
    color: string;
    bgColor: string;
}

export const getApprovalStatusInfo = (status: ApprovalStatus): StatusInfo => {
    switch (status) {
        case ApprovalStatus.Draft:
            return {
                label: 'پیش‌نویس',
                color: 'text-amber-800 dark:text-amber-200',
                bgColor: 'bg-amber-100 dark:bg-amber-900/50'
            };
        case ApprovalStatus.Approved:
            return {
                label: 'تصویب شده',
                color: 'text-green-800 dark:text-green-200',
                bgColor: 'bg-green-100 dark:bg-green-900/50'
            };
        default:
            return {
                label: 'نامشخص',
                color: 'text-gray-800 dark:text-gray-200',
                bgColor: 'bg-gray-100 dark:bg-gray-700'
            };
    }
};
