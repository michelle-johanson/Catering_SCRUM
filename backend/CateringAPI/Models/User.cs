using System.ComponentModel.DataAnnotations;

namespace CateringAPI.Models;

public class User
{
    public int Id { get; set; }

    // Unique username for login/identification
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public string? DisplayName { get; set; }

    [Required]
    public string Role { get; set; } = "Employee"; // Admin or Employee

    [Required]
    public int CompanyId { get; set; }

    public Company? Company { get; set; }

    public ICollection<Event> Events { get; set; } = new List<Event>();
}