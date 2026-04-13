namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents an AI model offered by a provider, including its pricing and token limits.
/// </summary>
public class AiModel
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the foreign key to the <see cref="AiProvider"/>.</summary>
    public int ProviderId { get; set; }

    /// <summary>Gets or sets the model name (e.g. "gpt-4o").</summary>
    public required string Name { get; set; }

    /// <summary>Gets or sets an optional human-readable description.</summary>
    public string? Description { get; set; }

    /// <summary>Gets or sets the cost per one million input tokens.</summary>
    public decimal CostPerMillionInputTokens { get; set; }

    /// <summary>Gets or sets the cost per one million output tokens.</summary>
    public decimal CostPerMillionOutputTokens { get; set; }

    /// <summary>Gets or sets the cost per one million cached input tokens.</summary>
    public decimal CostPerMillionCachedInputTokens { get; set; }

    /// <summary>Gets or sets the maximum number of input tokens the model accepts.</summary>
    public int MaxInputTokens { get; set; }

    /// <summary>Gets or sets the maximum number of output tokens the model can produce.</summary>
    public int MaxOutputTokens { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the timestamp when this record was last updated.</summary>
    public Instant UpdatedAt { get; set; }

    /// <summary>Gets or sets the navigation property to the owning <see cref="AiProvider"/>.</summary>
    public AiProvider Provider { get; set; } = null!;

    /// <summary>Gets or sets the collection of school-specific model configurations.</summary>
    public ICollection<SchoolAiModel> SchoolAiModels { get; set; } = [];

    /// <summary>Gets or sets the collection of tutor configurations that use this model.</summary>
    public ICollection<TutorConfig> Tutors { get; set; } = [];
}
