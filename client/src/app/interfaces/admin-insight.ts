// Company-wide numbers from GET /api/admin/kpis (calculated by a SQL view)
export interface AdminKpis {
  activeCustomers: number;
  unpaidBalance: number;
  overdueBalance: number;
  revenueThisMonth: number;
  openOutages: number;
  avgKwhLastMonth: number;
}

// One month of GET /api/admin/usage-trend (calculated by a stored procedure)
export interface UsageTrendPoint {
  month: string; // first day of the month, 'YYYY-MM-DD'
  totalKwh: number;
  totalBilled: number;
}

// One row of GET /api/admin/activity (written by SQL triggers)
export interface AuditEntry {
  id: number;
  tableName: string;
  recordId: number;
  columnName: string;
  oldValue: string | null;
  newValue: string | null;
  changedAt: string;
  changedBy: string | null;
}
