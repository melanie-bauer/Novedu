namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents a single message within a <see cref="Chat"/>.
/// </summary>
public class Message
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the parent <see cref="Model.Chat"/>.</summary>
    public int ChatId { get; set; }

    /// <summary>Gets or sets the role of the message sender (user or assistant).</summary>
    public MessageRole Role { get; set; }

    /// <summary>Gets or sets the text content of the message.</summary>
    public required string Content { get; set; }

    /// <summary>Gets or sets the timestamp when this message was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the parent <see cref="Model.Chat"/>.</summary>
    public Chat Chat { get; set; } = null!;

    /// <summary>Gets or sets the collection of file attachments on this message.</summary>
    public ICollection<ChatAttachment> Attachments { get; set; } = [];

    /// <summary>Gets or sets the collection of cost entries associated with this message.</summary>
    public ICollection<CostEntry> CostEntries { get; set; } = [];
}
