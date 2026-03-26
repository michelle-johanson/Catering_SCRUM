using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CateringAPI.Data;

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
}
