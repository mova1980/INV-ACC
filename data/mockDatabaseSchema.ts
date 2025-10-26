export const mockServers = [
  { id: 'SRV_INVENTORY', name: 'SRV_INVENTORY' },
  { id: 'SRV_FINANCE', name: 'SRV_FINANCE' },
  { id: 'SRV_PROD_01', name: 'SRV_PROD_01' },
  { id: 'SRV_TEST_DB', name: 'SRV_TEST_DB' },
];

export const mockDatabases: { [server: string]: { id: string, name: string }[] } = {
  SRV_INVENTORY: [
    { id: 'InventoryDB', name: 'InventoryDB' },
    { id: 'InventoryArchive', name: 'InventoryArchive' },
  ],
  SRV_FINANCE: [
    { id: 'AccountingDB', name: 'AccountingDB' },
    { id: 'FinanceReports', name: 'FinanceReports' },
  ],
  SRV_PROD_01: [
    { id: 'MainProduction', name: 'MainProduction' },
    { id: 'ERP_Core', name: 'ERP_Core' },
  ],
  SRV_TEST_DB: [
    { id: 'TestBed', name: 'TestBed' },
  ]
};

export const mockTables: { [database: string]: { id: string, name: string }[] } = {
    InventoryDB: [
        { id: 'InvDocs', name: 'InvDocs' },
        { id: 'InvDocItems', name: 'InvDocItems' },
        { id: 'Products', name: 'Products' },
        { id: 'Warehouses', name: 'Warehouses' },
    ],
    InventoryArchive: [
        { id: 'InvDocs_2022', name: 'InvDocs_2022' },
        { id: 'InvDocs_2023', name: 'InvDocs_2023' },
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
