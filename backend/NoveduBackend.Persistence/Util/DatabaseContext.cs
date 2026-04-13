using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using NoveduBackend.Persistence.Model;

namespace NoveduBackend.Persistence.Util;

/// <summary>
/// Entity Framework database context for the Novedu backend, defining all entity sets and their configurations.
/// </summary>
/// <param name="options">The database context options.</param>
public sealed class DatabaseContext(DbContextOptions<DatabaseContext> options) : DbContext(options)
{
    /// <summary>The database schema name used for all Novedu tables.</summary>
    public const string SchemaName = "NoveduBackend";

    /// <summary>Gets the set of <see cref="School"/> entities.</summary>
    public DbSet<School> Schools => Set<School>();

    /// <summary>Gets the set of <see cref="SchoolEntraConfig"/> entities.</summary>
    public DbSet<SchoolEntraConfig> SchoolEntraConfigs => Set<SchoolEntraConfig>();

    /// <summary>Gets the set of <see cref="User"/> entities.</summary>
    public DbSet<User> Users => Set<User>();

    /// <summary>Gets the set of <see cref="UserSettings"/> entities.</summary>
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();

    /// <summary>Gets the set of <see cref="BudgetUsagePeriod"/> entities.</summary>
    public DbSet<BudgetUsagePeriod> BudgetUsagePeriods => Set<BudgetUsagePeriod>();

    /// <summary>Gets the set of <see cref="GroupType"/> entities.</summary>
    public DbSet<GroupType> GroupTypes {get; set;}

    /// <summary>Gets the set of <see cref="Group"/> entities.</summary>
    public DbSet<Group> Groups {get; set;}

    /// <summary>Gets the set of <see cref="GroupMember"/> entities.</summary>
    public DbSet<GroupMember> GroupMembers {get; set;}

    /// <summary>Gets the set of <see cref="Role"/> entities.</summary>
    public DbSet<Role> Roles {get; set;}

    /// <summary>Gets the set of <see cref="Subject"/> entities.</summary>
    public DbSet<Subject> Subjects {get; set;}

    /// <summary>Gets the set of <see cref="AiProvider"/> entities.</summary>
    public DbSet<AiProvider> AiProviders {get; set;}

    /// <summary>Gets the set of <see cref="AiModel"/> entities.</summary>
    public DbSet<AiModel> AiModels {get; set;}

    /// <summary>Gets the set of <see cref="SchoolAiProvider"/> entities.</summary>
    public DbSet<SchoolAiProvider> SchoolAiProviders {get; set;}

    /// <summary>Gets the set of <see cref="SchoolAiModel"/> entities.</summary>
    public DbSet<SchoolAiModel> SchoolAiModels {get; set;}

    /// <summary>Gets the set of <see cref="TutorConfig"/> entities.</summary>
    public DbSet<TutorConfig> TutorConfigs {get; set;}

    /// <summary>Gets the set of <see cref="TutorGroupAssignment"/> entities.</summary>
    public DbSet<TutorGroupAssignment> TutorGroupAssignments {get; set;}

    /// <summary>Gets the set of <see cref="TutorStudentAssignment"/> entities.</summary>
    public DbSet<TutorStudentAssignment> TutorStudentAssignments {get; set;}

    /// <summary>Gets the set of <see cref="TutorDocument"/> entities.</summary>
    public DbSet<TutorDocument> TutorDocuments {get; set;}

    /// <summary>Gets the set of <see cref="Chat"/> entities.</summary>
    public DbSet<Chat> Chats {get; set;}

    /// <summary>Gets the set of <see cref="Message"/> entities.</summary>
    public DbSet<Message> Messages {get; set;}

    /// <summary>Gets the set of <see cref="ChatAttachment"/> entities.</summary>
    public DbSet<ChatAttachment> ChatAttachments {get; set;}

    /// <summary>Gets the set of <see cref="BudgetConfig"/> entities.</summary>
    public DbSet<BudgetConfig> BudgetConfigs {get; set;}

    /// <summary>Gets the set of <see cref="CostEntry"/> entities.</summary>
    public DbSet<CostEntry> CostEntries {get; set;}

    /// <summary>Gets the set of <see cref="GlobalSettings"/> entities.</summary>
    public DbSet<GlobalSettings> GlobalSettings {get; set;}

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasDefaultSchema(SchemaName);

        modelBuilder.HasPostgresEnum<BudgetPeriod>();
        modelBuilder.HasPostgresEnum<BudgetConfigType>();
        modelBuilder.HasPostgresEnum<DidacticMode>();
        modelBuilder.HasPostgresEnum<MessageRole>();
        modelBuilder.HasPostgresEnum<TutorDocumentKind>();

        ConfigureSchool(modelBuilder);
        ConfigureSchoolEntraConfig(modelBuilder);
        ConfigureUser(modelBuilder);
        ConfigureUserSettings(modelBuilder);
        ConfigureBudgetUsagePeriod(modelBuilder);
        ConfigureGroupType(modelBuilder);
        ConfigureGroup(modelBuilder);
        ConfigureGroupMember(modelBuilder);
        ConfigureRole(modelBuilder);
        ConfigureSubject(modelBuilder);
        ConfigureAiProvider(modelBuilder);
        ConfigureAiModel(modelBuilder);
        ConfigureSchoolAiProvider(modelBuilder);
        ConfigureSchoolAiModel(modelBuilder);
        ConfigureTutorConfig(modelBuilder);
        ConfigureTutorGroupAssignment(modelBuilder);
        ConfigureTutorStudentAssignment(modelBuilder);
        ConfigureTutorDocument(modelBuilder);
        ConfigureChat(modelBuilder);
        ConfigureMessage(modelBuilder);
        ConfigureChatAttachment(modelBuilder);
        ConfigureBudgetConfig(modelBuilder);
        ConfigureCostEntry(modelBuilder);
        ConfigureGlobalSettings(modelBuilder);
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);

        configurationBuilder.Conventions.Remove<TableNameFromDbSetConvention>();
    }

    private static void ConfigureSchool(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<School>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(255);
        });
    }

    private static void ConfigureSchoolEntraConfig(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SchoolEntraConfig>(entity =>
        {
            entity.Property(e => e.ClientSecretEncrypted).HasMaxLength(1024);
            entity.Property(e => e.RedirectUri).HasMaxLength(1024);

            entity.HasOne(e => e.School)
                  .WithOne(e => e.EntraConfig)
                  .HasForeignKey<SchoolEntraConfig>(e => e.SchoolId);

            entity.HasIndex(e => e.SchoolId).IsUnique();
        });
    }

    private static void ConfigureUser(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.EntraOid).HasMaxLength(36);
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.Email).HasColumnType("citext");

            entity.HasOne(e => e.School)
                  .WithMany(e => e.Users)
                  .HasForeignKey(e => e.SchoolId);

            entity.HasOne(e => e.Role)
                  .WithMany(e => e.Users)
                  .HasForeignKey(e => e.RoleId);

            entity.HasOne(e => e.BudgetConfig)
                  .WithMany()
                  .HasForeignKey(e => e.BudgetConfigId);

            entity.HasIndex(e => e.EntraOid).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
        });
    }

    private static void ConfigureUserSettings(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserSettings>(entity =>
        {
            entity.Property(e => e.Language).HasMaxLength(10);

            entity.HasOne(e => e.User)
                  .WithOne(e => e.Settings)
                  .HasForeignKey<UserSettings>(e => e.UserId);

            entity.HasIndex(e => e.UserId).IsUnique();
        });
    }

    private static void ConfigureBudgetUsagePeriod(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BudgetUsagePeriod>(entity =>
        {
            entity.HasOne(e => e.User)
                  .WithMany(e => e.BudgetUsagePeriods)
                  .HasForeignKey(e => e.UserId);
        });
    }

    private static void ConfigureGroupType(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<GroupType>(entity =>
        {
            entity.Property(e => e.Code).HasMaxLength(100);
            entity.Property(e => e.Name).HasMaxLength(255);

            entity.HasIndex(e => e.Code).IsUnique();
        });
    }

    private static void ConfigureGroup(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Group>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(255);

            entity.HasOne(e => e.GroupType)
                  .WithMany(e => e.Groups)
                  .HasForeignKey(e => e.GroupTypeId);

            entity.HasOne(e => e.School)
                  .WithMany(e => e.Groups)
                  .HasForeignKey(e => e.SchoolId);

            entity.HasOne(e => e.BudgetConfig)
                  .WithMany()
                  .HasForeignKey(e => e.BudgetConfigId);
        });
    }

    private static void ConfigureGroupMember(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<GroupMember>(entity =>
        {
            entity.HasOne(e => e.Group)
                  .WithMany(e => e.Members)
                  .HasForeignKey(e => e.GroupId);

            entity.HasOne(e => e.User)
                  .WithMany(e => e.GroupMemberships)
                  .HasForeignKey(e => e.UserId);

            entity.HasIndex(e => new { e.GroupId, e.UserId }).IsUnique();
        });
    }

    private static void ConfigureRole(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Role>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(255);

            entity.HasOne(e => e.School)
                  .WithMany(e => e.Roles)
                  .HasForeignKey(e => e.SchoolId);

            entity.HasOne(e => e.BudgetConfig)
                  .WithMany()
                  .HasForeignKey(e => e.BudgetConfigId);
        });
    }

    private static void ConfigureSubject(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Subject>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.Icon).HasMaxLength(100);

            entity.HasOne(e => e.School)
                  .WithMany(e => e.Subjects)
                  .HasForeignKey(e => e.SchoolId);
        });
    }

    private static void ConfigureAiProvider(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AiProvider>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(255);
        });
    }

    private static void ConfigureAiModel(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AiModel>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.CostPerMillionInputTokens).HasPrecision(10, 6);
            entity.Property(e => e.CostPerMillionOutputTokens).HasPrecision(10, 6);
            entity.Property(e => e.CostPerMillionCachedInputTokens).HasPrecision(10, 6);

            entity.HasOne(e => e.Provider)
                  .WithMany(e => e.Models)
                  .HasForeignKey(e => e.ProviderId);
        });
    }

    private static void ConfigureSchoolAiProvider(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SchoolAiProvider>(entity =>
        {
            entity.Property(e => e.ApiKeyEncrypted).HasMaxLength(1024);

            entity.HasOne(e => e.School)
                  .WithMany(e => e.SchoolAiProviders)
                  .HasForeignKey(e => e.SchoolId);

            entity.HasOne(e => e.Provider)
                  .WithMany(e => e.SchoolAiProviders)
                  .HasForeignKey(e => e.ProviderId);

            entity.HasIndex(e => new { e.SchoolId, e.ProviderId }).IsUnique();
        });
    }

    private static void ConfigureSchoolAiModel(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SchoolAiModel>(entity =>
        {
            entity.HasOne(e => e.School)
                  .WithMany(e => e.SchoolAiModels)
                  .HasForeignKey(e => e.SchoolId);

            entity.HasOne(e => e.Model)
                  .WithMany(e => e.SchoolAiModels)
                  .HasForeignKey(e => e.ModelId);

            entity.HasIndex(e => new { e.SchoolId, e.ModelId }).IsUnique();
        });
    }

    private static void ConfigureTutorConfig(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TutorConfig>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(255);

            entity.HasOne(e => e.Subject)
                  .WithMany(e => e.Tutors)
                  .HasForeignKey(e => e.SubjectId);

            entity.HasOne(e => e.Model)
                  .WithMany(e => e.Tutors)
                  .HasForeignKey(e => e.ModelId);

            entity.HasOne(e => e.CreatedBy)
                  .WithMany(e => e.CreatedTutors)
                  .HasForeignKey(e => e.CreatedById);
        });
    }

    private static void ConfigureTutorGroupAssignment(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TutorGroupAssignment>(entity =>
        {
            entity.HasOne(e => e.Tutor)
                  .WithMany(e => e.GroupAssignments)
                  .HasForeignKey(e => e.TutorId);

            entity.HasOne(e => e.Group)
                  .WithMany(e => e.TutorAssignments)
                  .HasForeignKey(e => e.GroupId);

            entity.HasIndex(e => new { e.TutorId, e.GroupId }).IsUnique();
        });
    }

    private static void ConfigureTutorStudentAssignment(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TutorStudentAssignment>(entity =>
        {
            entity.HasOne(e => e.Tutor)
                  .WithMany(e => e.StudentAssignments)
                  .HasForeignKey(e => e.TutorId);

            entity.HasOne(e => e.User)
                  .WithMany(e => e.TutorAssignments)
                  .HasForeignKey(e => e.UserId);

            entity.HasIndex(e => new { e.TutorId, e.UserId }).IsUnique();
        });
    }

    private static void ConfigureTutorDocument(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TutorDocument>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.Type).HasMaxLength(100);
            entity.Property(e => e.FileId).HasMaxLength(255);
            entity.Property(e => e.Location).HasMaxLength(1024);

            entity.HasOne(e => e.Tutor)
                  .WithMany(e => e.Documents)
                  .HasForeignKey(e => e.TutorId);
        });
    }

    private static void ConfigureChat(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Chat>(entity =>
        {
            entity.Property(e => e.Title).HasMaxLength(255);

            entity.HasOne(e => e.User)
                  .WithMany(e => e.Chats)
                  .HasForeignKey(e => e.UserId);

            entity.HasOne(e => e.Tutor)
                  .WithMany(e => e.Chats)
                  .HasForeignKey(e => e.TutorId);
        });
    }

    private static void ConfigureMessage(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasOne(e => e.Chat)
                  .WithMany(e => e.Messages)
                  .HasForeignKey(e => e.ChatId);
        });
    }

    private static void ConfigureChatAttachment(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ChatAttachment>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.Type).HasMaxLength(100);
            entity.Property(e => e.FileId).HasMaxLength(255);
            entity.Property(e => e.Location).HasMaxLength(1024);

            entity.HasOne(e => e.Message)
                  .WithMany(e => e.Attachments)
                  .HasForeignKey(e => e.MessageId);
        });
    }

    private static void ConfigureBudgetConfig(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BudgetConfig>(entity =>
        {
            entity.Property(e => e.LimitAmount).HasPrecision(12, 2);
        });
    }

    private static void ConfigureCostEntry(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CostEntry>(entity =>
        {
            entity.Property(e => e.Cost).HasPrecision(12, 2);

            entity.HasOne(e => e.Message)
                  .WithMany(e => e.CostEntries)
                  .HasForeignKey(e => e.MessageId);

            entity.HasOne(e => e.BudgetUsagePeriod)
                  .WithMany(e => e.CostEntries)
                  .HasForeignKey(e => e.BudgetUsagePeriodId);

            entity.HasOne(e => e.Tutor)
                  .WithMany(e => e.CostEntries)
                  .HasForeignKey(e => e.TutorId);
        });
    }

    private static void ConfigureGlobalSettings(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<GlobalSettings>(entity =>
        {
            entity.HasOne(e => e.School)
                  .WithOne(e => e.GlobalSettings)
                  .HasForeignKey<GlobalSettings>(e => e.SchoolId);

            entity.HasOne(e => e.LastModifiedBy)
                  .WithMany()
                  .HasForeignKey(e => e.LastModifiedById);

            entity.HasIndex(e => e.SchoolId).IsUnique();
        });
    }
}
