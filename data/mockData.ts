import { InventoryDocument, DocumentStatus, AccountingRule, Warehouse, Account, CostCenterItem, DatabaseSettings, DocTypeInfo, User, UserRole } from '../types';
// FIX: Import DocumentType from its source file enums.ts
import { DocumentType } from '../enums';

export const allUsers: User[] = [
    { id: 1, username: 'admin', name: 'مدیر سیستم', role: UserRole.Admin },
    { id: 2, username: 'f_manager', name: 'آقای حسینی', role: UserRole.FinancialManager },
    { id: 3, username: 'accountant', name: 'خانم محمدی', role: UserRole.Accountant },
    { id: 4, username: 'storekeeper_1000', name: 'علی اکبری', role: UserRole.Storekeeper, warehouseId: 1000 },
    { id: 5, username: 'storekeeper_1001', name: 'رضا قاسمی', role: UserRole.Storekeeper, warehouseId: 1001 },
];


// Comprehensive list of warehouses as requested (ray.Store)
export const allWarehouses: Warehouse[] = [
    { id: 1000, name: '1000-انبار محصول', workshop: 'سالن تولید A', manager: 'رضا محمدی', location: 'ساختمان اصلی - طبقه اول' },
    { id: 1001, name: '1001-انبار مواد اولیه', workshop: 'انبار مرکزی', manager: 'علی اکبری', location: 'ساختمان B - ورودی ۲' },
    { id: 1002, name: '1002-انبار قطعات یدکی', workshop: 'کارگاه فنی', manager: 'حسن قاسمی', location: 'ساختمان فنی - جنب تعمیرگاه' },
    { id: 1003, name: '1003-انبار ملزومات', workshop: 'انبار A', manager: 'علی انجیله ای', location: 'طبقه همکف' },
    { id: 1004, name: '1004-انبار ضایعات', workshop: 'محوطه باز', manager: 'جواد حسینی', location: 'انتهای محوطه کارخانه' },
    { id: 1005, name: '1005-انبار قرنطینه', workshop: 'آزمایشگاه', manager: 'مریم صالحی', location: 'ساختمان کنترل کیفیت' },
    { id: 1006, name: '1006-انبار کالای امانی ما', workshop: 'انبار فروش', manager: 'سارا سعیدی', location: 'ساختمان فروش - بخش ۳' },
    { id: 1007, name: '1007-انبار کالای امانی دیگران', workshop: 'انبار فروش', manager: 'سارا سعیدی', location: 'ساختمان فروش - بخش ۴' },
];

// Comprehensive list of document types as requested (ray.InvDocTyp)
export const docTypeInfos: DocTypeInfo[] = [
    { id: 10, name: '10-رسید خرید داخلی' },
    { id: 11, name: '11-رسید خرید خارجی' },
    { id: 12, name: '12-رسید برگشت از فروش' },
    { id: 13, name: '13-رسید انتقال بین انبارها' },
    { id: 14, name: '14-رسید مصرف' },
    { id: 15, name: '15-رسید برگشت از مصرف' },
    { id: 16, name: '16-رسید تولید' },
    { id: 40, name: '40-حواله فروش' },
    { id: 41, name: '41-حواله برگشت از خرید' },
    { id: 42, name: '42-حواله انتقال بین انبارها' },
    { id: 43, name: '43-حواله مصرف' },
    { id: 44, name: '44-حواله امانی' },
    { id: 45, name: '45-حواله ضایعات' },
];


export const allAccounts: Account[] = [
    { id: '110501', name: 'موجودی نقد و بانک' },
    { id: '110201', name: 'حسابهای دریافتنی تجاری' },
    { id: '110301', name: 'موجودی مواد و کالا' },
    { id: '210101', name: 'حسابهای پرداختنی تجاری' },
    { id: '410101', name: 'درآمد فروش' },
    { id: '510101', name: 'بهای تمام شده کالای فروش رفته' },
];
export const allCostCenters: CostCenterItem[] = [
    { id: 'C100', name: 'پروژه آلفا' },
    { id: 'C200', name: 'خط تولید گاما' },
    { id: 'C300', name: 'دپارتمان بازاریابی' },
];

export const databaseSettings: DatabaseSettings = {
  source: {
    server: 'DESKTOP-AN6UFIH',
    database: 'INV',
    headerTable: 'ray.InvHdrData',
    detailTable: 'ray.InvDtlData'
  },
  destination: {
    server: 'DESKTOP-AN6UFIH',
    database: 'INV',
    headerTable: 'ray.AcntAccHdr',
    detailTable: 'ray.AcntAccDtl'
  }
};

const testDocument: InventoryDocument = {
    id: 'unique-test-id-999', // Unique ID for React key
    docNo: '14030999', // Display ID
    date: '1403/05/10', // To match default year filter
    warehouseId: 1000, // Matches rule-1
    warehouseName: '1000-انبار محصول',
    docType: DocumentType.Dispatch,
    docTypeCode: 40, // Matches rule-1
    docTypeDescription: '40-حواله فروش',
    productCode: 'PROD-TEST',
    requestNumber: 'REQ-TEST',
    referenceDoc: 'REF-TEST',
    totalAmount: 2500000,
    convertedAmount: 0,
    status: DocumentStatus.ReadyForConversion,
    details: [
        { row: 1, itemId: 'T01', itemName: 'کالای ویژه تستی', quantity: 25, unitPrice: 100000, totalPrice: 2500000, costCenterId: 'C200', costCenterName: 'خط تولید گاما' }
    ],
};


const generatedDocuments: InventoryDocument[] = Array.from({ length: 50 }, (_, i) => {
    const docTypeInfo = docTypeInfos[i % docTypeInfos.length];
    const docType = [40, 41, 42, 43, 44, 45].includes(docTypeInfo.id) ? DocumentType.Dispatch : DocumentType.Receipt;
    const warehouse = allWarehouses[i % allWarehouses.length];
    const totalAmount = Math.floor(Math.random() * 5000000) + 500000;
    
    // All documents start as ReadyForConversion with zero converted amount.
    const convertedAmount = 0;
    const status = DocumentStatus.ReadyForConversion;
    
    const year = 1402 + (i % 3); // Distribute across 1402, 1403, 1404

    return {
        id: `gen-id-${year}-${i + 1}`,
        docNo: `${year}00${i + 1}`,
        date: `${year}/04/${(i % 28) + 1}`,
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        docType,
        docTypeCode: docTypeInfo.id,
        docTypeDescription: docTypeInfo.name,
        productCode: `PROD-${100+i}`,
        requestNumber: `REQ-${2000+i}`,
        referenceDoc: `REF-${3000+i}`,
        totalAmount,
        convertedAmount,
        status,
        details: [
            { row: 1, itemId: 'A101', itemName: 'کالای نمونه ۱', quantity: 10, unitPrice: totalAmount / 2 / 10, totalPrice: totalAmount / 2, costCenterId: 'C100', costCenterName: 'پروژه آلفا' },
            { row: 2, itemId: 'B202', itemName: 'کالای نمونه ۲', quantity: 5, unitPrice: totalAmount / 2 / 5, totalPrice: totalAmount / 2, costCenterId: 'C200', costCenterName: 'خط تولید گاما' }
        ],
    };
});

export const allDocuments: InventoryDocument[] = [testDocument, ...generatedDocuments];


export const accountingRules: AccountingRule[] = [
    {
        id: 'rule-1',
        isActive: true,
        warehouseId: 1000,
        docTypeCode: 40, // حواله فروش
        docDescription: 'فروش کالا از انبار محصول',
        actions: [
            { id: 'act-1-1', transactionType: 'Debit', account: '510101', costCenters: {center1: 'C200', center2: '', center3: ''}, lineDescription: 'بهای تمام شده کالای فروش رفته' },
            { id: 'act-1-2', transactionType: 'Credit', account: '110301', costCenters: {center1: '', center2: '', center3: ''}, lineDescription: 'خروج کالا از انبار محصول' },
        ]
    },
     {
        id: 'rule-2',
        isActive: true,
        warehouseId: 1001,
        docTypeCode: 10, // رسید خرید داخلی
        docDescription: 'خرید مواد اولیه',
        actions: [
            { id: 'act-2-1', transactionType: 'Debit', account: '110301', costCenters: {center1: '', center2: '', center3: ''}, lineDescription: 'ورود مواد اولیه به انبار' },
            { id: 'act-2-2', transactionType: 'Credit', account: '210101', costCenters: {center1: '', center2: '', center3: ''}, lineDescription: 'بستانکاری تامین کننده' },
        ]
    },
    {
        id: 'rule-3',
        isActive: true, // Was false
        warehouseId: 1002,
        docTypeCode: 43, // حواله مصرف
        docDescription: 'مصرف قطعات یدکی برای تولید',
        actions: [
            { id: 'act-3-1', transactionType: 'Debit', account: '510101', costCenters: {center1: 'C200', center2: '', center3: ''}, lineDescription: 'هزینه مصرف قطعات یدکی' },
            { id: 'act-3-2', transactionType: 'Credit', account: '110301', costCenters: {center1: '', center2: '', center3: ''}, lineDescription: 'خروج قطعات از انبار' },
        ]
    },
    {
        id: 'rule-4',
        isActive: true,
        warehouseId: 1000,
        docTypeCode: 12, // رسید برگشت از فروش
        docDescription: 'برگشت کالا از فروش به انبار محصول',
        actions: [
            { id: 'act-4-1', transactionType: 'Debit', account: '110301', costCenters: {center1: '', center2: '', center3: ''}, lineDescription: 'ورود کالای برگشتی به انبار محصول' },
            { id: 'act-4-2', transactionType: 'Credit', account: '510101', costCenters: {center1: 'C200', center2: '', center3: ''}, lineDescription: 'کاهش بهای تمام شده کالای فروش رفته' },
        ]
    },
    {
        id: 'rule-5',
        isActive: true,
        warehouseId: 1001,
        docTypeCode: 41, // حواله برگشت از خرید
        docDescription: 'برگشت مواد اولیه به تامین کننده',
        actions: [
            { id: 'act-5-1', transactionType: 'Debit', account: '210101', costCenters: {center1: '', center2: '', center3: ''}, lineDescription: 'کاهش بدهی به تامین کننده' },
            { id: 'act-5-2', transactionType: 'Credit', account: '110301', costCenters: {center1: '', center2: '', center3: ''}, lineDescription: 'خروج مواد اولیه از انبار' },
        ]
    },
    {
        id: 'rule-6',
        isActive: true,
        warehouseId: 1000,
        docTypeCode: 16, // رسید تولید
        docDescription: 'ورود محصول تولید شده به انبار',
        actions: [
            { id: 'act-6-1', transactionType: 'Debit', account: '110301', costCenters: {center1: '', center2: '', center3: ''}, lineDescription: 'ورود محصول به انبار محصول' },
            { id: 'act-6-2', transactionType: 'Credit', account: '510101', costCenters: {center1: 'C200', center2: '', center3: ''}, lineDescription: 'بستانکار کردن حساب تولید' },
        ]
    }
];