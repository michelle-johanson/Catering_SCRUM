using System.ComponentModel.DataAnnotations;

namespace CateringAPI.Models;

public class CateringTask
{
    public int Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public string Status { get; set; } = "Pending"; // Pending | InProgress | Done

    public DateTime? DueDate { get; set; }

    [Required]
    public int CompanyId { get; set; }

    public Company? Company { get; set; }

    public int? EventId { get; set; }

    public Event? Event { get; set; }
}

