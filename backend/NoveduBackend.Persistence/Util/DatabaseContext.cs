using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
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
    public DbSet<GroupType> GroupTypes { get; set; }

    /// <summary>Gets the set of <see cref="Group"/> entities.</summary>
    public DbSet<Group> Groups { get; set; }

    /// <summary>Gets the set of <see cref="GroupMember"/> entities.</summary>
    public DbSet<GroupMember> GroupMembers { get; set; }

    /// <summary>Gets the set of <see cref="Role"/> entities.</summary>
    public DbSet<Role> Roles { get; set; }

    /// <summary>Gets the set of <see cref="Subject"/> entities.</summary>
    public DbSet<Subject> Subjects { get; set; }

    /// <summary>Gets the set of <see cref="AiProvider"/> entities.</summary>
    public DbSet<AiProvider> AiProviders { get; set; }

    /// <summary>Gets the set of <see cref="AiModel"/> entities.</summary>
    public DbSet<AiModel> AiModels { get; set; }

    /// <summary>Gets the set of <see cref="SchoolAiProvider"/> entities.</summary>
    public DbSet<SchoolAiProvider> SchoolAiProviders { get; set; }

    /// <summary>Gets the set of <see cref="SchoolAiModel"/> entities.</summary>
    public DbSet<SchoolAiModel> SchoolAiModels { get; set; }

    /// <summary>Gets the set of <see cref="TutorConfig"/> entities.</summary>
    public DbSet<TutorConfig> TutorConfigs { get; set; }

    /// <summary>Gets the set of <see cref="TutorGroupAssignment"/> entities.</summary>
    public DbSet<TutorGroupAssignment> TutorGroupAssignments { get; set; }

    /// <summary>Gets the set of <see cref="TutorStudentAssignment"/> entities.</summary>
    public DbSet<TutorStudentAssignment> TutorStudentAssignments { get; set; }

    /// <summary>Gets the set of <see cref="TutorDocument"/> entities.</summary>
    public DbSet<TutorDocument> TutorDocuments { get; set; }

    /// <summary>Gets the set of <see cref="Chat"/> entities.</summary>
    public DbSet<Chat> Chats { get; set; }

    /// <summary>Gets the set of <see cref="Message"/> entities.</summary>
    public DbSet<Message> Messages { get; set; }

    /// <summary>Gets the set of <see cref="ChatAttachment"/> entities.</summary>
    public DbSet<ChatAttachment> ChatAttachments { get; set; }

    /// <summary>Gets the set of <see cref="BudgetConfig"/> entities.</summary>
    public DbSet<BudgetConfig> BudgetConfigs { get; set; }

    /// <summary>Gets the set of <see cref="CostEntry"/> entities.</summary>
    public DbSet<CostEntry> CostEntries { get; set; }

    /// <summary>Gets the set of <see cref="GlobalSettings"/> entities.</summary>
    public DbSet<GlobalSettings> GlobalSettings { get; set; }

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
        EntityTypeBuilder<School> school = modelBuilder.Entity<School>();
        
        school.HasKey(e => e.Id);
        school.Property(e => e.Id).ValueGeneratedOnAdd();
        school.Property(e => e.Name).HasMaxLength(255);
    }

    private static void ConfigureSchoolEntraConfig(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<SchoolEntraConfig> schoolEntraConfig = modelBuilder.Entity<SchoolEntraConfig>();

        schoolEntraConfig.HasKey(e => e.Id);
        schoolEntraConfig.Property(e => e.Id).ValueGeneratedOnAdd();
        schoolEntraConfig.Property(e => e.ClientSecretEncrypted).HasMaxLength(1024);
        schoolEntraConfig.Property(e => e.RedirectUri).HasMaxLength(1024);

        schoolEntraConfig.HasOne(e => e.School)
              .WithOne(e => e.EntraConfig)
              .HasForeignKey<SchoolEntraConfig>(e => e.SchoolId);
    }

    private static void ConfigureUser(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<User> user = modelBuilder.Entity<User>();

        user.HasKey(e => e.Id);
        user.Property(e => e.Id).ValueGeneratedOnAdd();
        user.Property(e => e.EntraOid).HasMaxLength(36);
        user.Property(e => e.Name).HasMaxLength(255);
        user.Property(e => e.Email).HasColumnType("citext");

        user.HasOne(e => e.School)
              .WithMany(e => e.Users)
              .HasForeignKey(e => e.SchoolId);

        user.HasOne(e => e.Role)
              .WithMany(e => e.Users)
              .HasForeignKey(e => e.RoleId);

        user.HasOne(e => e.BudgetConfig)
              .WithMany()
              .HasForeignKey(e => e.BudgetConfigId);

        user.HasIndex(e => e.EntraOid).IsUnique();
        user.HasIndex(e => e.Email).IsUnique();
    }

    private static void ConfigureUserSettings(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<UserSettings> userSettings = modelBuilder.Entity<UserSettings>();

        userSettings.HasKey(e => e.Id);
        userSettings.Property(e => e.Id).ValueGeneratedOnAdd();
        userSettings.Property(e => e.Language).HasMaxLength(10);

        userSettings.HasOne(e => e.User)
              .WithOne(e => e.Settings)
              .HasForeignKey<UserSettings>(e => e.UserId);
    }

    private static void ConfigureBudgetUsagePeriod(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<BudgetUsagePeriod> budgetUsagePeriod = modelBuilder.Entity<BudgetUsagePeriod>();

        budgetUsagePeriod.HasKey(e => e.Id);
        budgetUsagePeriod.Property(e => e.Id).ValueGeneratedOnAdd();
        budgetUsagePeriod.HasOne(e => e.User)
              .WithMany(e => e.BudgetUsagePeriods)
              .HasForeignKey(e => e.UserId);
    }

    private static void ConfigureGroupType(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<GroupType> groupType = modelBuilder.Entity<GroupType>();

        groupType.HasKey(e => e.Id);
        groupType.Property(e => e.Id).ValueGeneratedOnAdd();
        groupType.Property(e => e.Code).HasMaxLength(100);
        groupType.Property(e => e.Name).HasMaxLength(255);

        groupType.HasIndex(e => e.Code).IsUnique();
    }

    private static void ConfigureGroup(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<Group> group = modelBuilder.Entity<Group>();

        group.HasKey(e => e.Id);
        group.Property(e => e.Id).ValueGeneratedOnAdd();
        group.Property(e => e.Name).HasMaxLength(255);

        group.HasOne(e => e.GroupType)
              .WithMany(e => e.Groups)
              .HasForeignKey(e => e.GroupTypeId);

        group.HasOne(e => e.School)
              .WithMany(e => e.Groups)
              .HasForeignKey(e => e.SchoolId);

        group.HasOne(e => e.BudgetConfig)
              .WithMany()
              .HasForeignKey(e => e.BudgetConfigId);
    }

    private static void ConfigureGroupMember(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<GroupMember> groupMember = modelBuilder.Entity<GroupMember>();

        groupMember.HasKey(e => e.Id);
        groupMember.Property(e => e.Id).ValueGeneratedOnAdd();

        groupMember.HasOne(e => e.Group)
              .WithMany(e => e.Members)
              .HasForeignKey(e => e.GroupId);

        groupMember.HasOne(e => e.User)
              .WithMany(e => e.GroupMemberships)
              .HasForeignKey(e => e.UserId);

        groupMember.HasIndex(e => new { e.GroupId, e.UserId }).IsUnique();
    }

    private static void ConfigureRole(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<Role> role = modelBuilder.Entity<Role>();

        role.HasKey(e => e.Id);
        role.Property(e => e.Id).ValueGeneratedOnAdd();
        role.Property(e => e.Name).HasMaxLength(255);

        role.HasOne(e => e.School)
              .WithMany(e => e.Roles)
              .HasForeignKey(e => e.SchoolId);

        role.HasOne(e => e.BudgetConfig)
              .WithMany()
              .HasForeignKey(e => e.BudgetConfigId);
    }

    private static void ConfigureSubject(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<Subject> subject = modelBuilder.Entity<Subject>();

        subject.HasKey(e => e.Id);
        subject.Property(e => e.Id).ValueGeneratedOnAdd();
        subject.Property(e => e.Name).HasMaxLength(255);
        subject.Property(e => e.Icon).HasMaxLength(100);

        subject.HasOne(e => e.School)
              .WithMany(e => e.Subjects)
              .HasForeignKey(e => e.SchoolId);
    }

    private static void ConfigureAiProvider(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<AiProvider> aiProvider = modelBuilder.Entity<AiProvider>();

        aiProvider.HasKey(e => e.Id);
        aiProvider.Property(e => e.Id).ValueGeneratedOnAdd();
        aiProvider.Property(e => e.Name).HasMaxLength(255);
    }

    private static void ConfigureAiModel(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<AiModel> aiModel = modelBuilder.Entity<AiModel>();

        aiModel.HasKey(e => e.Id);
        aiModel.Property(e => e.Id).ValueGeneratedOnAdd();
        aiModel.Property(e => e.Name).HasMaxLength(255);
        aiModel.Property(e => e.CostPerMillionInputTokens).HasPrecision(10, 6);
        aiModel.Property(e => e.CostPerMillionOutputTokens).HasPrecision(10, 6);
        aiModel.Property(e => e.CostPerMillionCachedInputTokens).HasPrecision(10, 6);

        aiModel.HasOne(e => e.Provider)
              .WithMany(e => e.Models)
              .HasForeignKey(e => e.ProviderId);
    }

    private static void ConfigureSchoolAiProvider(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<SchoolAiProvider> schoolAiProvider = modelBuilder.Entity<SchoolAiProvider>();

        schoolAiProvider.HasKey(e => e.Id);
        schoolAiProvider.Property(e => e.Id).ValueGeneratedOnAdd();

        schoolAiProvider.Property(e => e.ApiKeyEncrypted).HasMaxLength(1024);

        schoolAiProvider.HasOne(e => e.School)
              .WithMany(e => e.SchoolAiProviders)
              .HasForeignKey(e => e.SchoolId);

        schoolAiProvider.HasOne(e => e.Provider)
              .WithMany(e => e.SchoolAiProviders)
              .HasForeignKey(e => e.ProviderId);

        schoolAiProvider.HasIndex(e => new { e.SchoolId, e.ProviderId }).IsUnique();
    }

    private static void ConfigureSchoolAiModel(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<SchoolAiModel> schoolAiModel = modelBuilder.Entity<SchoolAiModel>();

        schoolAiModel.HasKey(e => e.Id);
        schoolAiModel.Property(e => e.Id).ValueGeneratedOnAdd();

        schoolAiModel.HasOne(e => e.School)
              .WithMany(e => e.SchoolAiModels)
              .HasForeignKey(e => e.SchoolId);

        schoolAiModel.HasOne(e => e.Model)
              .WithMany(e => e.SchoolAiModels)
              .HasForeignKey(e => e.ModelId);

        schoolAiModel.HasIndex(e => new { e.SchoolId, e.ModelId }).IsUnique();
    }

    private static void ConfigureTutorConfig(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<TutorConfig> tutorConfig = modelBuilder.Entity<TutorConfig>();

        tutorConfig.HasKey(e => e.Id);
        tutorConfig.Property(e => e.Id).ValueGeneratedOnAdd();
        tutorConfig.Property(e => e.Name).HasMaxLength(255);

        tutorConfig.HasOne(e => e.Subject)
              .WithMany(e => e.Tutors)
              .HasForeignKey(e => e.SubjectId);

        tutorConfig.HasOne(e => e.Model)
              .WithMany(e => e.Tutors)
              .HasForeignKey(e => e.ModelId);

        tutorConfig.HasOne(e => e.CreatedBy)
              .WithMany(e => e.CreatedTutors)
              .HasForeignKey(e => e.CreatedById);
    }

    private static void ConfigureTutorGroupAssignment(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<TutorGroupAssignment> tutorGroupAssignment = modelBuilder.Entity<TutorGroupAssignment>();

        tutorGroupAssignment.HasKey(e => e.Id);
        tutorGroupAssignment.Property(e => e.Id).ValueGeneratedOnAdd();

        tutorGroupAssignment.HasOne(e => e.Tutor)
              .WithMany(e => e.GroupAssignments)
              .HasForeignKey(e => e.TutorId);

        tutorGroupAssignment.HasOne(e => e.Group)
              .WithMany(e => e.TutorAssignments)
              .HasForeignKey(e => e.GroupId);

        tutorGroupAssignment.HasIndex(e => new { e.TutorId, e.GroupId }).IsUnique();
    }

    private static void ConfigureTutorStudentAssignment(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<TutorStudentAssignment> tutorStudentAssignment = modelBuilder.Entity<TutorStudentAssignment>();

        tutorStudentAssignment.HasKey(e => e.Id);
        tutorStudentAssignment.Property(e => e.Id).ValueGeneratedOnAdd();

        tutorStudentAssignment.HasOne(e => e.Tutor)
              .WithMany(e => e.StudentAssignments)
              .HasForeignKey(e => e.TutorId);

        tutorStudentAssignment.HasOne(e => e.User)
              .WithMany(e => e.TutorAssignments)
              .HasForeignKey(e => e.UserId);

        tutorStudentAssignment.HasIndex(e => new { e.TutorId, e.UserId }).IsUnique();
    }

    private static void ConfigureTutorDocument(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<TutorDocument> tutorDocument = modelBuilder.Entity<TutorDocument>();

        tutorDocument.HasKey(e => e.Id);
        tutorDocument.Property(e => e.Id).ValueGeneratedOnAdd();
        tutorDocument.Property(e => e.Name).HasMaxLength(255);
        tutorDocument.Property(e => e.Type).HasMaxLength(100);
        tutorDocument.Property(e => e.FileId).HasMaxLength(255);
        tutorDocument.Property(e => e.Location).HasMaxLength(1024);

        tutorDocument.HasOne(e => e.Tutor)
              .WithMany(e => e.Documents)
              .HasForeignKey(e => e.TutorId);
    }

    private static void ConfigureChat(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<Chat> chat = modelBuilder.Entity<Chat>();

        chat.HasKey(e => e.Id);
        chat.Property(e => e.Id).ValueGeneratedOnAdd();
        chat.Property(e => e.Title).HasMaxLength(255);

        chat.HasOne(e => e.User)
              .WithMany(e => e.Chats)
              .HasForeignKey(e => e.UserId);

        chat.HasOne(e => e.Tutor)
              .WithMany(e => e.Chats)
              .HasForeignKey(e => e.TutorId);
    }

    private static void ConfigureMessage(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<Message> message = modelBuilder.Entity<Message>();

        message.HasKey(e => e.Id);
        message.Property(e => e.Id).ValueGeneratedOnAdd();
        message.HasOne(e => e.Chat)
              .WithMany(e => e.Messages)
              .HasForeignKey(e => e.ChatId);
    }

    private static void ConfigureChatAttachment(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<ChatAttachment> chatAttachment = modelBuilder.Entity<ChatAttachment>();

        chatAttachment.HasKey(e => e.Id);
        chatAttachment.Property(e => e.Id).ValueGeneratedOnAdd();
        chatAttachment.Property(e => e.Name).HasMaxLength(255);
        chatAttachment.Property(e => e.Type).HasMaxLength(100);
        chatAttachment.Property(e => e.FileId).HasMaxLength(255);
        chatAttachment.Property(e => e.Location).HasMaxLength(1024);

        chatAttachment.HasOne(e => e.Message)
              .WithMany(e => e.Attachments)
              .HasForeignKey(e => e.MessageId);
    }

    private static void ConfigureBudgetConfig(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<BudgetConfig> budgetConfig = modelBuilder.Entity<BudgetConfig>();

        budgetConfig.HasKey(e => e.Id);
        budgetConfig.Property(e => e.Id).ValueGeneratedOnAdd();
        budgetConfig.Property(e => e.LimitAmount).HasPrecision(12, 2);
    }

    private static void ConfigureCostEntry(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<CostEntry> costEntry = modelBuilder.Entity<CostEntry>();

        costEntry.HasKey(e => e.Id);
        costEntry.Property(e => e.Id).ValueGeneratedOnAdd();
        costEntry.Property(e => e.Cost).HasPrecision(12, 2);

        costEntry.HasOne(e => e.Message)
              .WithMany(e => e.CostEntries)
              .HasForeignKey(e => e.MessageId);

        costEntry.HasOne(e => e.BudgetUsagePeriod)
              .WithMany(e => e.CostEntries)
              .HasForeignKey(e => e.BudgetUsagePeriodId);

        costEntry.HasOne(e => e.Tutor)
              .WithMany(e => e.CostEntries)
              .HasForeignKey(e => e.TutorId);
    }

    private static void ConfigureGlobalSettings(ModelBuilder modelBuilder)
    {
        EntityTypeBuilder<GlobalSettings> globalSettings = modelBuilder.Entity<GlobalSettings>();

        globalSettings.HasKey(e => e.Id);
        globalSettings.Property(e => e.Id).ValueGeneratedOnAdd();
        globalSettings.HasOne(e => e.School)
              .WithOne(e => e.GlobalSettings)
              .HasForeignKey<GlobalSettings>(e => e.SchoolId);

        globalSettings.HasOne(e => e.LastModifiedBy)
              .WithMany()
              .HasForeignKey(e => e.LastModifiedById);
    }
}
