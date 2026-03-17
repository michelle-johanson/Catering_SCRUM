// Tyler Mitton
// Entry point for the backend application, configures services, CORS, database, and routing.
// backend/CateringAPI/Program.cs

using Microsoft.EntityFrameworkCore;
using CateringAPI.Data; // Required to access CateringDbContext
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Register the PostgreSQL Database
builder.Services.AddDbContext<CateringDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add support for Controllers
builder.Services.AddControllers();

// Configure JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSettings = builder.Configuration.GetSection("JwtSettings");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Secret"]!))
        };
    });

// Add Authorization policies
builder.Services.AddAuthorization();

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
                    return uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase);
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

app.UseAuthentication();
app.UseAuthorization();

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
