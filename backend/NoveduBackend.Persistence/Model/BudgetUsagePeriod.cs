namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents a concrete budget usage period for a user, tracking cost entries within a date range.
/// </summary>
public class BudgetUsagePeriod
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="Model.User"/>.</summary>
    public int UserId { get; set; }

    /// <summary>Gets or sets the budget period type (daily, weekly, monthly, yearly).</summary>
    public BudgetPeriod BudgetPeriod { get; set; }

    /// <summary>Gets or sets the start date of this usage period.</summary>
    public LocalDate StartDate { get; set; }

    /// <summary>Gets or sets the end date of this usage period.</summary>
    public LocalDate EndDate { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the owning <see cref="Model.User"/>.</summary>
    public User User { get; set; } = null!;

    /// <summary>Gets or sets the collection of cost entries recorded within this period.</summary>
    public ICollection<CostEntry> CostEntries { get; set; } = [];
}
