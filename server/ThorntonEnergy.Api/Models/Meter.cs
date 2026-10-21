namespace ThorntonEnergy.Api.Models;

public class Meter
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public string MeterNumber { get; set; } = string.Empty;
    public DateOnly InstallationDate { get; set; }
    public MeterStatus Status { get; set; }
    public List<MeterReading> Readings { get; set; } = [];
}