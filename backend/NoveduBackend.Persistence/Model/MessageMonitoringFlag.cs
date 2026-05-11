namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents an automatic, anonymized AI monitoring flag attached to a chat <see cref="Message"/>.
/// Detects spam, nonsense, off-topic and similar issues; teachers see only aggregated/anonymized results.
/// </summary>
public class MessageMonitoringFlag
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the flagged <see cref="Model.Message"/>.</summary>
    public int MessageId { get; set; }

    /// <summary>Gets or sets the optional foreign key to the <see cref="User"/> who reviewed this flag.</summary>
    public int? ReviewedById { get; set; }

    /// <summary>Gets or sets the category of the flag.</summary>
    public MonitoringFlagType FlagType { get; set; }

    /// <summary>Gets or sets the severity level of the flag.</summary>
    public MonitoringSeverity Severity { get; set; }

    /// <summary>Gets or sets additional details produced by the monitoring AI.</summary>
    public string? Details { get; set; }

    /// <summary>Gets or sets a value indicating whether this flag has been reviewed.</summary>
    public bool IsReviewed { get; set; }

    /// <summary>Gets or sets the optional timestamp when the flag was reviewed.</summary>
    public Instant? ReviewedAt { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the flagged <see cref="Model.Message"/>.</summary>
    public Message Message { get; set; } = null!;

    /// <summary>Gets or sets the optional navigation property to the reviewing <see cref="User"/>.</summary>
    public User? ReviewedBy { get; set; }
}
