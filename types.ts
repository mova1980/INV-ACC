export enum DocumentType {
  Receipt = 'Receipt', // رسید
  Dispatch = 'Dispatch', // حواله
}

export enum DocumentStatus {
    Sent = 'Sent', // ارسال شده
    Issue = 'Issue', // دارای اشکال
    NoTemplate = 'NoTemplate', // فاقد شابلون
}

export interface Warehouse {
    id: string;
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

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number; // ریال
}

export interface InventoryDocument {
  id: string;
  warehouseId: string;
  warehouseName: string;
  type: DocumentType;
  date: string;
  items: InventoryItem[];
  status: DocumentStatus;
}

export interface JournalLine {
  account: string;
  debit: number; // بدهکار
  credit: number; // بستانکار
  description: string;
  costCenter?: string; // e.g. "101-20-5"
}

export interface JournalEntry {
  lines: JournalLine[];
}

export interface AccountingRule {
    id: string;
    isActive: boolean;
    warehouseId: string;
    docType: DocumentType;
    debitAccount: string;
    debitCostCenters: {
        center1: string;
        center2: string;
        center3: string;
    };
    creditAccount: string;
    creditCostCenters: {
        center1: string;
        center2: string;
        center3: string;
    };
    docDescription: string;
    lineDescription: string;
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