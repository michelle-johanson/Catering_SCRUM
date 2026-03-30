// Tyler Mitton
// Handles incoming HTTP requests related to User data (Create, Read, Update, Delete).
// backend/CateringAPI/Controllers/UsersController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CateringAPI.Data;
using CateringAPI.Models;

namespace CateringAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly CateringDbContext _context;

        public UsersController(CateringDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, User incoming)
        {
            if (id != incoming.Id)
                return BadRequest();

            var existing = await _context.Users.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Username = incoming.Username;
            existing.DisplayName = incoming.DisplayName;
            existing.Email = incoming.Email;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }

        [HttpGet("{id}/delete-info")]
        public async Task<IActionResult> GetDeleteInfo(int id)
        {
            var user = await _context.Users
                .Include(u => u.Company)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound();

            var companyUserCount = await _context.Users
                .CountAsync(u => u.CompanyId == user.CompanyId);
            var otherAdminCount = await _context.Users
                .CountAsync(u => u.CompanyId == user.CompanyId && u.Id != id && u.Role == "Admin");

            var canDelete = !(user.Role == "Admin" && otherAdminCount == 0 && companyUserCount > 1);
            var blockReason = canDelete ? null
                : "You are the only admin. Promote another team member to admin before deleting your account.";
            var companyWillBeDeleted = companyUserCount == 1;

            return Ok(new { canDelete, blockReason, companyWillBeDeleted, companyName = user.Company?.Name });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Company)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound();

            var companyUserCount = await _context.Users
                .CountAsync(u => u.CompanyId == user.CompanyId);
            var otherAdminCount = await _context.Users
                .CountAsync(u => u.CompanyId == user.CompanyId && u.Id != id && u.Role == "Admin");

            if (user.Role == "Admin" && otherAdminCount == 0 && companyUserCount > 1)
                return BadRequest(new { message = "You are the only admin. Promote another team member before deleting your account." });

            // Last user at company — remove the company (cascades to all company data)
            if (companyUserCount == 1 && user.Company != null)
                _context.Companies.Remove(user.Company);
            else
                _context.Users.Remove(user);

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{id}/change-password")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
                return BadRequest(new { message = "Current and new password are required." });

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return BadRequest(new { message = "Current password is incorrect." });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}