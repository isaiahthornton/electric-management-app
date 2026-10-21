namespace ThorntonEnergy.Api.Models;

public class MeterReading
{
    public int Id { get; set; }
    public int MeterId { get; set; }
    public Meter Meter { get; set; } = null!;
    public DateOnly ReadingDate { get; set; }
    public int ReadingValue { get; set; }
}