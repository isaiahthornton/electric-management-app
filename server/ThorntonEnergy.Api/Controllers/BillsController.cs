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
public class BillsController(AppDbContext db) : AppControllerBase
{
    // GET api/bills (admin: all, or ?customerId=) | customer: only their own (newest period first)
    [HttpGet]
    public async Task<ActionResult<List<Bill>>> GetAll([FromQuery] int? customerId)
    {
        if (!TryGetCustomerScope(customerId, out var scope)) return Forbid();

        var query = db.Bills.AsQueryable();
        if (scope is not null) query = query.Where(b => b.CustomerId == scope);
        return await query.OrderByDescending(b => b.PeriodStart).ToListAsync();
    }

    // GET api/bills/5 (403 if it belongs to another customer)
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Bill>> GetById(int id)
    {
        var bill = await db.Bills.FindAsync(id);
        if (bill is null) return NotFound();
        if (!CanAccessCustomer(bill.CustomerId)) return Forbid();
        return bill;
    }

    // POST api/bills (admin only: customers can't create their own bills)
    [Authorize(Roles = AppRoles.Admin)]
    [HttpPost]
    public async Task<ActionResult<Bill>> Create(Bill bill)
    {
        bill.Id = 0; // SQL Server assigns the id
        db.Bills.Add(bill);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = bill.Id }, bill);
    }

    // PATCH api/bills/5   body: { "status": "paid", "paidDate": "2026-10-20" }
    [HttpPatch("{id:int}")]
    public async Task<ActionResult<Bill>> Update(int id, BillPatch patch)
    {
        var bill = await db.Bills.FindAsync(id);
        if (bill is null) return NotFound();
        if (!CanAccessCustomer(bill.CustomerId)) return Forbid();

        // A customer may only mark their own bill as paid; any other change is admin-only
        if (!IsAdmin && patch.Status != BillStatus.Paid) return Forbid();

        if (patch.Status is not null) bill.Status = patch.Status.Value;
        if (patch.PaidDate is not null) bill.PaidDate = patch.PaidDate;

        await db.SaveChangesAsync();
        return bill;
    }
}