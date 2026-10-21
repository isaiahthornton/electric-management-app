using System.Text.Json.Serialization;

namespace ThorntonEnergy.Api.Models;

public class Meter
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string MeterNumber { get; set; } = string.Empty;
    public DateOnly InstallationDate { get; set; }
    public MeterStatus Status { get; set; }

    [JsonIgnore] public Customer Customer { get; set; } = null!;
    [JsonIgnore] public List<MeterReading> Readings { get; set; } = [];
}