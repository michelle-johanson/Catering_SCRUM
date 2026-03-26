using Microsoft.EntityFrameworkCore;
using CateringAPI.Models;

namespace CateringAPI.Data;

public class CateringDbContext : DbContext
{
    public CateringDbContext(DbContextOptions<CateringDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<Menu> Menus { get; set; }
    public DbSet<MenuItem> MenuItems { get; set; }
    public DbSet<CateringTask> Tasks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Event>()
            .HasMany(e => e.Menus)
            .WithMany(m => m.Events)
            .UsingEntity(join => join.ToTable("EventMenus"));
    }
}