using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThorntonEnergy.Api.Auth;
using ThorntonEnergy.Api.Data;
using ThorntonEnergy.Api.Models;

namespace ThorntonEnergy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MeterReadingsController(AppDbContext db) : AppControllerBase
{
    // GET api/meterReadings (?meterId=) | customers only get readings from their own meters (oldest first, for charts)
    [HttpGet]
    public async Task<ActionResult<List<MeterReading>>> GetAll([FromQuery] int? meterId)
    {
        if (!TryGetCustomerScope(null, out var scope)) return Forbid();

        var query = db.MeterReadings.AsQueryable();
        if (scope is not null) query = query.Where(r => r.Meter.CustomerId == scope); // EF turns this into a SQL JOIN
        if (meterId is not null) query = query.Where(r => r.MeterId == meterId);
        return await query.OrderBy(r => r.ReadingDate).ToListAsync();
    }

    // GET api/meterReadings/5 (403 if the meter belongs to another customer)
    [HttpGet("{id:int}")]
    public async Task<ActionResult<MeterReading>> GetById(int id)
    {
        var reading = await db.MeterReadings
            .Include(r => r.Meter)
            .FirstOrDefaultAsync(r => r.Id == id);
        if (reading is null) return NotFound();
        if (!CanAccessCustomer(reading.Meter.CustomerId)) return Forbid();
        return reading;
    }

    // POST api/meterReadings (admin only)
    [Authorize(Roles = AppRoles.Admin)]
    [HttpPost]
    public async Task<ActionResult<MeterReading>> Create(MeterReading reading)
    {
        reading.Id = 0;
        db.MeterReadings.Add(reading);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = reading.Id }, reading);
    }
}