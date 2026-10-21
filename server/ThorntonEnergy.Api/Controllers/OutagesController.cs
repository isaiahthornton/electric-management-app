using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThorntonEnergy.Api.Data;
using ThorntonEnergy.Api.Dtos;
using ThorntonEnergy.Api.Models;

namespace ThorntonEnergy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OutagesController(AppDbContext db) : ControllerBase
{
    // GET api/outages   or   api/outages?customerId=1   (newest report first)
    [HttpGet]
    public async Task<ActionResult<List<Outage>>> GetAll([FromQuery] int? customerId)
    {
        var query = db.Outages.AsQueryable();
        if (customerId is not null) query = query.Where(o => o.CustomerId == customerId);
        return await query.OrderByDescending(o => o.TimeReported).ToListAsync();
    }

    // GET api/outages/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Outage>> GetById(int id)
    {
        var outage = await db.Outages.FindAsync(id);
        if (outage is null) return NotFound();
        return outage;
    }

    // POST api/outages
    [HttpPost]
    public async Task<ActionResult<Outage>> Create(Outage outage)
    {
        outage.Id = 0;
        db.Outages.Add(outage);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = outage.Id }, outage);
    }

    // PATCH api/outages/5   body: { "status": "resolved", "timeResolved": "2026-10-20T21:30:00" }
    [HttpPatch("{id:int}")]
    public async Task<ActionResult<Outage>> Update(int id, OutagePatch patch)
    {
        var outage = await db.Outages.FindAsync(id);
        if (outage is null) return NotFound();

        // Status and timeResolved never disagree
        outage.Status = patch.Status;
        outage.TimeResolved = patch.Status == OutageStatus.Resolved
            ? patch.TimeResolved ?? DateTime.Now
            : null;

        await db.SaveChangesAsync();
        return outage;
    }
}