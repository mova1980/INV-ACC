export enum DocumentType {
  Receipt = 'Receipt', // رسید
  Dispatch = 'Dispatch', // حواله
}

export enum DocumentStatus {
    ReadyForConversion = 'آماده صدور',
    PartiallySettled = 'تسویه ناقص',
    Issued = 'سند صادر شده', // New Status
}

export interface InventoryItem {
    row: number;
    itemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    costCenterId: string;
    costCenterName: string;
}

export interface InventoryDocument {
    id: string;
    docNo: string;
    date: string;
    warehouseId: number;
    warehouseName: string;
    docType: DocumentType;
    docTypeCode: number;
    docTypeDescription: string;
    productCode: string;
    requestNumber: string;
    referenceDoc: string;
    totalAmount: number;
    convertedAmount: number;
    details: InventoryItem[];
    status: DocumentStatus;
}

export interface JournalLine {
    row: number;
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
    description: string;
    costCenter1?: string;
    costCenter2?: string;
    costCenter3?: string;
}

export interface JournalEntry {
    date: string;
    description: string;
    totalDebit: number;
    totalCredit: number;
    lines: JournalLine[];
}

export interface GeneratedDocInfo {
  entry: JournalEntry;
  sourceDocIds: string[];
  sourceWarehouseNames: string[];
}


export interface RuleAction {
    id: string;
    transactionType: 'Debit' | 'Credit';
    account: string;
    costCenters: {
        center1: string;
        center2: string;
        center3: string;
    };
    lineDescription: string;
}

export interface AccountingRule {
    id: string;
    isActive: boolean;
    warehouseId: number;
    docTypeCode: number;
    docDescription: string;
    actions: RuleAction[];
}

export interface AutoGenRuleHint {
    id: string;
    transactionType: 'Debit' | 'Credit';
    account: string; // Account ID, empty if not specified
    costCenters: {
        center1: string; center2: string; center3: string;
    };
}

export interface Warehouse {
    id: number;
    name: string;
}

export interface DocTypeInfo {
    id: number;
    name: string;
}

export interface Account {
    id: string;
    name: string;
}
export interface CostCenterItem {
    id: string;
    name: string;
}


export interface DatabaseSettings {
    source: {
        server: string;
        database: string;
        headerTable: string;
        detailTable: string;
    };
    destination: {
        server: string;
        database: string;
        headerTable: string;
        detailTable: string;
    };
}

export interface FilterState {
    warehouse: string;
    docType: string;
    status: string;
    dateFrom: string;
    dateTo: string;
    minAmount: number | '';
    maxAmount: number | '';
}