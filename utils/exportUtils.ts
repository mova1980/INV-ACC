// Switched to using jspdf-autotable as a function call instead of a plugin to resolve TypeScript module augmentation issues. This avoids the need for module augmentation which was causing errors.
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GeneratedDocInfo } from '../types';
import { vazirFont } from '../data/vazirFont';

const getFilename = (extension: string) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `Generated-Accounting-Docs-${year}-${month}-${day}.${extension}`;
};


export const exportToCSV = (docs: GeneratedDocInfo[]) => {
    const headers = ['تاریخ سند', 'شرح کلی', 'مبلغ کل', 'انبارهای مبدا'];
    const rows = docs.map(docInfo => [
        docInfo.entry.date,
        `"${docInfo.entry.description.replace(/"/g, '""')}"`, // Handle quotes
        docInfo.entry.totalDebit,
        `"${docInfo.sourceWarehouseNames.join(' | ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    // Use BOM for UTF-8 to ensure Excel reads Persian characters correctly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-t;bom' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', getFilename('csv'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


export const exportToPDF = async (docs: GeneratedDocInfo[]) => {
    const doc = new jsPDF();

    // Add Vazirmatn font for Persian support
    doc.addFileToVFS('Vazirmatn-Regular.ttf', vazirFont);
    doc.addFont('Vazirmatn-Regular.ttf', 'Vazirmatn', 'normal');
    doc.setFont('Vazirmatn');

    const tableColumns = ['انبارهای مبدا', 'مبلغ کل', 'شرح کلی', 'تاریخ سند'];
    const tableRows = docs.map(docInfo => [
        docInfo.sourceWarehouseNames.join(' | '),
        docInfo.entry.totalDebit.toLocaleString('fa-IR'),
        docInfo.entry.description,
        docInfo.entry.date,
    ]);

    autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 20,
        styles: {
            font: 'Vazirmatn',
            halign: 'right', // Align text to the right for RTL
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
        },
        didDrawPage: (data) => {
            // Header
            doc.setFontSize(20);
            doc.setTextColor(40);
            doc.text('لیست اسناد حسابداری تولید شده', data.settings.margin.left, 15);
        },
    });
    
    doc.save(getFilename('pdf'));
};
