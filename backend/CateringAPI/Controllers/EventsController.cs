// Tyler Mitton
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

        // GET: api/Events
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> GetEvents()
        {
            return await _context.Events.ToListAsync();
        }

        // GET: api/Events/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> GetEvent(int id)
        {
            var targetEvent = await _context.Events
                .Include(e => e.Menus)
                    .ThenInclude(m => m.MenuItems)
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

        private bool EventExists(int id)
        {
            return _context.Events.Any(e => e.Id == id);
        }
    }
}