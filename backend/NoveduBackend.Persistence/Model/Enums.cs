namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Defines the period over which a budget resets.
/// </summary>
public enum BudgetPeriod
{
    /// <summary>Budget resets every day.</summary>
    Daily = 10,

    /// <summary>Budget resets every week.</summary>
    Weekly = 20,

    /// <summary>Budget resets every month.</summary>
    Monthly = 30,

    /// <summary>Budget resets every year.</summary>
    Yearly = 40
}

/// <summary>
/// Defines the type of entity a <see cref="BudgetConfig"/> applies to.
/// </summary>
public enum BudgetConfigType
{
    /// <summary>Budget applies to a role.</summary>
    Role = 10,

    /// <summary>Budget applies to a group.</summary>
    Group = 20,

    /// <summary>Budget applies to an individual user.</summary>
    User = 30
}

/// <summary>
/// Defines the didactic interaction mode used by a tutor.
/// </summary>
public enum DidacticMode
{
    /// <summary>Guides the student through questions to reach the answer themselves.</summary>
    Socratic = 10,

    /// <summary>Provides incremental hints toward the solution.</summary>
    Hints = 20,

    /// <summary>Walks the student through a step-by-step solution.</summary>
    StepByStep = 30,

    /// <summary>Gives brief, direct answers.</summary>
    Concise = 40
}

/// <summary>
/// Defines the role of a participant in a chat message.
/// </summary>
public enum MessageRole
{
    /// <summary>The message was sent by the user.</summary>
    User = 10,

    /// <summary>The message was sent by the AI assistant.</summary>
    Assistant = 20
}

/// <summary>
/// Defines the kind of document attached to a tutor configuration.
/// </summary>
public enum TutorDocumentKind
{
    /// <summary>A knowledge-base document providing reference material.</summary>
    Knowledge = 10,

    /// <summary>An assignment document for student tasks.</summary>
    Assignment = 20
}
