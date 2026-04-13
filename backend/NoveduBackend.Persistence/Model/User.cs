namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents a user of the platform, authenticated via Microsoft Entra ID.
/// </summary>
public class User
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="Model.School"/>.</summary>
    public int SchoolId { get; set; }

    /// <summary>Gets or sets the optional foreign key to a user-specific <see cref="BudgetConfig"/>.</summary>
    public int? BudgetConfigId { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="Model.Role"/>.</summary>
    public int RoleId { get; set; }

    /// <summary>Gets or sets the Microsoft Entra ID object identifier.</summary>
    public required string EntraOid { get; set; }

    /// <summary>Gets or sets the user's display name.</summary>
    public required string Name { get; set; }

    /// <summary>Gets or sets the user's email address.</summary>
    public required string Email { get; set; }

    /// <summary>Gets or sets a value indicating whether this is the user's first login.</summary>
    public bool IsFirstLogin { get; set; }

    /// <summary>Gets or sets a value indicating whether the user account is active.</summary>
    public bool IsActive { get; set; }

    /// <summary>Gets or sets the timestamp of the user's last login, if any.</summary>
    public Instant? LastLoginAt { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the timestamp when this record was last updated.</summary>
    public Instant UpdatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the <see cref="Model.School"/>.</summary>
    public School School { get; set; } = null!;

    /// <summary>Gets or sets the optional navigation property to the user-specific <see cref="BudgetConfig"/>.</summary>
    public BudgetConfig? BudgetConfig { get; set; }

    /// <summary>Gets or sets the navigation property to the <see cref="Model.Role"/>.</summary>
    public Role Role { get; set; } = null!;

    /// <summary>Gets or sets the optional navigation property to the user's <see cref="UserSettings"/>.</summary>
    public UserSettings? Settings { get; set; }

    /// <summary>Gets or sets the collection of budget usage periods for this user.</summary>
    public ICollection<BudgetUsagePeriod> BudgetUsagePeriods { get; set; } = [];

    /// <summary>Gets or sets the collection of group memberships.</summary>
    public ICollection<GroupMember> GroupMemberships { get; set; } = [];

    /// <summary>Gets or sets the collection of tutors created by this user.</summary>
    public ICollection<TutorConfig> CreatedTutors { get; set; } = [];

    /// <summary>Gets or sets the collection of tutor assignments for this user.</summary>
    public ICollection<TutorStudentAssignment> TutorAssignments { get; set; } = [];

    /// <summary>Gets or sets the collection of chats owned by this user.</summary>
    public ICollection<Chat> Chats { get; set; } = [];
}
