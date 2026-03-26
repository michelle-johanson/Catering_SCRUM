using System.ComponentModel.DataAnnotations;

namespace CateringAPI.Models;

public class Company
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string JoinCode { get; set; } = string.Empty;

    public ICollection<User> Users { get; set; } = new List<User>();

    public ICollection<Event> Events { get; set; } = new List<Event>();

    public ICollection<CateringTask> Tasks { get; set; } = new List<CateringTask>();
}
