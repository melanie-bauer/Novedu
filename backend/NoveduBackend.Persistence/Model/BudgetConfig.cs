namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents a budget configuration that defines spending limits and warning thresholds for a given period.
/// </summary>
public class BudgetConfig
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the type of entity this budget applies to (role, group, or user).</summary>
    public BudgetConfigType Type { get; set; }

    /// <summary>Gets or sets the period over which the budget resets.</summary>
    public BudgetPeriod BudgetPeriod { get; set; }

    /// <summary>Gets or sets the maximum spending amount for the period.</summary>
    public decimal LimitAmount { get; set; }

    /// <summary>Gets or sets the percentage threshold at which a warning is triggered.</summary>
    public short WarningThreshold { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the timestamp when this record was last updated.</summary>
    public Instant UpdatedAt { get; set; }
}
