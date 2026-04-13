namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents a group of users within a school (e.g. a class or course).
/// </summary>
public class Group
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="GroupType"/>.</summary>
    public int GroupTypeId { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="Model.School"/>.</summary>
    public int SchoolId { get; set; }

    /// <summary>Gets or sets the optional foreign key to a <see cref="BudgetConfig"/>.</summary>
    public int? BudgetConfigId { get; set; }

    /// <summary>Gets or sets the group name.</summary>
    public required string Name { get; set; }

    /// <summary>Gets or sets an optional description.</summary>
    public string? Description { get; set; }

    /// <summary>Gets or sets a value indicating whether this group is currently active.</summary>
    public bool IsActive { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the timestamp when this record was last updated.</summary>
    public Instant UpdatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the <see cref="GroupType"/>.</summary>
    public GroupType GroupType { get; set; } = null!;

    /// <summary>Gets or sets the navigation property to the owning <see cref="Model.School"/>.</summary>
    public School School { get; set; } = null!;

    /// <summary>Gets or sets the optional navigation property to the <see cref="BudgetConfig"/>.</summary>
    public BudgetConfig? BudgetConfig { get; set; }

    /// <summary>Gets or sets the collection of members in this group.</summary>
    public ICollection<GroupMember> Members { get; set; } = [];

    /// <summary>Gets or sets the collection of tutor assignments for this group.</summary>
    public ICollection<TutorGroupAssignment> TutorAssignments { get; set; } = [];
}
