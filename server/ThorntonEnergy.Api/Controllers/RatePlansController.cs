using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThorntonEnergy.Api.Data;
using ThorntonEnergy.Api.Models;

namespace ThorntonEnergy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RatePlansController(AppDbContext db) : ControllerBase
{
    // GET api/ratePlans
    [HttpGet]
    public async Task<ActionResult<List<RatePlan>>> GetAll()
    {
        return await db.RatePlans.OrderBy(r => r.Id).ToListAsync();
    }

    // GET api/ratePlans/1
    [HttpGet("{id:int}")]
    public async Task<ActionResult<RatePlan>> GetById(int id)
    {
        var plan = await db.RatePlans.FindAsync(id);
        if (plan is null) return NotFound();
        return plan;
    }

    // POST api/ratePlans
    [HttpPost]
    public async Task<ActionResult<RatePlan>> Create(RatePlan plan)
    {
        plan.Id = 0;
        db.RatePlans.Add(plan);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = plan.Id }, plan);
    }

    // PUT api/ratePlans/1   (replaces every field)
    [HttpPut("{id:int}")]
    public async Task<ActionResult<RatePlan>> Replace(int id, RatePlan input)
    {
        if (id != input.Id)
            return BadRequest(new { message = "The id in the URL and the body must match." });

        var plan = await db.RatePlans.FindAsync(id);
        if (plan is null) return NotFound();

        plan.Name = input.Name;
        plan.PricePerKwh = input.PricePerKwh;
        plan.MonthlyFee = input.MonthlyFee;
        plan.Description = input.Description;

        await db.SaveChangesAsync();
        return plan;
    }

    // DELETE api/ratePlans/1   (blocked while customers are on the plan)
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var plan = await db.RatePlans.FindAsync(id);
        if (plan is null) return NotFound();

        if (await db.Customers.AnyAsync(c => c.RatePlanId == id))
            return Conflict(new { message = "Customers are still on this plan. Move them to another plan first." });

        db.RatePlans.Remove(plan);
        await db.SaveChangesAsync();
        return NoContent();
    }
}