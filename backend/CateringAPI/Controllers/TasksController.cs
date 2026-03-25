// Handles incoming HTTP requests related to CateringTask data (Create, Read, Update, Delete).
// backend/CateringAPI/Controllers/TasksController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CateringAPI.Data;
using CateringAPI.Models;

namespace CateringAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly CateringDbContext _context;

        public TasksController(CateringDbContext context)
        {
            _context = context;
        }

        // GET: api/Tasks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CateringTask>>> GetTasks()
        {
            return await _context.Tasks.ToListAsync();
        }

        // GET: api/Tasks/byevent/5
        [HttpGet("byevent/{eventId}")]
        public async Task<ActionResult<IEnumerable<CateringTask>>> GetTasksByEvent(int eventId)
        {
            return await _context.Tasks.Where(t => t.EventId == eventId).ToListAsync();
        }

        // GET: api/Tasks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CateringTask>> GetTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }

            return task;
        }

        // PUT: api/Tasks/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTask(int id, CateringTask updatedTask)
        {
            if (id != updatedTask.Id)
            {
                return BadRequest();
            }

            _context.Entry(updatedTask).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TaskExists(id))
                {
                    return NotFound();
                }

                throw;
            }

            return NoContent();
        }

        // POST: api/Tasks
        [HttpPost]
        public async Task<ActionResult<CateringTask>> PostTask(CateringTask newTask)
        {
            _context.Tasks.Add(newTask);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTask), new { id = newTask.Id }, newTask);
        }

        // DELETE: api/Tasks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TaskExists(int id)
        {
            return _context.Tasks.Any(e => e.Id == id);
        }
    }
}

