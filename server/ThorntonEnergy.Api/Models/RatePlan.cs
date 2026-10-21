namespace ThorntonEnergy.Api.Models;

public class RatePlan
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal PricePerKwh { get; set; }
    public decimal MonthlyFee { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<Customer> Customers { get; set; } = [];
}