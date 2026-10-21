using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using ThorntonEnergy.Api.Auth;
using ThorntonEnergy.Api.Data;
using ThorntonEnergy.Api.Dtos;
using ThorntonEnergy.Api.Models;

namespace ThorntonEnergy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = AppRoles.Admin)] // the inbox is admin-only...
public class MessagesController(AppDbContext db) : ControllerBase
{
    // GET api/messages (newest first)
    [HttpGet]
    public async Task<ActionResult<List<ContactMessage>>> GetAll()
    {
        return await db.ContactMessages.OrderByDescending(m => m.SentAt).ToListAsync();
    }

    // GET api/messages/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ContactMessage>> GetById(int id)
    {
        var message = await db.ContactMessages.FindAsync(id);
        if (message is null) return NotFound();
        return message;
    }

    // POST api/messages (...but anyone can send one from the contact form)
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitPolicies.PublicForms)] // slows down spam
    [HttpPost]
    public async Task<ActionResult<ContactMessage>> Create(ContactMessage message)
    {
        message.Id = 0;
        message.Status = MessageStatus.New; // new messages always start unread
        db.ContactMessages.Add(message);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = message.Id }, message);
    }

    // PATCH api/messages/5   body: { "status": "read" }
    [HttpPatch("{id:int}")]
    public async Task<ActionResult<ContactMessage>> Update(int id, MessagePatch patch)
    {
        var message = await db.ContactMessages.FindAsync(id);
        if (message is null) return NotFound();

        message.Status = patch.Status;
        await db.SaveChangesAsync();
        return message;
    }
}