using System.ComponentModel.DataAnnotations;

namespace CateringAPI.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = "Employee"; // Admin or Employee

    public ICollection<Event> Events { get; set; } = new List<Event>();
}