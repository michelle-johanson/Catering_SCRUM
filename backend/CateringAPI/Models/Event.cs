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

    public decimal? FoodWasteLbs { get; set; }

    public decimal? TotalCost { get; set; }

    public decimal? TotalSales { get; set; }

    public string? ClientName { get; set; }

    public string? ClientContact { get; set; }

    [Required]
    public int CompanyId { get; set; }

    public Company? Company { get; set; }

    [Required]
    public int CreatedByUserId { get; set; }

    public User? CreatedByUser { get; set; }

    // Replaced the old Many-to-Many Menus collection with a single AssignedMenu
    public int? AssignedMenuId { get; set; }
    
    public Menu? AssignedMenu { get; set; }

    // Navigation property for specific item quantities and leftovers at this event
    public ICollection<EventMenuItem> EventMenuItems { get; set; } = new List<EventMenuItem>();

    public ICollection<CateringTask> Tasks { get; set; } = new List<CateringTask>();
}