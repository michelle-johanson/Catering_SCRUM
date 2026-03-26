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

        int companyId;
        string role;

        if (!string.IsNullOrWhiteSpace(request.CompanyName))
        {
            var company = new Company
            {
                Name = request.CompanyName,
                JoinCode = GenerateJoinCode()
            };
            _db.Companies.Add(company);
            await _db.SaveChangesAsync();
            companyId = company.Id;
            role = "Admin";
        }
        else if (!string.IsNullOrWhiteSpace(request.JoinCode))
        {
            var company = await _db.Companies
                .FirstOrDefaultAsync(c => c.JoinCode == request.JoinCode);

            if (company == null)
                return BadRequest(new { message = "Invalid join code." });

            companyId = company.Id;
            role = "Employee";
        }
        else
        {
            return BadRequest(new { message = "Provide a company name to create a new company, or a join code to join an existing one." });
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = passwordHash,
            Role = role,
            CompanyId = companyId
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Created("/api/auth/register", new
        {
            user.Id,
            user.Username,
            user.Email,
            user.Role,
            user.CompanyId
        });
    }

    private static string GenerateJoinCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = new Random();
        return new string(Enumerable.Range(0, 8).Select(_ => chars[random.Next(chars.Length)]).ToArray());
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Username and password are required." });
        }

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        return Ok(new
        {
            user.Id,
            user.Username,
            user.Email,
            user.Role,
            user.CompanyId
        });
    }
}

