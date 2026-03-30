// Handles incoming HTTP requests related to Menu data (Create, Read, Update, Delete).
// backend/CateringAPI/Controllers/MenusController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CateringAPI.Data;
using CateringAPI.Models;

namespace CateringAPI.Controllers
{
public sealed class CreateMenuRequest
    {
        public string Name { get; set; } = string.Empty;
        public int CompanyId { get; set; } // ADDED
    }

    public sealed class UpdateMenuRequest
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    [Route("api/[controller]")]
    [ApiController]
    public class MenusController : ControllerBase
    {
        private readonly CateringDbContext _context;

        public MenusController(CateringDbContext context)
        {
            _context = context;
        }

        // GET: api/Menus?companyId=1
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Menu>>> GetMenus([FromQuery] int? companyId)
        {
            var query = _context.Menus
                .Include(m => m.MenuItems)
                .Include(m => m.Events)
                .AsQueryable();

            if (companyId.HasValue)
            {
                // FIXED: Now we filter purely by the Menu's true owner
                query = query.Where(m => m.CompanyId == companyId.Value);
            }

            return await query.ToListAsync();
        }

        [HttpGet("byevent/{eventId}")]
        public async Task<ActionResult<IEnumerable<Menu>>> GetMenusByEvent(int eventId)
        {
            return await _context.Menus
                .Where(m => m.Events.Any(e => e.Id == eventId))
                .Include(m => m.MenuItems)
                .Include(m => m.Events)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Menu>> GetMenu(int id)
        {
            var menu = await _context.Menus
                .Include(m => m.MenuItems)
                .Include(m => m.Events)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (menu == null)
            {
                return NotFound();
            }

            return menu;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutMenu(int id, UpdateMenuRequest request)
        {
            if (request == null)
            {
                return BadRequest("Request body is required.");
            }

            if (id != request.Id)
            {
                return BadRequest();
            }

            var trimmedName = request.Name.Trim();
            if (string.IsNullOrWhiteSpace(trimmedName))
            {
                return BadRequest("Menu name is required.");
            }

            var existingMenu = await _context.Menus.FindAsync(id);
            if (existingMenu == null)
            {
                return NotFound();
            }

            existingMenu.Name = trimmedName;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MenuExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, "Failed to update menu.");
            }

            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<Menu>> PostMenu(CreateMenuRequest request)
        {
            if (request == null)
            {
                return BadRequest("Request body is required.");
            }

            var trimmedName = request.Name.Trim();
            if (string.IsNullOrWhiteSpace(trimmedName))
            {
                return BadRequest("Menu name is required.");
            }

            var newMenu = new Menu
            {
                Name = trimmedName,
                CompanyId = request.CompanyId // ADDED: Attach the company
            };

            _context.Menus.Add(newMenu);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, "Failed to create menu.");
            }

            return CreatedAtAction(nameof(GetMenu), new { id = newMenu.Id }, newMenu);
        }

        // FIXED: Now assigns by updating the Event's AssignedMenuId
        [HttpPost("{menuId}/events/{eventId}")]
        public async Task<IActionResult> AssignMenuToEvent(int menuId, int eventId)
        {
            var targetEvent = await _context.Events.FindAsync(eventId);
            if (targetEvent == null)
            {
                return NotFound("Event not found.");
            }

            var menu = await _context.Menus.FindAsync(menuId);
            if (menu == null)
            {
                return NotFound("Menu not found.");
            }

            if (targetEvent.AssignedMenuId == menuId)
            {
                return Conflict("Menu is already assigned to this event.");
            }

            targetEvent.AssignedMenuId = menuId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, "Failed to assign menu to event.");
            }

            return NoContent();
        }

        // FIXED: Now unassigns by nulling out the Event's AssignedMenuId
        [HttpDelete("{menuId}/events/{eventId}")]
        public async Task<IActionResult> UnassignMenuFromEvent(int menuId, int eventId)
        {
            var targetEvent = await _context.Events.FindAsync(eventId);
            if (targetEvent == null)
            {
                return NotFound("Event not found.");
            }

            if (targetEvent.AssignedMenuId != menuId)
            {
                return NotFound("Menu assignment not found.");
            }

            targetEvent.AssignedMenuId = null;
            
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMenu(int id)
        {
            var menu = await _context.Menus.FindAsync(id);
            if (menu == null)
            {
                return NotFound();
            }

            _context.Menus.Remove(menu);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MenuExists(int id)
        {
            return _context.Menus.Any(e => e.Id == id);
        }
    }
}