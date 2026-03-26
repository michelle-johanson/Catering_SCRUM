namespace CateringAPI.Models;

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    public string? DisplayName { get; set; }

    // Provided when creating a new company
    public string? CompanyName { get; set; }

    // Provided when joining an existing company
    public string? JoinCode { get; set; }
}

