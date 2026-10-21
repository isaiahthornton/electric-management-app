using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThorntonEnergy.Api.Auth;
using ThorntonEnergy.Api.Data;
using ThorntonEnergy.Api.Dtos;
using ThorntonEnergy.Api.Models;

namespace ThorntonEnergy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MetersController(AppDbContext db) : AppControllerBase
{
    // GET api/meters (admin: all, or ?customerId=) | customer: only their own (newest install first)
    [HttpGet]
    public async Task<ActionResult<List<Meter>>> GetAll([FromQuery] int? customerId)
    {
        if (!TryGetCustomerScope(customerId, out var scope)) return Forbid();

        if (scope is null)
            return await db.Meters.OrderBy(m => m.Id).ToListAsync();

        return await db.Meters
            .Where(m => m.CustomerId == scope)
            .OrderByDescending(m => m.InstallationDate)
            .ToListAsync();
    }

    // PATCH api/meters/1   body: { "status": "inactive" } (admin only)
    [Authorize(Roles = AppRoles.Admin)]
    [HttpPatch("{id:int}")]
    public async Task<ActionResult<Meter>> Update(int id, MeterPatch patch)
    {
        var meter = await db.Meters.FindAsync(id);
        if (meter is null) return NotFound();

        meter.Status = patch.Status;
        await db.SaveChangesAsync();
        return meter;
    }
}