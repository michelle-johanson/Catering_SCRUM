// Tyler Mitton
// Entry point for the backend application, configures services, CORS, database, and routing.
// backend/CateringAPI/Program.cs

using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using CateringAPI.Data; // Required to access CateringDbContext

var builder = WebApplication.CreateBuilder(args);

var defaultConnection = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(defaultConnection) ||
    defaultConnection.Contains("YOUR_PASSWORD_HERE", StringComparison.OrdinalIgnoreCase))
{
    throw new InvalidOperationException(
        "DefaultConnection is not configured. Set a real PostgreSQL connection string in appsettings.Development.json.");
}

// Register the PostgreSQL Database
builder.Services.AddDbContext<CateringDbContext>(options =>
    options.UseNpgsql(defaultConnection));

// Add support for Controllers
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// 1. Configure CORS 
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactFrontend",
        policy =>
        {
            policy.SetIsOriginAllowed(origin =>
                {
                    if (string.IsNullOrEmpty(origin)) return false;
                    var uri = new Uri(origin);
                    return uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
                        || uri.Host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase);
                })
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Add OpenAPI (Swagger) for API documentation
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowReactFrontend");

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Map the controllers so the app knows where to route API requests
app.MapControllers();

// This responds to GET requests at /api/health with a simple 200 OK and a message
app.MapGet("/api/health", () =>
{
    return Results.Ok(new { 
        status = "healthy", 
        timestamp = DateTime.UtcNow 
    });
})
.WithName("GetHealthCheck");

// Start the application
app.Run();
