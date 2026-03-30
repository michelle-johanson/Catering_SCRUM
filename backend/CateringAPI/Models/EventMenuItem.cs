using System.ComponentModel.DataAnnotations;

namespace CateringAPI.Models;

public class EventMenuItem
{
    public int Id { get; set; }

    public int EventId { get; set; }
    public Event? Event { get; set; }

    public int MenuItemId { get; set; }
    public MenuItem? MenuItem { get; set; }

    public int QtyOrdered { get; set; }
    public int QtyLeftover { get; set; }
}