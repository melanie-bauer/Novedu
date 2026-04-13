namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents the global settings for a school, including the default system prompt.
/// </summary>
public class GlobalSettings
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="Model.School"/>.</summary>
    public int SchoolId { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="User"/> who last modified these settings.</summary>
    public int? LastModifiedById { get; set; }

    /// <summary>Gets or sets the default system prompt applied to all tutors in this school.</summary>
    public string? SystemPrompt { get; set; }

    /// <summary>Gets or sets the timestamp of the last modification.</summary>
    public Instant? LastModifiedAt { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the timestamp when this record was last updated.</summary>
    public Instant UpdatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the owning <see cref="Model.School"/>.</summary>
    public School School { get; set; } = null!;

    /// <summary>Gets or sets the navigation property to the <see cref="User"/> who last modified these settings.</summary>
    public User? LastModifiedBy { get; set; }
}
