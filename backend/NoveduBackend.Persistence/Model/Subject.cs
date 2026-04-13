namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents an academic subject taught at a school (e.g. Mathematics, English).
/// </summary>
public class Subject
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="Model.School"/>.</summary>
    public int SchoolId { get; set; }

    /// <summary>Gets or sets the subject name.</summary>
    public required string Name { get; set; }

    /// <summary>Gets or sets an optional icon identifier for the subject.</summary>
    public string? Icon { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the timestamp when this record was last updated.</summary>
    public Instant UpdatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the owning <see cref="Model.School"/>.</summary>
    public School School { get; set; } = null!;

    /// <summary>Gets or sets the collection of tutors configured for this subject.</summary>
    public ICollection<TutorConfig> Tutors { get; set; } = [];
}
