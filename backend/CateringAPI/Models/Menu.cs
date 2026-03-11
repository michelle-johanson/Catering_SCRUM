using System.ComponentModel.DataAnnotations;

namespace CateringAPI.Models;

public class Menu
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public int EventId { get; set; }

    public Event? Event { get; set; }

    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
}