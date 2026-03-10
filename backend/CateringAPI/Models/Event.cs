using System.ComponentModel.DataAnnotations;

namespace CateringAPI.Models;

public class Event
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public int GuestCount { get; set; }

    [Required]
    public decimal Budget { get; set; }

    [Required]
    public int CreatedByUserId { get; set; }

    public User? CreatedByUser { get; set; }

    public ICollection<Menu> Menus { get; set; } = new List<Menu>();
}