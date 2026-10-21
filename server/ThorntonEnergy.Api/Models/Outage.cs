namespace ThorntonEnergy.Api.Models;

public class Outage
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public string Address { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime TimeReported { get; set; }
    public DateTime? TimeResolved { get; set; }
    public OutageStatus Status { get; set; }
}