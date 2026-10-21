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
public class OutagesController(AppDbContext db) : AppControllerBase
{
    // GET api/outages (admin: all, or ?customerId=) | customer: only their own (newest report first)
    [HttpGet]
    public async Task<ActionResult<List<Outage>>> GetAll([FromQuery] int? customerId)
    {
        if (!TryGetCustomerScope(customerId, out var scope)) return Forbid();

        var query = db.Outages.AsQueryable();
        if (scope is not null) query = query.Where(o => o.CustomerId == scope);
        return await query.OrderByDescending(o => o.TimeReported).ToListAsync();
    }

    // GET api/outages/5 (403 if it belongs to another customer)
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Outage>> GetById(int id)
    {
        var outage = await db.Outages.FindAsync(id);
        if (outage is null) return NotFound();
        if (!CanAccessCustomer(outage.CustomerId)) return Forbid();
        return outage;
    }

    // POST api/outages (customers report on their own account; admins can report for anyone)
    [HttpPost]
    public async Task<ActionResult<Outage>> Create(Outage outage)
    {
        if (!IsAdmin)
        {
            if (CurrentCustomerId is not int ownId) return Forbid();

            // Ignore whatever account the browser sent: a customer can only report for themselves,
            // and every customer report starts as "reported"
            outage.CustomerId = ownId;
            outage.Status = OutageStatus.Reported;
            outage.TimeResolved = null;
        }

        outage.Id = 0;
        db.Outages.Add(outage);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = outage.Id }, outage);
    }

    // PATCH api/outages/5   body: { "status": "resolved", "timeResolved": "2026-10-20T21:30:00" } (admin only)
    [Authorize(Roles = AppRoles.Admin)]
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