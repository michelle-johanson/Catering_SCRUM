// Handles incoming HTTP requests related to Event data (Create, Read, Update, Delete).
// backend/CateringAPI/Controllers/EventsController.cs

using Microsoft.AspNetCore.Mvc;
//using Microsoft.AspNetCore.Authorization;//
using Microsoft.EntityFrameworkCore;
using CateringAPI.Data;
using CateringAPI.Models;

namespace CateringAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]//
    public class EventsController : ControllerBase
    {
        private readonly CateringDbContext _context;

        public EventsController(CateringDbContext context)
        {
            _context = context;
        }

        // GET: api/Events?companyId=1
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> GetEvents([FromQuery] int? companyId)
        {
            var query = _context.Events.AsQueryable();
            if (companyId.HasValue)
                query = query.Where(e => e.CompanyId == companyId.Value);
            return await query.ToListAsync();
        }

        // GET: api/Events/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> GetEvent(int id)
        {
            var targetEvent = await _context.Events
                // FIXED: Changed from Menus to AssignedMenu
                .Include(e => e.AssignedMenu)
                    .ThenInclude(m => m!.MenuItems)
                // ADDED: Include the specific quantities payload table
                .Include(e => e.EventMenuItems)
                .Include(e => e.Tasks)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (targetEvent == null)
            {
                return NotFound();
            }

            return targetEvent;
        }

        // PUT: api/Events/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEvent(int id, Event updatedEvent)
        {
            if (id != updatedEvent.Id)
            {
                return BadRequest();
            }

            _context.Entry(updatedEvent).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EventExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Events
        [HttpPost]
        public async Task<ActionResult<Event>> PostEvent(Event newEvent)
        {
            _context.Events.Add(newEvent);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEvent), new { id = newEvent.Id }, newEvent);
        }

        // DELETE: api/Events/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var targetEvent = await _context.Events.FindAsync(id);
            if (targetEvent == null)
            {
                return NotFound();
            }

            _context.Events.Remove(targetEvent);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        public class InventoryItemDto
        {
            public int MenuItemId { get; set; }
            public int QtyOrdered { get; set; }
            public int QtyLeftover { get; set; }
        }

        // PUT: api/Events/5/inventory
        [HttpPut("{id}/inventory")]
        public async Task<IActionResult> PutEventInventory(int id, [FromBody] List<InventoryItemDto> items)
        {
            if (!EventExists(id))
                return NotFound();

            foreach (var item in items)
            {
                var existing = await _context.EventMenuItems
                    .FirstOrDefaultAsync(e => e.EventId == id && e.MenuItemId == item.MenuItemId);

                if (existing != null)
                {
                    existing.QtyOrdered = item.QtyOrdered;
                    existing.QtyLeftover = item.QtyLeftover;
                }
                else
                {
                    _context.EventMenuItems.Add(new EventMenuItem
                    {
                        EventId = id,
                        MenuItemId = item.MenuItemId,
                        QtyOrdered = item.QtyOrdered,
                        QtyLeftover = item.QtyLeftover,
                    });
                }
            }


            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool EventExists(int id)
        {
            return _context.Events.Any(e => e.Id == id);
        }
    }
}