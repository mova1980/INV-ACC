export const mockServers = [
  { id: 'DESKTOP-AN6UFIH', name: 'DESKTOP-AN6UFIH' },
  { id: 'SRV_FINANCE', name: 'SRV_FINANCE' },
  { id: 'SRV_PROD_01', name: 'SRV_PROD_01' },
];

export const mockDatabases: { [server: string]: { id: string, name: string }[] } = {
  'DESKTOP-AN6UFIH': [
    { id: 'INV', name: 'INV' },
    { id: 'MASTER', name: 'MASTER' },
  ],
  SRV_FINANCE: [
    { id: 'AccountingDB', name: 'AccountingDB' },
    { id: 'FinanceReports', name: 'FinanceReports' },
  ],
  SRV_PROD_01: [
    { id: 'MainProduction', name: 'MainProduction' },
    { id: 'ERP_Core', name: 'ERP_Core' },
  ],
};

export const mockTables: { [database: string]: { id: string, name: string }[] } = {
    INV: [
        { id: 'ray.InvHdrData', name: 'ray.InvHdrData' },
        { id: 'ray.InvDtlData', name: 'ray.InvDtlData' },
        { id: 'ray.itemdata', name: 'ray.itemdata' },
        { id: 'ray.Store', name: 'ray.Store' },
        { id: 'ray.InvDocTyp', name: 'ray.InvDocTyp' },
        { id: 'ray.Unit', name: 'ray.Unit' },
        { id: 'ray.Center', name: 'ray.Center' },
        { id: 'ray.AcntAccHdr', name: 'ray.AcntAccHdr' },
        { id: 'ray.AcntAccDtl', name: 'ray.AcntAccDtl' },
        { id: 'ray.Account', name: 'ray.Account' },
    ],
    AccountingDB: [
        { id: 'AccDocs', name: 'AccDocs' },
        { id: 'AccDocItems', name: 'AccDocItems' },
        { id: 'ChartOfAccounts', name: 'ChartOfAccounts' },
        { id: 'CostCenters', name: 'CostCenters' },
    ],
    FinanceReports: [
        { id: 'MonthlyClosings', name: 'MonthlyClosings' },
        { id: 'YearlySummaries', name: 'YearlySummaries' },
    ]
};
