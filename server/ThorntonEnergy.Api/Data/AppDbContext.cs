using Microsoft.EntityFrameworkCore;
using ThorntonEnergy.Api.Models;

namespace ThorntonEnergy.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<RatePlan> RatePlans => Set<RatePlan>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Meter> Meters => Set<Meter>();
    public DbSet<MeterReading> MeterReadings => Set<MeterReading>();
    public DbSet<Bill> Bills => Set<Bill>();
    public DbSet<Outage> Outages => Set<Outage>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Money uses 2 decimal places; the per-kWh rate needs 4 (e.g. 0.1450)
        modelBuilder.Entity<RatePlan>().Property(r => r.PricePerKwh).HasPrecision(10, 4);
        modelBuilder.Entity<RatePlan>().Property(r => r.MonthlyFee).HasPrecision(10, 2);
        modelBuilder.Entity<Bill>().Property(b => b.AmountDue).HasPrecision(10, 2);
        modelBuilder.Entity<Bill>().Property(b => b.EnergyCharge).HasPrecision(10, 2);
        modelBuilder.Entity<Bill>().Property(b => b.ServiceCharge).HasPrecision(10, 2);

        // Store enums as readable text ("Unpaid") instead of numbers (0)
        modelBuilder.Entity<Bill>().Property(b => b.Status).HasConversion<string>().HasMaxLength(20);
        modelBuilder.Entity<Customer>().Property(c => c.Status).HasConversion<string>().HasMaxLength(20);
        modelBuilder.Entity<Meter>().Property(m => m.Status).HasConversion<string>().HasMaxLength(20);
        modelBuilder.Entity<Outage>().Property(o => o.Status).HasConversion<string>().HasMaxLength(20);
        modelBuilder.Entity<ContactMessage>().Property(m => m.Topic).HasConversion<string>().HasMaxLength(20);
        modelBuilder.Entity<ContactMessage>().Property(m => m.Status).HasConversion<string>().HasMaxLength(20);
        modelBuilder.Entity<User>().Property(u => u.Role).HasConversion<string>().HasMaxLength(20);

        // No duplicates allowed
        modelBuilder.Entity<Customer>().HasIndex(c => c.AccountNumber).IsUnique();
        modelBuilder.Entity<Meter>().HasIndex(m => m.MeterNumber).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

        // Deleting a rate plan must not delete its customers
        modelBuilder.Entity<Customer>()
            .HasOne(c => c.RatePlan)
            .WithMany(r => r.Customers)
            .HasForeignKey(c => c.RatePlanId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}