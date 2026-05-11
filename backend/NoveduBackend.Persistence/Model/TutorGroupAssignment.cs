namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents the assignment of a <see cref="TutorConfig"/> to a <see cref="Group"/>,
/// optionally with a time-limited access window and an overriding budget.
/// </summary>
public class TutorGroupAssignment
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="TutorConfig"/>.</summary>
    public int TutorId { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="Model.Group"/>.</summary>
    public int GroupId { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="User"/> who assigned the tutor.</summary>
    public int AssignedById { get; set; }

    /// <summary>
    /// Gets or sets the optional foreign key to a <see cref="Model.BudgetConfig"/> that overrides
    /// the student budget for this tutor/class assignment (e.g. more tokens during tests).
    /// </summary>
    public int? BudgetConfigId { get; set; }

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

    /// <summary>Gets or sets the navigation property to the <see cref="Model.Group"/>.</summary>
    public Group Group { get; set; } = null!;

    /// <summary>Gets or sets the navigation property to the <see cref="User"/> who assigned the tutor.</summary>
    public User AssignedBy { get; set; } = null!;

    /// <summary>Gets or sets the optional navigation property to the overriding <see cref="Model.BudgetConfig"/>.</summary>
    public BudgetConfig? BudgetConfig { get; set; }
}
