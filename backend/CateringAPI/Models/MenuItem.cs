using System.ComponentModel.DataAnnotations;

namespace CateringAPI.Models;

public class MenuItem
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Category { get; set; } = string.Empty;

    [Required]
    public int QuantityOrdered { get; set; }

    public int QuantityWasted { get; set; } = 0;

    [Required]
    public int MenuId { get; set; }

    public Menu? Menu { get; set; }
}