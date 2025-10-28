// Switched to using jspdf-autotable as a function call instead of a plugin to resolve TypeScript module augmentation issues. This avoids the need for module augmentation which was causing errors.
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { GeneratedDocInfo, InventoryDocument, Warehouse } from '../types';
import { vazirFont } from '../data/vazirFont';

const getFilename = (prefix: string, extension: string) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${prefix}-${year}-${month}-${day}.${extension}`;
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
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;bom' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', getFilename('Generated-Accounting-Docs', 'csv'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToXLS = (docs: GeneratedDocInfo[]) => {
    const data = docs.flatMap(docInfo => 
      docInfo.entry.lines.map(line => ({
        'تاریخ سند': docInfo.entry.date,
        'شرح کلی': docInfo.entry.description,
        'کد حساب': line.accountCode,
        'نام حساب': line.accountName,
        'بدهکار': line.debit,
        'بستانکار': line.credit,
        'شرح ردیف': line.description,
        'مرکز هزینه': [line.costCenter1, line.costCenter2, line.costCenter3].filter(Boolean).join(' - '),
        'انبارهای مبدا': docInfo.sourceWarehouseNames.join(' | ')
      }))
    );
  
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'اسناد حسابداری');
    XLSX.writeFile(workbook, getFilename('Generated-Accounting-Docs', 'xls'));
};


export const exportToPDF = async (docs: GeneratedDocInfo[]) => {
    const doc = new jsPDF();

    // Add the Vazir font for Persian character support
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
            font: 'Vazirmatn', // Use the added font
            halign: 'right', // Align text to the right for RTL
        },
        headStyles: {
            font: 'Vazirmatn', // Use the added font for header
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
        },
        didDrawPage: (data) => {
            // Header
            doc.setFont('Vazirmatn'); // Ensure font is set for header text
            doc.setFontSize(20);
            doc.setTextColor(40);
            doc.text('لیست اسناد حسابداری تولید شده', doc.internal.pageSize.getWidth() - data.settings.margin.right, 15, { align: 'right' });
        },
    });
    
    doc.save(getFilename('Generated-Accounting-Docs', 'pdf'));
};

// --- New Export Functions for Inventory Docs ---

export const exportInventoryDocsToCSV = (docs: InventoryDocument[], docHasTemplate: (doc: InventoryDocument) => boolean) => {
    const headers = ['شماره سند', 'تاریخ', 'نوع سند', 'انبار', 'تعداد کل', 'مبلغ کل', 'وضعیت', 'دارای شابلون'];
    const rows = docs.map(doc => {
        const totalQuantity = doc.details.reduce((sum, item) => sum + item.quantity, 0);
        return [
            doc.docNo,
            doc.date,
            `"${doc.docTypeDescription}"`,
            `"${doc.warehouseName}"`,
            totalQuantity,
            doc.totalAmount,
            doc.status,
            docHasTemplate(doc) ? 'بله' : 'خیر'
        ];
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;bom' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', getFilename('Inventory-Docs-Report', 'csv'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportInventoryDocsToXLS = (docs: InventoryDocument[], docHasTemplate: (doc: InventoryDocument) => boolean) => {
    const data = docs.map(doc => {
        const totalQuantity = doc.details.reduce((sum, item) => sum + item.quantity, 0);
        return {
            'شماره سند': doc.docNo,
            'تاریخ': doc.date,
            'نوع سند': doc.docTypeDescription,
            'انبار': doc.warehouseName,
            'تعداد کل': totalQuantity,
            'مبلغ کل': doc.totalAmount,
            'وضعیت': doc.status,
            'دارای شابلون': docHasTemplate(doc) ? 'بله' : 'خیر'
        }
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'اسناد انبار');
    XLSX.writeFile(workbook, getFilename('Inventory-Docs-Report', 'xls'));
};

export const exportInventoryDocsToPDF = async (docs: InventoryDocument[], docHasTemplate: (doc: InventoryDocument) => boolean) => {
    const doc = new jsPDF();
    
    // Add the Vazir font for Persian character support
    doc.addFileToVFS('Vazirmatn-Regular.ttf', vazirFont);
    doc.addFont('Vazirmatn-Regular.ttf', 'Vazirmatn', 'normal');
    doc.setFont('Vazirmatn');

    const tableColumns = ['شابلون', 'وضعیت', 'مبلغ کل', 'تعداد کل', 'انبار', 'نوع سند', 'تاریخ', 'شماره سند'];
    const tableRows = docs.map(doc => {
        const totalQuantity = doc.details.reduce((sum, item) => sum + item.quantity, 0);
        return [
            docHasTemplate(doc) ? 'دارد' : 'ندارد',
            doc.status,
            doc.totalAmount.toLocaleString('fa-IR'),
            totalQuantity.toLocaleString('fa-IR'),
            doc.warehouseName,
            doc.docTypeDescription,
            doc.date,
            doc.docNo,
        ];
    });

    autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 20,
        styles: { 
            font: 'Vazirmatn', // Use the added font
            halign: 'right' 
        },
        headStyles: { 
            font: 'Vazirmatn', // Use the added font for header
            fillColor: [41, 128, 185], 
            textColor: 255, 
            fontStyle: 'bold' 
        },
        didDrawPage: (data) => {
            doc.setFont('Vazirmatn'); // Ensure font is set for header text
            doc.setFontSize(20);
            doc.setTextColor(40);
            doc.text('گزارش اسناد انبار', doc.internal.pageSize.getWidth() - data.settings.margin.right, 15, { align: 'right' });
        },
    });
    
    doc.save(getFilename('Inventory-Docs-Report', 'pdf'));
};

// --- New Export Functions for Warehouse Info ---

export const exportWarehousesToCSV = (warehouses: Warehouse[]) => {
    const headers = ['کد انبار', 'شرح انبار', 'کارگاه مرتبط', 'مسئول انبار', 'آدرس و محل انبار'];
    const rows = warehouses.map(wh => [
        wh.id,
        `"${wh.name.replace(/"/g, '""')}"`,
        `"${wh.workshop.replace(/"/g, '""')}"`,
        `"${wh.manager.replace(/"/g, '""')}"`,
        `"${wh.location.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;bom' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', getFilename('Warehouse-Info', 'csv'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportWarehousesToXLS = (warehouses: Warehouse[]) => {
    const data = warehouses.map(wh => ({
        'کد انبار': wh.id,
        'شرح انبار': wh.name,
        'کارگاه مرتبط': wh.workshop,
        'مسئول انبار': wh.manager,
        'آدرس و محل انبار': wh.location,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'اطلاعات انبارها');
    XLSX.writeFile(workbook, getFilename('Warehouse-Info', 'xls'));
};

export const exportWarehousesToPDF = async (warehouses: Warehouse[]) => {
    const doc = new jsPDF();
    
    doc.addFileToVFS('Vazirmatn-Regular.ttf', vazirFont);
    doc.addFont('Vazirmatn-Regular.ttf', 'Vazirmatn', 'normal');
    doc.setFont('Vazirmatn');

    const tableColumns = ['آدرس و محل انبار', 'مسئول انبار', 'کارگاه مرتبط', 'شرح انبار', 'کد انبار'];
    const tableRows = warehouses.map(wh => [
        wh.location,
        wh.manager,
        wh.workshop,
        wh.name,
        wh.id,
    ]);

    autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 20,
        styles: { 
            font: 'Vazirmatn',
            halign: 'right' 
        },
        headStyles: { 
            font: 'Vazirmatn',
            fillColor: [41, 128, 185], 
            textColor: 255, 
            fontStyle: 'bold' 
        },
        didDrawPage: (data) => {
            doc.setFont('Vazirmatn');
            doc.setFontSize(20);
            doc.setTextColor(40);
            doc.text('گزارش اطلاعات انبارها', doc.internal.pageSize.getWidth() - data.settings.margin.right, 15, { align: 'right' });
        },
    });
    
    doc.save(getFilename('Warehouse-Info', 'pdf'));
};