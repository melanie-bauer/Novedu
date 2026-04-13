namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents a chat conversation between a user and a tutor.
/// </summary>
public class Chat
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="Model.User"/> who owns this chat.</summary>
    public int UserId { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="TutorConfig"/> used in this chat.</summary>
    public int TutorId { get; set; }

    /// <summary>Gets or sets an optional title for the chat.</summary>
    public string? Title { get; set; }

    /// <summary>Gets or sets the timestamp when this chat was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the timestamp when this chat was last updated.</summary>
    public Instant UpdatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the owning <see cref="Model.User"/>.</summary>
    public User User { get; set; } = null!;

    /// <summary>Gets or sets the navigation property to the <see cref="TutorConfig"/>.</summary>
    public TutorConfig Tutor { get; set; } = null!;

    /// <summary>Gets or sets the collection of messages in this chat.</summary>
    public ICollection<Message> Messages { get; set; } = [];
}
