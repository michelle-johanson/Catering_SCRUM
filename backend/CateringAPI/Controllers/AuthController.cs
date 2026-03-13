using CateringAPI.Data;
using CateringAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CateringAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly CateringDbContext _db;

    public AuthController(CateringDbContext db)
    {
        _db = db;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "All fields are required." });
        }

        var existingUser = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email || u.Username == request.Username);

        if (existingUser != null)
        {
            return Conflict(new { message = "User with this email or username already exists." });
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = passwordHash,
            Role = "Employee"
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Created("/api/auth/register", new
        {
            user.Id,
            user.Username,
            user.Email,
            user.Role
        });
    }
}

