using System.ComponentModel.DataAnnotations;

namespace CateringAPI.Models;

public class Menu
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();

    public ICollection<Event> Events { get; set; } = new List<Event>();
}