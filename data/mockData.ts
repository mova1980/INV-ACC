import { InventoryDocument, DocumentType, DocumentStatus, AccountingRule, Warehouse, Account, CostCenterItem, DatabaseSettings, DocTypeInfo } from '../types';

// Comprehensive list of warehouses as requested (ray.Store)
export const allWarehouses: Warehouse[] = [
    { id: 1000, name: '1000-انبار محصول' },
    { id: 1001, name: '1001-انبار مواد اولیه' },
    { id: 1002, name: '1002-انبار قطعات یدکی' },
    { id: 1003, name: '1003-انبار ملزومات' },
    { id: 1004, name: '1004-انبار ضایعات' },
    { id: 1005, name: '1005-انبار قرنطینه' },
    { id: 1006, name: '1006-انبار کالای امانی ما' },
    { id: 1007, name: '1007-انبار کالای امانی دیگران' },
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
    const statusRoll = Math.random();
    let convertedAmount = 0;
    let status = DocumentStatus.ReadyForConversion;
    if (statusRoll > 0.7) {
        convertedAmount = Math.floor(totalAmount * (Math.random() * 0.5 + 0.2)); // 20% to 70%
        status = DocumentStatus.PartiallySettled;
    }
    
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
        isActive: false, // Inactive rule example
        warehouseId: 1002,
        docTypeCode: 43, // حواله مصرف
        docDescription: 'مصرف قطعات یدکی',
        actions: []
    }
];