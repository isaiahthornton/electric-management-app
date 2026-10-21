using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThorntonEnergy.Api.Data;
using ThorntonEnergy.Api.Models;

namespace ThorntonEnergy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MeterReadingsController(AppDbContext db) : ControllerBase
{
    // GET api/meterReadings   or   api/meterReadings?meterId=1   (oldest first, for charts)
    [HttpGet]
    public async Task<ActionResult<List<MeterReading>>> GetAll([FromQuery] int? meterId)
    {
        var query = db.MeterReadings.AsQueryable();
        if (meterId is not null) query = query.Where(r => r.MeterId == meterId);
        return await query.OrderBy(r => r.ReadingDate).ToListAsync();
    }

    // GET api/meterReadings/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<MeterReading>> GetById(int id)
    {
        var reading = await db.MeterReadings.FindAsync(id);
        if (reading is null) return NotFound();
        return reading;
    }

    // POST api/meterReadings
    [HttpPost]
    public async Task<ActionResult<MeterReading>> Create(MeterReading reading)
    {
        reading.Id = 0;
        db.MeterReadings.Add(reading);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = reading.Id }, reading);
    }
}