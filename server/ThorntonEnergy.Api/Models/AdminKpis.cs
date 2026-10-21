namespace ThorntonEnergy.Api.Models;

// One row from the vw_AdminKpis SQL view. It has no table and no key: EF only reads it.
public class AdminKpis
{
    public int ActiveCustomers { get; set; }
    public decimal UnpaidBalance { get; set; }
    public decimal OverdueBalance { get; set; }
    public decimal RevenueThisMonth { get; set; }
    public int OpenOutages { get; set; }
    public decimal AvgKwhLastMonth { get; set; }
}

// One row returned by the usp_GetMonthlyUsage stored procedure (not a table, so not in the DbContext)
public class MonthlyUsageRow
{
    public DateOnly Month { get; set; }   // first day of the month
    public long TotalKwh { get; set; }
    public decimal TotalBilled { get; set; }
}
