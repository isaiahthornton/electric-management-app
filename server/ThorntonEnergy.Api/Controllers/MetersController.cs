using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThorntonEnergy.Api.Data;
using ThorntonEnergy.Api.Dtos;
using ThorntonEnergy.Api.Models;

namespace ThorntonEnergy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetersController(AppDbContext db) : ControllerBase
{
    // GET api/meters   or   api/meters?customerId=1   (newest install first)
    [HttpGet]
    public async Task<ActionResult<List<Meter>>> GetAll([FromQuery] int? customerId)
    {
        if (customerId is null)
            return await db.Meters.OrderBy(m => m.Id).ToListAsync();

        return await db.Meters
            .Where(m => m.CustomerId == customerId)
            .OrderByDescending(m => m.InstallationDate)
            .ToListAsync();
    }

    // PATCH api/meters/1   body: { "status": "inactive" }
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