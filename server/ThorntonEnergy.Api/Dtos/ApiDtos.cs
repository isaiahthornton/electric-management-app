using ThorntonEnergy.Api.Models;

namespace ThorntonEnergy.Api.Dtos;

// Auth
public record LoginRequest(string Email, string Password);
public record RegisterRequest(string AccountNumber, string Email, string Password);
public record UserResponse(int Id, string Email, UserRole Role, int? CustomerId); // SessionUser in Angular
public record AuthResponse(string Token, DateTime ExpiresAt, UserResponse User);  // AuthResponse in Angular

// PATCH bodies: only the fields Angular actually changes
public record BillPatch(BillStatus? Status, DateOnly? PaidDate);
public record CustomerPatch(int? RatePlanId, AccountStatus? Status);
public record MeterPatch(MeterStatus Status);
public record OutagePatch(OutageStatus Status, DateTime? TimeResolved);
public record MessagePatch(MessageStatus Status);