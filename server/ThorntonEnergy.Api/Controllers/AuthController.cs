using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThorntonEnergy.Api.Auth;
using ThorntonEnergy.Api.Data;
using ThorntonEnergy.Api.Dtos;
using ThorntonEnergy.Api.Models;
using ThorntonEnergy.Api.Services;

namespace ThorntonEnergy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext db, ITokenService tokens) : ControllerBase
{
    // POST api/auth/login: check the password, then hand back a signed JWT
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await db.Users
            .Include(u => u.Customer)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });

        // Suspended or closed customers can't sign in. The server enforces this, not just the browser.
        if (user.Customer is not null && user.Customer.Status != AccountStatus.Active)
            return AccountNotActive(user.Customer.Status);

        return ToAuthResponse(user);
    }

    // POST api/auth/register: link a new login to an existing customer, then sign them in
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var customer = await db.Customers.FirstOrDefaultAsync(c =>
            c.AccountNumber == request.AccountNumber && c.Email == request.Email);
        if (customer is null)
            return NotFound(new { message = "Customer not found with provided account number and email." });

        if (customer.Status != AccountStatus.Active)
            return AccountNotActive(customer.Status);

        var exists = await db.Users.AnyAsync(u => u.CustomerId == customer.Id || u.Email == request.Email);
        if (exists)
            return Conflict(new { message = "A user account already exists for this customer." });

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Customer,
            CustomerId = customer.Id,
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        return ToAuthResponse(user);
    }

    // GET api/auth/me: who does this token belong to? 401 without a valid token.
    [Authorize]
    [HttpGet("me")]
    public ActionResult<UserResponse> Me() =>
        new UserResponse(User.GetUserId(), User.GetEmail(), User.GetRole(), User.GetCustomerId());

    private AuthResponse ToAuthResponse(User user)
    {
        var token = tokens.CreateToken(user);
        // Never send the password hash back to the browser
        return new AuthResponse(token.Token, token.ExpiresAt, new UserResponse(user.Id, user.Email, user.Role, user.CustomerId));
    }

    // 403 Forbidden: we know who you are, but this account isn't allowed in
    private ObjectResult AccountNotActive(AccountStatus status) =>
        StatusCode(StatusCodes.Status403Forbidden, new
        {
            message = $"This account is {status.ToString().ToLowerInvariant()}. Please call customer care at 1-800-555-0100.",
        });
}