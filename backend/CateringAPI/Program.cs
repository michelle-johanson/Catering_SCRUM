// Tyler Mitton
// Entry point for the backend application, configures services, CORS, database, and routing.
// backend/CateringAPI/Program.cs

using Microsoft.EntityFrameworkCore;
using CateringAPI.Data; // Required to access CateringDbContext

var builder = WebApplication.CreateBuilder(args);

// Register the SQLite Database
builder.Services.AddDbContext<CateringDbContext>(options =>
    options.UseSqlite("Data Source=catering.db"));

// Add support for Controllers
builder.Services.AddControllers();

// 1. Configure CORS 
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactFrontend",
        policy =>
        {
            // This is the Vite port React app runs on
            policy.WithOrigins("http://localhost:5173") 
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

app.UseHttpsRedirection();

app.UseCors("AllowReactFrontend");

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