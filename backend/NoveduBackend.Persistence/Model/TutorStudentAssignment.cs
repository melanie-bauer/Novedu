namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents the assignment of a <see cref="TutorConfig"/> to an individual <see cref="User"/>,
/// optionally with a time-limited access window.
/// </summary>
public class TutorStudentAssignment
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="TutorConfig"/>.</summary>
    public int TutorId { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="Model.User"/>.</summary>
    public int UserId { get; set; }

    /// <summary>Gets or sets the timestamp from which this assignment is active.</summary>
    public Instant EnabledFrom { get; set; }

    /// <summary>Gets or sets the optional timestamp until which this assignment is active.</summary>
    public Instant? EnabledUntil { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the timestamp when this record was last updated.</summary>
    public Instant UpdatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the <see cref="TutorConfig"/>.</summary>
    public TutorConfig Tutor { get; set; } = null!;

    /// <summary>Gets or sets the navigation property to the <see cref="Model.User"/>.</summary>
    public User User { get; set; } = null!;
}
