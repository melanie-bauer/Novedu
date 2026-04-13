namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents a school, which is the top-level organizational entity in the system.
/// </summary>
public class School
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the school name.</summary>
    public required string Name { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the timestamp when this record was last updated.</summary>
    public Instant UpdatedAt { get; set; }

    /// <summary>Gets or sets the optional Microsoft Entra ID configuration for this school.</summary>
    public SchoolEntraConfig? EntraConfig { get; set; }

    /// <summary>Gets or sets the optional global settings for this school.</summary>
    public GlobalSettings? GlobalSettings { get; set; }

    /// <summary>Gets or sets the collection of users belonging to this school.</summary>
    public ICollection<User> Users { get; set; } = [];

    /// <summary>Gets or sets the collection of groups within this school.</summary>
    public ICollection<Group> Groups { get; set; } = [];

    /// <summary>Gets or sets the collection of roles defined for this school.</summary>
    public ICollection<Role> Roles { get; set; } = [];

    /// <summary>Gets or sets the collection of subjects taught at this school.</summary>
    public ICollection<Subject> Subjects { get; set; } = [];

    /// <summary>Gets or sets the collection of AI provider configurations for this school.</summary>
    public ICollection<SchoolAiProvider> SchoolAiProviders { get; set; } = [];

    /// <summary>Gets or sets the collection of AI model configurations for this school.</summary>
    public ICollection<SchoolAiModel> SchoolAiModels { get; set; } = [];
}
