namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents the Microsoft Entra ID (Azure AD) configuration for a school,
/// used for single sign-on authentication.
/// </summary>
public class SchoolEntraConfig
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="Model.School"/>.</summary>
    public int SchoolId { get; set; }

    /// <summary>Gets or sets the Entra ID tenant identifier.</summary>
    public required Guid TenantId { get; set; }

    /// <summary>Gets or sets the Entra ID application (client) identifier.</summary>
    public required Guid ClientId { get; set; }

    /// <summary>Gets or sets the encrypted client secret.</summary>
    public required string ClientSecretEncrypted { get; set; }

    /// <summary>Gets or sets the OAuth redirect URI.</summary>
    public required string RedirectUri { get; set; }

    /// <summary>Gets or sets a value indicating whether Entra ID authentication is enabled.</summary>
    public bool IsEnabled { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the timestamp when this record was last updated.</summary>
    public Instant UpdatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the owning <see cref="Model.School"/>.</summary>
    public School School { get; set; } = null!;
}
