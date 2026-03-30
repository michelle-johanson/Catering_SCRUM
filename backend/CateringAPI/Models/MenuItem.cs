using System.ComponentModel.DataAnnotations;

namespace CateringAPI.Models;

public class MenuItem
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Category { get; set; } = string.Empty;

    public decimal Cost { get; set; }
    public decimal ServingSizeLb { get; set; }
    
    // FIXED: Renamed and changed to an integer for easier visualization
    public int RecommendedPer100Guests { get; set; }

    [Required]
    public int MenuId { get; set; }
    public Menu? Menu { get; set; }

    public ICollection<EventMenuItem> EventMenuItems { get; set; } = new List<EventMenuItem>();
}