namespace ThorntonEnergy.Api.Models;

public class Customer
{
    public int Id { get; set; }
    public string AccountNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ServiceAddress { get; set; } = string.Empty;
    public int RatePlanId { get; set; }
    public RatePlan RatePlan { get; set; } = null!;
    public AccountStatus Status { get; set; }
    public List<Meter> Meters { get; set; } = [];
    public List<Bill> Bills { get; set; } = [];
    public List<Outage> Outages { get; set; } = [];
}