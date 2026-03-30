using System.ComponentModel.DataAnnotations;

namespace CateringAPI.Models;

public class Menu
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }

    // ADDED: Explicit multi-tenant tracking
    [Required]
    public int CompanyId { get; set; }
    public Company? Company { get; set; }

    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();

    public ICollection<Event> Events { get; set; } = new List<Event>();
}