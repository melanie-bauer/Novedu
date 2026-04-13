namespace NoveduBackend.Persistence.Model;

/// <summary>
/// Defines the period over which a budget resets.
/// </summary>
public enum BudgetPeriod
{
    /// <summary>Budget resets every day.</summary>
    Daily,

    /// <summary>Budget resets every week.</summary>
    Weekly,

    /// <summary>Budget resets every month.</summary>
    Monthly,

    /// <summary>Budget resets every year.</summary>
    Yearly
}

/// <summary>
/// Defines the type of entity a <see cref="BudgetConfig"/> applies to.
/// </summary>
public enum BudgetConfigType
{
    /// <summary>Budget applies to a role.</summary>
    Role,

    /// <summary>Budget applies to a group.</summary>
    Group,

    /// <summary>Budget applies to an individual user.</summary>
    User
}

/// <summary>
/// Defines the didactic interaction mode used by a tutor.
/// </summary>
public enum DidacticMode
{
    /// <summary>Guides the student through questions to reach the answer themselves.</summary>
    Socratic,

    /// <summary>Provides incremental hints toward the solution.</summary>
    Hints,

    /// <summary>Walks the student through a step-by-step solution.</summary>
    StepByStep,

    /// <summary>Gives brief, direct answers.</summary>
    Concise
}

/// <summary>
/// Defines the role of a participant in a chat message.
/// </summary>
public enum MessageRole
{
    /// <summary>The message was sent by the user.</summary>
    User,

    /// <summary>The message was sent by the AI assistant.</summary>
    Assistant
}

/// <summary>
/// Defines the kind of document attached to a tutor configuration.
/// </summary>
public enum TutorDocumentKind
{
    /// <summary>A knowledge-base document providing reference material.</summary>
    Knowledge,

    /// <summary>An assignment document for student tasks.</summary>
    Assignment
}
