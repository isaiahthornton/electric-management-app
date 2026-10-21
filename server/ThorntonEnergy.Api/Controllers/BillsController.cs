using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThorntonEnergy.Api.Data;
using ThorntonEnergy.Api.Dtos;
using ThorntonEnergy.Api.Models;

namespace ThorntonEnergy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BillsController(AppDbContext db) : ControllerBase
{
    // GET api/bills   or   api/bills?customerId=1   (newest period first)
    [HttpGet]
    public async Task<ActionResult<List<Bill>>> GetAll([FromQuery] int? customerId)
    {
        var query = db.Bills.AsQueryable();
        if (customerId is not null) query = query.Where(b => b.CustomerId == customerId);
        return await query.OrderByDescending(b => b.PeriodStart).ToListAsync();
    }

    // GET api/bills/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Bill>> GetById(int id)
    {
        var bill = await db.Bills.FindAsync(id);
        if (bill is null) return NotFound();
        return bill;
    }

    // POST api/bills
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

        if (patch.Status is not null) bill.Status = patch.Status.Value;
        if (patch.PaidDate is not null) bill.PaidDate = patch.PaidDate;

        await db.SaveChangesAsync();
        return bill;
    }
}