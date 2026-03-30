using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CateringAPI.Data;
using CateringAPI.Models;

namespace CateringAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CompaniesController : ControllerBase
{
    private readonly CateringDbContext _context;

    public CompaniesController(CateringDbContext context)
    {
        _context = context;
    }

    [HttpGet("lookup")]
    public async Task<IActionResult> LookupByJoinCode([FromQuery] string joinCode)
    {
        if (string.IsNullOrWhiteSpace(joinCode))
            return BadRequest(new { message = "Join code is required." });

        var company = await _context.Companies
            .FirstOrDefaultAsync(c => c.JoinCode == joinCode.ToUpper().Trim());

        if (company == null)
            return NotFound(new { message = "No company found with that join code." });

        return Ok(new { company.Id, company.Name });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCompany(int id)
    {
        var company = await _context.Companies
            .Include(c => c.Users)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (company == null)
            return NotFound();

        return Ok(new
        {
            company.Id,
            company.Name,
            company.JoinCode,
            Users = company.Users.Select(u => new
            {
                u.Id,
                u.Username,
                u.Email,
                u.Role
            })
        });
    }

    [HttpPut("{id}/regenerate-join-code")]
    public async Task<IActionResult> RegenerateJoinCode(int id, [FromBody] RegenerateJoinCodeRequest request)
    {
        var company = await _context.Companies.FindAsync(id);
        if (company == null)
            return NotFound();

        if (request.Disable)
        {
            // 64-char random string — impossible to type or guess
            company.JoinCode = GenerateDisabledCode();
        }
        else
        {
            company.JoinCode = GenerateJoinCode();
        }

        await _context.SaveChangesAsync();
        return Ok(new { joinCode = company.JoinCode, disabled = request.Disable });
    }

    [HttpPost("{id}/users")]
    public async Task<IActionResult> CreateUserForCompany(int id, [FromBody] CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Username, email, and password are required." });
        }

        var company = await _context.Companies.FindAsync(id);
        if (company == null)
            return NotFound(new { message = "Company not found." });

        var existing = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email || u.Username == request.Username);
        if (existing != null)
            return Conflict(new { message = "A user with that username or email already exists." });

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            DisplayName = string.IsNullOrWhiteSpace(request.DisplayName) ? null : request.DisplayName.Trim(),
            Role = request.Role == "Admin" ? "Admin" : "Employee",
            CompanyId = id
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Created($"/api/companies/{id}/users/{user.Id}", new
        {
            user.Id,
            user.Username,
            user.Email,
            user.DisplayName,
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

    private static string GenerateDisabledCode()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var random = new Random();
        return new string(Enumerable.Range(0, 64).Select(_ => chars[random.Next(chars.Length)]).ToArray());
    }
}

public class RegenerateJoinCodeRequest
{
    public bool Disable { get; set; }
}

public class CreateUserRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? Role { get; set; }
}
