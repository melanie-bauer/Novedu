namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents a user role within a school (e.g. student, teacher, admin).
/// </summary>
public class Role
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="Model.School"/>.</summary>
    public int SchoolId { get; set; }

    /// <summary>Gets or sets the optional foreign key to a <see cref="BudgetConfig"/>.</summary>
    public int? BudgetConfigId { get; set; }

    /// <summary>Gets or sets the role name.</summary>
    public required string Name { get; set; }

    /// <summary>Gets or sets an optional description of the role.</summary>
    public string? Description { get; set; }

    /// <summary>Gets or sets a value indicating whether this is a built-in system role.</summary>
    public bool IsSystem { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the timestamp when this record was last updated.</summary>
    public Instant UpdatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the owning <see cref="Model.School"/>.</summary>
    public School School { get; set; } = null!;

    /// <summary>Gets or sets the optional navigation property to the <see cref="BudgetConfig"/>.</summary>
    public BudgetConfig? BudgetConfig { get; set; }

    /// <summary>Gets or sets the collection of users assigned to this role.</summary>
    public ICollection<User> Users { get; set; } = [];
}
