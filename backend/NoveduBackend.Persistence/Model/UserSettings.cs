namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents per-user application settings such as language and notification preferences.
/// </summary>
public class UserSettings
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="Model.User"/>.</summary>
    public int UserId { get; set; }

    /// <summary>Gets or sets the user's preferred language code (e.g. "de", "en").</summary>
    public required string Language { get; set; }

    /// <summary>Gets or sets a value indicating whether the user should be notified when approaching the budget warning threshold.</summary>
    public bool NotifyBudgetWarning { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the timestamp when this record was last updated.</summary>
    public Instant UpdatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the owning <see cref="Model.User"/>.</summary>
    public User User { get; set; } = null!;
}
