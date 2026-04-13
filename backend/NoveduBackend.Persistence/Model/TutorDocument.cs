namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents a document (knowledge base or assignment) attached to a <see cref="TutorConfig"/>.
/// </summary>
public class TutorDocument
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="TutorConfig"/>.</summary>
    public int TutorId { get; set; }

    /// <summary>Gets or sets the document kind (knowledge or assignment).</summary>
    public TutorDocumentKind Kind { get; set; }

    /// <summary>Gets or sets the original file name.</summary>
    public required string Name { get; set; }

    /// <summary>Gets or sets the MIME type of the document.</summary>
    public required string Type { get; set; }

    /// <summary>Gets or sets the file size in bytes.</summary>
    public long Size { get; set; }

    /// <summary>Gets or sets the unique file identifier in storage.</summary>
    public required string FileId { get; set; }

    /// <summary>Gets or sets the timestamp when the file was first uploaded.</summary>
    public Instant UploadedAt { get; set; }

    /// <summary>Gets or sets the timestamp when the file was last re-uploaded.</summary>
    public Instant LastUploadedAt { get; set; }

    /// <summary>Gets or sets the storage location path.</summary>
    public required string Location { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the timestamp when this record was last updated.</summary>
    public Instant UpdatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the owning <see cref="TutorConfig"/>.</summary>
    public TutorConfig Tutor { get; set; } = null!;
}
