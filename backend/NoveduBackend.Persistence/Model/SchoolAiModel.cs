namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents the association between a <see cref="Model.School"/> and an <see cref="AiModel"/>,
/// controlling whether the model is enabled for that school.
/// </summary>
public class SchoolAiModel
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="Model.School"/>.</summary>
    public int SchoolId { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="AiModel"/>.</summary>
    public int ModelId { get; set; }

    /// <summary>Gets or sets a value indicating whether this model is enabled for the school.</summary>
    public bool IsEnabled { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the timestamp when this record was last updated.</summary>
    public Instant UpdatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the <see cref="Model.School"/>.</summary>
    public School School { get; set; } = null!;

    /// <summary>Gets or sets the navigation property to the <see cref="AiModel"/>.</summary>
    public AiModel Model { get; set; } = null!;
}
