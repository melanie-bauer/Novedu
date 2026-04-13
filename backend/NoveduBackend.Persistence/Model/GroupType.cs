namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents a category of groups (e.g. "class", "course", "department").
/// </summary>
public class GroupType
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the unique code identifying this group type.</summary>
    public required string Code { get; set; }

    /// <summary>Gets or sets the display name.</summary>
    public required string Name { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the collection of groups of this type.</summary>
    public ICollection<Group> Groups { get; set; } = [];
}
