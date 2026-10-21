using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThorntonEnergy.Api.Data;
using ThorntonEnergy.Api.Dtos;
using ThorntonEnergy.Api.Models;

namespace ThorntonEnergy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController(AppDbContext db) : ControllerBase
{
    // GET api/customers   (sorted by last name)
    [HttpGet]
    public async Task<ActionResult<List<Customer>>> GetAll()
    {
        return await db.Customers.OrderBy(c => c.LastName).ToListAsync();
    }

    // GET api/customers/1
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Customer>> GetById(int id)
    {
        var customer = await db.Customers.FindAsync(id);
        if (customer is null) return NotFound();
        return customer;
    }

    // PATCH api/customers/1   body: { "ratePlanId": 2 }  or  { "status": "suspended" }
    [HttpPatch("{id:int}")]
    public async Task<ActionResult<Customer>> Update(int id, CustomerPatch patch)
    {
        var customer = await db.Customers.FindAsync(id);
        if (customer is null) return NotFound();

        if (patch.RatePlanId is not null)
        {
            if (!await db.RatePlans.AnyAsync(r => r.Id == patch.RatePlanId))
                return BadRequest(new { message = "That rate plan does not exist." });
            customer.RatePlanId = patch.RatePlanId.Value;
        }
        if (patch.Status is not null) customer.Status = patch.Status.Value;

        await db.SaveChangesAsync();
        return customer;
    }
}