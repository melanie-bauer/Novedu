namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents an explicit share of a <see cref="TutorConfig"/> with either an individual
/// <see cref="Model.User"/> or a teacher-team <see cref="Model.Group"/>.
/// Exactly one of <see cref="UserId"/> or <see cref="GroupId"/> must be set.
/// </summary>
public class TutorCollaborator
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="TutorConfig"/> being shared.</summary>
    public int TutorId { get; set; }

    /// <summary>Gets or sets the optional foreign key to the recipient <see cref="Model.User"/>.</summary>
    public int? UserId { get; set; }

    /// <summary>Gets or sets the optional foreign key to the recipient teacher-team <see cref="Model.Group"/>.</summary>
    public int? GroupId { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="Model.User"/> who created this share.</summary>
    public int SharedById { get; set; }

    /// <summary>Gets or sets the permission level granted by this share.</summary>
    public TutorPermission Permission { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the shared <see cref="TutorConfig"/>.</summary>
    public TutorConfig Tutor { get; set; } = null!;

    /// <summary>Gets or sets the optional navigation property to the recipient <see cref="Model.User"/>.</summary>
    public User? User { get; set; }

    /// <summary>Gets or sets the optional navigation property to the recipient teacher-team <see cref="Model.Group"/>.</summary>
    public Group? Group { get; set; }

    /// <summary>Gets or sets the navigation property to the <see cref="Model.User"/> who created this share.</summary>
    public User SharedBy { get; set; } = null!;
}
