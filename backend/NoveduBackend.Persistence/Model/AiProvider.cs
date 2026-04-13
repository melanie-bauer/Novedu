namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Represents an AI provider (e.g. OpenAI, Anthropic) that offers one or more <see cref="AiModel"/>s.
/// </summary>
public class AiProvider
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public int Id { get; set; }

    /// <summary>Gets or sets the provider name.</summary>
    public required string Name { get; set; }

    /// <summary>Gets or sets an optional description of the provider.</summary>
    public string? Description { get; set; }

    /// <summary>Gets or sets the timestamp when this record was created.</summary>
    public Instant CreatedAt { get; set; }

    /// <summary>Gets or sets the timestamp when this record was last updated.</summary>
    public Instant UpdatedAt { get; set; }

    /// <summary>Gets or sets the collection of AI models offered by this provider.</summary>
    public ICollection<AiModel> Models { get; set; } = [];

    /// <summary>Gets or sets the collection of school-specific provider configurations.</summary>
    public ICollection<SchoolAiProvider> SchoolAiProviders { get; set; } = [];
}
