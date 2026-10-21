using System.Text.Json.Serialization;

namespace ThorntonEnergy.Api.Models;

public class Bill
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public DateOnly PeriodStart { get; set; }
    public DateOnly PeriodEnd { get; set; }
    public DateOnly DueDate { get; set; }
    public int KwhUsed { get; set; }
    public decimal AmountDue { get; set; }
    public BillStatus Status { get; set; }
    public decimal EnergyCharge { get; set; }
    public decimal ServiceCharge { get; set; }
    public DateOnly? PaidDate { get; set; }

    [JsonIgnore] public Customer Customer { get; set; } = null!;
}