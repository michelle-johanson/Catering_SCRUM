using Microsoft.EntityFrameworkCore;
using CateringAPI.Models;

namespace CateringAPI.Data;

public class CateringDbContext : DbContext
{
    public CateringDbContext(DbContextOptions<CateringDbContext> options)
        : base(options)
    {
    }

    public DbSet<Company> Companies { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<Menu> Menus { get; set; }
    public DbSet<MenuItem> MenuItems { get; set; }
    public DbSet<CateringTask> Tasks { get; set; }
    
    // Add the new junction table
    public DbSet<EventMenuItem> EventMenuItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Configure Event -> Menu (Many-to-One)
        modelBuilder.Entity<Event>()
            .HasOne(e => e.AssignedMenu)
            .WithMany(m => m.Events)
            .HasForeignKey(e => e.AssignedMenuId)
            .OnDelete(DeleteBehavior.SetNull); // If a Menu is deleted, the Event just loses its assigned menu

        // 2. Configure EventMenuItem relationships
        modelBuilder.Entity<EventMenuItem>()
            .HasOne(emi => emi.Event)
            .WithMany(e => e.EventMenuItems)
            .HasForeignKey(emi => emi.EventId)
            .OnDelete(DeleteBehavior.Cascade); // Deleting an event deletes its specific menu quantities

        modelBuilder.Entity<EventMenuItem>()
            .HasOne(emi => emi.MenuItem)
            .WithMany(mi => mi.EventMenuItems)
            .HasForeignKey(emi => emi.MenuItemId)
            .OnDelete(DeleteBehavior.Cascade); // Deleting a menu item removes it from all event quantity tracking
    }
}