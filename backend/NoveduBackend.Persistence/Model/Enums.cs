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
    User = 30,

    /// <summary>Budget overrides the student budget for a specific tutor/class assignment.</summary>
    TutorOverride = 40
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

/// <summary>
/// Defines the visibility of a <see cref="TutorConfig"/>.
/// </summary>
public enum TutorVisibility
{
    /// <summary>Visible only to the creator (draft).</summary>
    Private = 10,

    /// <summary>Visible to all teachers of the school.</summary>
    Internal = 20,

    /// <summary>Visible to all students as well.</summary>
    Public = 30
}

/// <summary>
/// Defines the permission level granted on a shared <see cref="TutorConfig"/>.
/// </summary>
public enum TutorPermission
{
    /// <summary>The recipient may use the tutor but not modify it.</summary>
    ReadOnly = 10,

    /// <summary>The recipient may modify the tutor configuration.</summary>
    Editable = 20
}

/// <summary>
/// Defines the category of a <see cref="MessageMonitoringFlag"/>.
/// </summary>
public enum MonitoringFlagType
{
    /// <summary>The message looks like spam.</summary>
    Spam = 10,

    /// <summary>The message is nonsensical.</summary>
    Nonsense = 20,

    /// <summary>The message is off-topic for the tutor's subject.</summary>
    OffTopic = 30,

    /// <summary>The message contains inappropriate content.</summary>
    Inappropriate = 40,

    /// <summary>The message is flagged for another reason.</summary>
    Other = 50
}

/// <summary>
/// Defines the severity of a <see cref="MessageMonitoringFlag"/>.
/// </summary>
public enum MonitoringSeverity
{
    /// <summary>Low-severity issue.</summary>
    Low = 10,

    /// <summary>Medium-severity issue.</summary>
    Medium = 20,

    /// <summary>High-severity issue.</summary>
    High = 30
}
