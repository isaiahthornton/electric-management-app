using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThorntonEnergy.Api.Migrations
{
    /// <inheritdoc />
    public partial class AdminInsight : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TableName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RecordId = table.Column<int>(type: "int", nullable: false),
                    ColumnName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OldValue = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    NewValue = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ChangedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            // Audit triggers, KPI view and monthly-usage procedure (SQL written with AI help: see docs/AI-LOG.md)
            migrationBuilder.Sql(@"
CREATE TRIGGER dbo.trg_Bills_Audit ON dbo.Bills
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(Status)
        INSERT INTO dbo.AuditLogs (TableName, RecordId, ColumnName, OldValue, NewValue, ChangedAt, ChangedBy)
        SELECT N'Bills', i.Id, N'Status', CAST(d.Status AS nvarchar(100)), CAST(i.Status AS nvarchar(100)),
               CAST(SYSUTCDATETIME() AT TIME ZONE N'UTC' AT TIME ZONE N'Eastern Standard Time' AS datetime2), CAST(SESSION_CONTEXT(N'AppUser') AS nvarchar(256))
        FROM inserted i
        JOIN deleted d ON d.Id = i.Id
        WHERE ISNULL(CAST(i.Status AS nvarchar(100)), N'') <> ISNULL(CAST(d.Status AS nvarchar(100)), N'');
END");
            migrationBuilder.Sql(@"
CREATE TRIGGER dbo.trg_Customers_Audit ON dbo.Customers
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(Status)
        INSERT INTO dbo.AuditLogs (TableName, RecordId, ColumnName, OldValue, NewValue, ChangedAt, ChangedBy)
        SELECT N'Customers', i.Id, N'Status', CAST(d.Status AS nvarchar(100)), CAST(i.Status AS nvarchar(100)),
               CAST(SYSUTCDATETIME() AT TIME ZONE N'UTC' AT TIME ZONE N'Eastern Standard Time' AS datetime2), CAST(SESSION_CONTEXT(N'AppUser') AS nvarchar(256))
        FROM inserted i
        JOIN deleted d ON d.Id = i.Id
        WHERE ISNULL(CAST(i.Status AS nvarchar(100)), N'') <> ISNULL(CAST(d.Status AS nvarchar(100)), N'');
    IF UPDATE(RatePlanId)
        INSERT INTO dbo.AuditLogs (TableName, RecordId, ColumnName, OldValue, NewValue, ChangedAt, ChangedBy)
        SELECT N'Customers', i.Id, N'RatePlanId', CAST(d.RatePlanId AS nvarchar(100)), CAST(i.RatePlanId AS nvarchar(100)),
               CAST(SYSUTCDATETIME() AT TIME ZONE N'UTC' AT TIME ZONE N'Eastern Standard Time' AS datetime2), CAST(SESSION_CONTEXT(N'AppUser') AS nvarchar(256))
        FROM inserted i
        JOIN deleted d ON d.Id = i.Id
        WHERE ISNULL(CAST(i.RatePlanId AS nvarchar(100)), N'') <> ISNULL(CAST(d.RatePlanId AS nvarchar(100)), N'');
END");
            migrationBuilder.Sql(@"
CREATE TRIGGER dbo.trg_Outages_Audit ON dbo.Outages
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(Status)
        INSERT INTO dbo.AuditLogs (TableName, RecordId, ColumnName, OldValue, NewValue, ChangedAt, ChangedBy)
        SELECT N'Outages', i.Id, N'Status', CAST(d.Status AS nvarchar(100)), CAST(i.Status AS nvarchar(100)),
               CAST(SYSUTCDATETIME() AT TIME ZONE N'UTC' AT TIME ZONE N'Eastern Standard Time' AS datetime2), CAST(SESSION_CONTEXT(N'AppUser') AS nvarchar(256))
        FROM inserted i
        JOIN deleted d ON d.Id = i.Id
        WHERE ISNULL(CAST(i.Status AS nvarchar(100)), N'') <> ISNULL(CAST(d.Status AS nvarchar(100)), N'');
END");

            migrationBuilder.Sql(@"
CREATE VIEW dbo.vw_AdminKpis
AS
SELECT
    (SELECT COUNT(*) FROM dbo.Customers WHERE Status = N'Active')                         AS ActiveCustomers,
    (SELECT ISNULL(SUM(AmountDue), 0) FROM dbo.Bills WHERE Status <> N'Paid')             AS UnpaidBalance,
    (SELECT ISNULL(SUM(AmountDue), 0) FROM dbo.Bills
      WHERE Status <> N'Paid' AND DueDate < t.Today)                                      AS OverdueBalance,
    (SELECT ISNULL(SUM(AmountDue), 0) FROM dbo.Bills
      WHERE Status = N'Paid' AND PaidDate >= t.MonthStart AND PaidDate < DATEADD(MONTH, 1, t.MonthStart)) AS RevenueThisMonth,
    (SELECT COUNT(*) FROM dbo.Outages WHERE Status IN (N'Reported', N'InProgress'))       AS OpenOutages,
    (SELECT CAST(ISNULL(AVG(CAST(KwhUsed AS decimal(18, 2))), 0) AS decimal(18, 1)) FROM dbo.Bills
      WHERE PeriodStart >= DATEADD(MONTH, -1, t.MonthStart) AND PeriodStart < t.MonthStart) AS AvgKwhLastMonth
FROM (SELECT CAST(SYSUTCDATETIME() AT TIME ZONE N'UTC' AT TIME ZONE N'Eastern Standard Time' AS date) AS Today,
             DATEFROMPARTS(YEAR(CAST(SYSUTCDATETIME() AT TIME ZONE N'UTC' AT TIME ZONE N'Eastern Standard Time' AS date)), MONTH(CAST(SYSUTCDATETIME() AT TIME ZONE N'UTC' AT TIME ZONE N'Eastern Standard Time' AS date)), 1) AS MonthStart) AS t");

            migrationBuilder.Sql(@"
CREATE PROCEDURE dbo.usp_GetMonthlyUsage @Months int = 12
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Today date = CAST(SYSUTCDATETIME() AT TIME ZONE N'UTC' AT TIME ZONE N'Eastern Standard Time' AS date);
    DECLARE @ThisMonth date = DATEFROMPARTS(YEAR(@Today), MONTH(@Today), 1);
    DECLARE @From date = DATEADD(MONTH, -(@Months - 1), @ThisMonth);

    SELECT DATEFROMPARTS(YEAR(PeriodStart), MONTH(PeriodStart), 1) AS [Month],
           CAST(SUM(KwhUsed) AS bigint)                            AS TotalKwh,
           CAST(SUM(AmountDue) AS decimal(18, 2))                  AS TotalBilled
    FROM dbo.Bills
    WHERE PeriodStart >= @From AND PeriodStart < DATEADD(MONTH, 1, @ThisMonth)
    GROUP BY DATEFROMPARTS(YEAR(PeriodStart), MONTH(PeriodStart), 1)
    ORDER BY [Month];
END");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE dbo.usp_GetMonthlyUsage");
            migrationBuilder.Sql("DROP VIEW dbo.vw_AdminKpis");
            migrationBuilder.Sql("DROP TRIGGER dbo.trg_Outages_Audit");
            migrationBuilder.Sql("DROP TRIGGER dbo.trg_Customers_Audit");
            migrationBuilder.Sql("DROP TRIGGER dbo.trg_Bills_Audit");

            migrationBuilder.DropTable(
                name: "AuditLogs");
        }
    }
}
