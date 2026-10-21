using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThorntonEnergy.Api.Data;
using ThorntonEnergy.Api.Dtos;
using ThorntonEnergy.Api.Models;

namespace ThorntonEnergy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext db) : ControllerBase
{
    // POST api/auth/login   (replaces GET /users?email=&password=)
    [HttpPost("login")]
    public async Task<ActionResult<UserResponse>> Login(LoginRequest request)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });

        return ToResponse(user);
    }

    // POST api/auth/register   (replaces the customer lookup + user check + POST /users)
    [HttpPost("register")]
    public async Task<ActionResult<UserResponse>> Register(RegisterRequest request)
    {
        var customer = await db.Customers.FirstOrDefaultAsync(c =>
            c.AccountNumber == request.AccountNumber && c.Email == request.Email);
        if (customer is null)
            return NotFound(new { message = "Customer not found with provided account number and email." });

        var exists = await db.Users.AnyAsync(u => u.CustomerId == customer.Id || u.Email == request.Email);
        if (exists)
            return Conflict(new { message = "A user account already exists for this customer." });

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Customer,
            CustomerId = customer.Id
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        return ToResponse(user);
    }

    // Never send the password hash back to the browser
    private static UserResponse ToResponse(User user) =>
        new(user.Id, user.Email, user.Role, user.CustomerId);
}