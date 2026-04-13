namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents the association between a <see cref="Model.School"/> and an <see cref="AiProvider"/>,
/// storing the encrypted API key and enabled state.
/// </summary>
public class SchoolAiProvider
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="Model.School"/>.</summary>
    public int SchoolId { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="AiProvider"/>.</summary>
    public int ProviderId { get; set; }

    /// <summary>Gets or sets the encrypted API key for authenticating with the provider.</summary>
    public required string ApiKeyEncrypted { get; set; }

    /// <summary>Gets or sets a value indicating whether this provider is enabled for the school.</summary>
    public bool IsEnabled { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the timestamp when this record was last updated.</summary>
    public Instant UpdatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the <see cref="Model.School"/>.</summary>
    public School School { get; set; } = null!;

    /// <summary>Gets or sets the navigation property to the <see cref="AiProvider"/>.</summary>
    public AiProvider Provider { get; set; } = null!;
}
