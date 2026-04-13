namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents a file attachment associated with a chat <see cref="Message"/>.
/// </summary>
public class ChatAttachment
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the parent <see cref="Message"/>.</summary>
    public int MessageId { get; set; }

    /// <summary>Gets or sets the original file name.</summary>
    public required string Name { get; set; }

    /// <summary>Gets or sets the MIME type of the attachment.</summary>
    public required string Type { get; set; }

    /// <summary>Gets or sets the file size in bytes.</summary>
    public long Size { get; set; }

    /// <summary>Gets or sets the unique file identifier in storage.</summary>
    public required string FileId { get; set; }

    /// <summary>Gets or sets the timestamp when the file was uploaded.</summary>
    public Instant UploadedAt { get; set; }

    /// <summary>Gets or sets the storage location path.</summary>
    public required string Location { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the parent <see cref="Message"/>.</summary>
    public Message Message { get; set; } = null!;
}
