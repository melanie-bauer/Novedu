namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents the membership of a <see cref="User"/> in a <see cref="Group"/>.
/// </summary>
public class GroupMember
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="Model.Group"/>.</summary>
    public int GroupId { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="Model.User"/>.</summary>
    public int UserId { get; set; }

    /// <summary>Gets or sets the timestamp when this membership was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the <see cref="Model.Group"/>.</summary>
    public Group Group { get; set; } = null!;

    /// <summary>Gets or sets the navigation property to the <see cref="Model.User"/>.</summary>
    public User User { get; set; } = null!;
}
