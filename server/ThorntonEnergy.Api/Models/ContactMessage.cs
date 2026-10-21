namespace ThorntonEnergy.Api.Models;

public class ContactMessage
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public MessageTopic Topic { get; set; }
    public string? AccountNumber { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public MessageStatus Status { get; set; }
}