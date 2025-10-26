import { InventoryDocument, DocumentType, Warehouse, AccountingRule, DocumentStatus, Account, CostCenterItem } from '../types';

export const warehouses: Warehouse[] = [
    { id: 'W-01', name: 'انبار مرکزی' },
    { id: 'W-02', name: 'انبار محصول' },
];

export const mockAccounts: Account[] = [
    { id: '1001001', name: 'موجودی مواد اولیه' },
    { id: '1001002', name: 'موجودی کالای ساخته شده' },
    { id: '2001001', name: 'حسابهای پرداختنی تجاری' },
    { id: '5001001', name: 'بهای تمام شده کالای فروش رفته' },
    { id: '1101001', name: 'حسابهای دریافتنی تجاری' },
    { id: '4001001', name: 'درآمد فروش' },
    { id: '1001003', name: 'پیش پرداخت خرید' },
];

export const mockCostCenters: CostCenterItem[] = [
    { id: '100-10-01', name: 'مواد اولیه' },
    { id: '110-20-05', name: 'محصول نهایی A' },
    { id: '200-00-00', name: 'عمومی' },
    { id: '500-10-01', name: 'فروش داخلی' },
    { id: '510-30-02', name: 'فروش صادراتی' },
    { id: '900-00-00', name: 'پروژه X' },
];


export const accountingRules: AccountingRule[] = [
    {
        id: 'rule-1',
        isActive: true,
        warehouseId: 'W-01',
        docType: DocumentType.Receipt,
        debitAccount: '1001001',
        debitCostCenters: { center1: '100-10-01', center2: '', center3: '' },
        creditAccount: '2001001',
        creditCostCenters: { center1: '200-00-00', center2: '', center3: '' },
        docDescription: 'بابت خرید مواد اولیه برای انبار مرکزی',
        lineDescription: 'خرید مواد اولیه'
    },
    {
        id: 'rule-2',
        isActive: true,
        warehouseId: 'W-02',
        docType: DocumentType.Receipt,
        debitAccount: '1001002',
        debitCostCenters: { center1: '110-20-05', center2: '', center3: '' },
        creditAccount: '2001001',
        creditCostCenters: { center1: '200-00-00', center2: '', center3: '' },
        docDescription: 'بابت رسید محصول تولید شده در انبار محصول',
        lineDescription: 'تولید محصول'
    },
    {
        id: 'rule-3',
        isActive: true,
        warehouseId: 'W-01',
        docType: DocumentType.Dispatch,
        debitAccount: '5001001',
        debitCostCenters: { center1: '500-10-01', center2: '', center3: '' },
        creditAccount: '1001001',
        creditCostCenters: { center1: '100-10-01', center2: '', center3: '' },
        docDescription: 'بابت حواله مواد اولیه از انبار مرکزی',
        lineDescription: 'مصرف مواد اولیه'
    },
    {
        id: 'rule-4',
        isActive: false,
        warehouseId: 'W-02',
        docType: DocumentType.Dispatch,
        debitAccount: '5001001',
        debitCostCenters: { center1: '510-30-02', center2: '900-00-00', center3: '' },
        creditAccount: '1001002',
        creditCostCenters: { center1: '110-20-05', center2: '', center3: '' },
        docDescription: 'بابت فروش کالا از انبار محصول',
        lineDescription: 'فروش محصول'
    }
];

export const allDocuments: InventoryDocument[] = [
  {
    id: 'R-1403-101',
    warehouseId: 'W-01',
    warehouseName: 'انبار مرکزی',
    type: DocumentType.Receipt,
    date: '1403/05/01',
    items: [
      { id: 'P-001', name: 'لپ تاپ Dell XPS 15', quantity: 10, unitPrice: 85000000 },
      { id: 'P-002', name: 'مانیتور LG 27-inch 4K', quantity: 20, unitPrice: 25000000 },
    ],
    status: DocumentStatus.Sent,
  },
  {
    id: 'D-1403-205',
    warehouseId: 'W-01',
    warehouseName: 'انبار مرکزی',
    type: DocumentType.Dispatch,
    date: '1403/05/03',
    items: [
      { id: 'P-001', name: 'لپ تاپ Dell XPS 15', quantity: 2, unitPrice: 85000000 },
    ],
    status: DocumentStatus.Sent,
  },
  {
    id: 'R-1403-102',
    warehouseId: 'W-02',
    warehouseName: 'انبار محصول',
    type: DocumentType.Receipt,
    date: '1403/05/05',
    items: [
      { id: 'P-003', name: 'کیبورد مکانیکال Logitech', quantity: 50, unitPrice: 4500000 },
      { id: 'P-004', name: 'موس بی‌سیم Razer', quantity: 50, unitPrice: 3200000 },
    ],
    status: DocumentStatus.Issue,
  },
  {
    id: 'D-1403-206',
    warehouseId: 'W-02',
    warehouseName: 'انبار محصول',
    type: DocumentType.Dispatch,
    date: '1403/05/10',
    items: [
      { id: 'P-002', name: 'مانیتور LG 27-inch 4K', quantity: 5, unitPrice: 25000000 },
      { id: 'P-003', name: 'کیبورد مکانیکال Logitech', quantity: 10, unitPrice: 4500000 },
    ],
    status: DocumentStatus.NoTemplate,
  },
];