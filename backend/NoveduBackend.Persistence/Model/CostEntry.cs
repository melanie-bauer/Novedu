namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents a single cost entry recording token usage and monetary cost for a message.
/// </summary>
public class CostEntry
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="Model.Message"/> that incurred this cost.</summary>
    public int MessageId { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="BudgetUsagePeriod"/> this entry belongs to.</summary>
    public int BudgetUsagePeriodId { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="TutorConfig"/> that generated this cost.</summary>
    public int TutorId { get; set; }

    /// <summary>Gets or sets the number of input tokens consumed.</summary>
    public int InputTokens { get; set; }

    /// <summary>Gets or sets the number of output tokens produced.</summary>
    public int OutputTokens { get; set; }

    /// <summary>Gets or sets the monetary cost of this entry.</summary>
    public decimal Cost { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the <see cref="Model.Message"/>.</summary>
    public Message Message { get; set; } = null!;

    /// <summary>Gets or sets the navigation property to the <see cref="BudgetUsagePeriod"/>.</summary>
    public BudgetUsagePeriod BudgetUsagePeriod { get; set; } = null!;

    /// <summary>Gets or sets the navigation property to the <see cref="TutorConfig"/>.</summary>
    public TutorConfig Tutor { get; set; } = null!;
}
