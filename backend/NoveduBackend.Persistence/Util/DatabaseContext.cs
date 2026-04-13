using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
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
      public DbSet<School> Schools { get; set; }

      /// <summary>Gets the set of <see cref="SchoolEntraConfig"/> entities.</summary>
      public DbSet<SchoolEntraConfig> SchoolEntraConfigs { get; set; }

      /// <summary>Gets the set of <see cref="User"/> entities.</summary>
      public DbSet<User> Users { get; set; }

      /// <summary>Gets the set of <see cref="UserSettings"/> entities.</summary>
      public DbSet<UserSettings> UserSettings { get; set; }

      /// <summary>Gets the set of <see cref="BudgetUsagePeriod"/> entities.</summary>
      public DbSet<BudgetUsagePeriod> BudgetUsagePeriods { get; set; }

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

            school.HasOne(sch => sch.EntraConfig)
                  .WithOne(sec => sec.School)
                  .HasForeignKey<SchoolEntraConfig>(sec => sec.SchoolId)
                  .OnDelete(DeleteBehavior.Cascade);

            school.HasOne(sch => sch.GlobalSettings)
                  .WithOne(gs => gs.School)
                  .HasForeignKey<GlobalSettings>(gs => gs.SchoolId)
                  .OnDelete(DeleteBehavior.Cascade);

            school.HasMany(sch => sch.Users)
                  .WithOne(usr => usr.School)
                  .HasForeignKey(usr => usr.SchoolId)
                  .OnDelete(DeleteBehavior.Restrict);

            school.HasMany(sch => sch.Groups)
                  .WithOne(grp => grp.School)
                  .HasForeignKey(grp => grp.SchoolId)
                  .OnDelete(DeleteBehavior.Restrict);

            school.HasMany(sch => sch.Roles)
                  .WithOne(rol => rol.School)
                  .HasForeignKey(rol => rol.SchoolId)
                  .OnDelete(DeleteBehavior.Restrict);

            school.HasMany(sch => sch.Subjects)
                  .WithOne(sub => sub.School)
                  .HasForeignKey(sub => sub.SchoolId)
                  .OnDelete(DeleteBehavior.Restrict);

            school.HasMany(sch => sch.SchoolAiProviders)
                  .WithOne(sap => sap.School)
                  .HasForeignKey(sap => sap.SchoolId)
                  .OnDelete(DeleteBehavior.Cascade);

            school.HasMany(sch => sch.SchoolAiModels)
                  .WithOne(sam => sam.School)
                  .HasForeignKey(sam => sam.SchoolId)
                  .OnDelete(DeleteBehavior.Cascade);
      }

      private static void ConfigureSchoolEntraConfig(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<SchoolEntraConfig> schoolEntraConfig = modelBuilder.Entity<SchoolEntraConfig>();

            schoolEntraConfig.HasKey(e => e.Id);
            schoolEntraConfig.Property(e => e.Id).ValueGeneratedOnAdd();
            schoolEntraConfig.Property(e => e.ClientSecretEncrypted).HasMaxLength(1024);
            schoolEntraConfig.Property(e => e.RedirectUri).HasMaxLength(1024);
      }

      private static void ConfigureUser(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<User> user = modelBuilder.Entity<User>();

            user.HasKey(e => e.Id);
            user.Property(e => e.Id).ValueGeneratedOnAdd();
            user.Property(e => e.EntraOid).HasMaxLength(36);
            user.Property(e => e.Name).HasMaxLength(255);
            user.Property(e => e.Email).HasColumnType("citext");

            user.HasOne(usr => usr.BudgetConfig)
                  .WithMany()
                  .HasForeignKey(usr => usr.BudgetConfigId)
                  .OnDelete(DeleteBehavior.Restrict);

            user.HasOne(usr => usr.Settings)
                  .WithOne(us => us.User)
                  .HasForeignKey<UserSettings>(us => us.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            user.HasMany(usr => usr.BudgetUsagePeriods)
                  .WithOne(bup => bup.User)
                  .HasForeignKey(bup => bup.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            user.HasMany(usr => usr.GroupMemberships)
                  .WithOne(gm => gm.User)
                  .HasForeignKey(gm => gm.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            user.HasMany(usr => usr.CreatedTutors)
                  .WithOne(tc => tc.CreatedBy)
                  .HasForeignKey(tc => tc.CreatedById)
                  .OnDelete(DeleteBehavior.Restrict);

            user.HasMany(usr => usr.TutorAssignments)
                  .WithOne(tsa => tsa.User)
                  .HasForeignKey(tsa => tsa.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            user.HasMany(usr => usr.Chats)
                  .WithOne(chat => chat.User)
                  .HasForeignKey(chat => chat.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            user.HasIndex(e => e.EntraOid).IsUnique();
            user.HasIndex(e => e.Email).IsUnique();
      }

      private static void ConfigureUserSettings(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<UserSettings> userSettings = modelBuilder.Entity<UserSettings>();

            userSettings.HasKey(e => e.Id);
            userSettings.Property(e => e.Id).ValueGeneratedOnAdd();
            userSettings.Property(e => e.Language).HasMaxLength(10);
      }

      private static void ConfigureBudgetUsagePeriod(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<BudgetUsagePeriod> budgetUsagePeriod = modelBuilder.Entity<BudgetUsagePeriod>();

            budgetUsagePeriod.HasKey(e => e.Id);
            budgetUsagePeriod.Property(e => e.Id).ValueGeneratedOnAdd();
            budgetUsagePeriod.Property(e => e.BudgetPeriod)
                  .HasConversion(new EnumToStringConverter<BudgetPeriod>());

            budgetUsagePeriod.HasMany(bup => bup.CostEntries)
                  .WithOne(ce => ce.BudgetUsagePeriod)
                  .HasForeignKey(ce => ce.BudgetUsagePeriodId)
                  .OnDelete(DeleteBehavior.Cascade);
      }

      private static void ConfigureGroupType(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<GroupType> groupType = modelBuilder.Entity<GroupType>();

            groupType.HasKey(e => e.Id);
            groupType.Property(e => e.Id).ValueGeneratedOnAdd();
            groupType.Property(e => e.Code).HasMaxLength(100);
            groupType.Property(e => e.Name).HasMaxLength(255);

            groupType.HasIndex(e => e.Code).IsUnique();

            groupType.HasMany(gt => gt.Groups)
                  .WithOne(grp => grp.GroupType)
                  .HasForeignKey(grp => grp.GroupTypeId)
                  .OnDelete(DeleteBehavior.Restrict);
      }

      private static void ConfigureGroup(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<Group> group = modelBuilder.Entity<Group>();

            group.HasKey(e => e.Id);
            group.Property(e => e.Id).ValueGeneratedOnAdd();
            group.Property(e => e.Name).HasMaxLength(255);

            group.HasOne(grp => grp.BudgetConfig)
                  .WithMany()
                  .HasForeignKey(grp => grp.BudgetConfigId)
                  .OnDelete(DeleteBehavior.Restrict);

            group.HasMany(grp => grp.Members)
                  .WithOne(gm => gm.Group)
                  .HasForeignKey(gm => gm.GroupId)
                  .OnDelete(DeleteBehavior.Cascade);

            group.HasMany(grp => grp.TutorAssignments)
                  .WithOne(tga => tga.Group)
                  .HasForeignKey(tga => tga.GroupId)
                  .OnDelete(DeleteBehavior.Cascade);
      }

      private static void ConfigureGroupMember(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<GroupMember> groupMember = modelBuilder.Entity<GroupMember>();

            groupMember.HasKey(e => e.Id);
            groupMember.Property(e => e.Id).ValueGeneratedOnAdd();

            groupMember.HasIndex(e => new { e.GroupId, e.UserId }).IsUnique();
      }

      private static void ConfigureRole(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<Role> role = modelBuilder.Entity<Role>();

            role.HasKey(e => e.Id);
            role.Property(e => e.Id).ValueGeneratedOnAdd();
            role.Property(e => e.Name).HasMaxLength(255);

            role.HasOne(rol => rol.BudgetConfig)
                  .WithMany()
                  .HasForeignKey(rol => rol.BudgetConfigId)
                  .OnDelete(DeleteBehavior.Restrict);

            role.HasMany(rol => rol.Users)
                  .WithOne(usr => usr.Role)
                  .HasForeignKey(usr => usr.RoleId)
                  .OnDelete(DeleteBehavior.Restrict);
      }

      private static void ConfigureSubject(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<Subject> subject = modelBuilder.Entity<Subject>();

            subject.HasKey(e => e.Id);
            subject.Property(e => e.Id).ValueGeneratedOnAdd();
            subject.Property(e => e.Name).HasMaxLength(255);
            subject.Property(e => e.Icon).HasMaxLength(100);

            subject.HasMany(sub => sub.Tutors)
                  .WithOne(tc => tc.Subject)
                  .HasForeignKey(tc => tc.SubjectId)
                  .OnDelete(DeleteBehavior.Restrict);
      }

      private static void ConfigureAiProvider(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<AiProvider> aiProvider = modelBuilder.Entity<AiProvider>();

            aiProvider.HasKey(e => e.Id);
            aiProvider.Property(e => e.Id).ValueGeneratedOnAdd();
            aiProvider.Property(e => e.Name).HasMaxLength(255);

            aiProvider.HasMany(ap => ap.Models)
                  .WithOne(am => am.Provider)
                  .HasForeignKey(am => am.ProviderId)
                  .OnDelete(DeleteBehavior.Restrict);

            aiProvider.HasMany(ap => ap.SchoolAiProviders)
                  .WithOne(sap => sap.Provider)
                  .HasForeignKey(sap => sap.ProviderId)
                  .OnDelete(DeleteBehavior.Cascade);
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

            aiModel.HasMany(am => am.SchoolAiModels)
                  .WithOne(sam => sam.Model)
                  .HasForeignKey(sam => sam.ModelId)
                  .OnDelete(DeleteBehavior.Cascade);

            aiModel.HasMany(am => am.Tutors)
                  .WithOne(tc => tc.Model)
                  .HasForeignKey(tc => tc.ModelId)
                  .OnDelete(DeleteBehavior.Restrict);
      }

      private static void ConfigureSchoolAiProvider(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<SchoolAiProvider> schoolAiProvider = modelBuilder.Entity<SchoolAiProvider>();

            schoolAiProvider.HasKey(e => e.Id);
            schoolAiProvider.Property(e => e.Id).ValueGeneratedOnAdd();

            schoolAiProvider.Property(e => e.ApiKeyEncrypted).HasMaxLength(1024);

            schoolAiProvider.HasIndex(e => new { e.SchoolId, e.ProviderId }).IsUnique();
      }

      private static void ConfigureSchoolAiModel(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<SchoolAiModel> schoolAiModel = modelBuilder.Entity<SchoolAiModel>();

            schoolAiModel.HasKey(e => e.Id);
            schoolAiModel.Property(e => e.Id).ValueGeneratedOnAdd();

            schoolAiModel.HasIndex(e => new { e.SchoolId, e.ModelId }).IsUnique();
      }

      private static void ConfigureTutorConfig(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<TutorConfig> tutorConfig = modelBuilder.Entity<TutorConfig>();

            tutorConfig.HasKey(e => e.Id);
            tutorConfig.Property(e => e.Id).ValueGeneratedOnAdd();
            tutorConfig.Property(e => e.Name).HasMaxLength(255);
            tutorConfig.Property(e => e.DidacticMode)
                  .HasConversion(new EnumToStringConverter<DidacticMode>());

            tutorConfig.HasMany(tc => tc.Documents)
                  .WithOne(td => td.Tutor)
                  .HasForeignKey(td => td.TutorId)
                  .OnDelete(DeleteBehavior.Cascade);

            tutorConfig.HasMany(tc => tc.GroupAssignments)
                  .WithOne(tga => tga.Tutor)
                  .HasForeignKey(tga => tga.TutorId)
                  .OnDelete(DeleteBehavior.Cascade);

            tutorConfig.HasMany(tc => tc.StudentAssignments)
                  .WithOne(tsa => tsa.Tutor)
                  .HasForeignKey(tsa => tsa.TutorId)
                  .OnDelete(DeleteBehavior.Cascade);

            tutorConfig.HasMany(tc => tc.Chats)
                  .WithOne(chat => chat.Tutor)
                  .HasForeignKey(chat => chat.TutorId)
                  .OnDelete(DeleteBehavior.Restrict);

            tutorConfig.HasMany(tc => tc.CostEntries)
                  .WithOne(ce => ce.Tutor)
                  .HasForeignKey(ce => ce.TutorId)
                  .OnDelete(DeleteBehavior.Restrict);
      }

      private static void ConfigureTutorGroupAssignment(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<TutorGroupAssignment> tutorGroupAssignment = modelBuilder.Entity<TutorGroupAssignment>();

            tutorGroupAssignment.HasKey(e => e.Id);
            tutorGroupAssignment.Property(e => e.Id).ValueGeneratedOnAdd();

            tutorGroupAssignment.HasIndex(e => new { e.TutorId, e.GroupId }).IsUnique();
      }

      private static void ConfigureTutorStudentAssignment(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<TutorStudentAssignment> tutorStudentAssignment = modelBuilder.Entity<TutorStudentAssignment>();

            tutorStudentAssignment.HasKey(e => e.Id);
            tutorStudentAssignment.Property(e => e.Id).ValueGeneratedOnAdd();

            tutorStudentAssignment.HasIndex(e => new { e.TutorId, e.UserId }).IsUnique();
      }

      private static void ConfigureTutorDocument(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<TutorDocument> tutorDocument = modelBuilder.Entity<TutorDocument>();

            tutorDocument.HasKey(e => e.Id);
            tutorDocument.Property(e => e.Id).ValueGeneratedOnAdd();
            tutorDocument.Property(e => e.Kind)
                  .HasConversion(new EnumToStringConverter<TutorDocumentKind>());
            tutorDocument.Property(e => e.Name).HasMaxLength(255);
            tutorDocument.Property(e => e.Type).HasMaxLength(100);
            tutorDocument.Property(e => e.FileId).HasMaxLength(255);
            tutorDocument.Property(e => e.Location).HasMaxLength(1024);
      }

      private static void ConfigureChat(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<Chat> chat = modelBuilder.Entity<Chat>();

            chat.HasKey(e => e.Id);
            chat.Property(e => e.Id).ValueGeneratedOnAdd();
            chat.Property(e => e.Title).HasMaxLength(255);

            chat.HasMany(ch => ch.Messages)
                  .WithOne(msg => msg.Chat)
                  .HasForeignKey(msg => msg.ChatId)
                  .OnDelete(DeleteBehavior.Cascade);
      }

      private static void ConfigureMessage(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<Message> message = modelBuilder.Entity<Message>();

            message.HasKey(e => e.Id);
            message.Property(e => e.Id).ValueGeneratedOnAdd();
            message.Property(e => e.Role)
                  .HasConversion(new EnumToStringConverter<MessageRole>());

            message.HasMany(msg => msg.Attachments)
                  .WithOne(att => att.Message)
                  .HasForeignKey(att => att.MessageId)
                  .OnDelete(DeleteBehavior.Cascade);

            message.HasMany(msg => msg.CostEntries)
                  .WithOne(ce => ce.Message)
                  .HasForeignKey(ce => ce.MessageId)
                  .OnDelete(DeleteBehavior.Cascade);
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
      }

      private static void ConfigureBudgetConfig(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<BudgetConfig> budgetConfig = modelBuilder.Entity<BudgetConfig>();

            budgetConfig.HasKey(e => e.Id);
            budgetConfig.Property(e => e.Id).ValueGeneratedOnAdd();
            budgetConfig.Property(e => e.Type)
                  .HasConversion(new EnumToStringConverter<BudgetConfigType>());
            budgetConfig.Property(e => e.BudgetPeriod)
                  .HasConversion(new EnumToStringConverter<BudgetPeriod>());
            budgetConfig.Property(e => e.LimitAmount).HasPrecision(12, 2);
      }

      private static void ConfigureCostEntry(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<CostEntry> costEntry = modelBuilder.Entity<CostEntry>();

            costEntry.HasKey(e => e.Id);
            costEntry.Property(e => e.Id).ValueGeneratedOnAdd();
            costEntry.Property(e => e.Cost).HasPrecision(12, 2);
      }

      private static void ConfigureGlobalSettings(ModelBuilder modelBuilder)
      {
            EntityTypeBuilder<GlobalSettings> globalSettings = modelBuilder.Entity<GlobalSettings>();

            globalSettings.HasKey(e => e.Id);
            globalSettings.Property(e => e.Id).ValueGeneratedOnAdd();

            globalSettings.HasOne(gs => gs.LastModifiedBy)
                  .WithMany()
                  .HasForeignKey(gs => gs.LastModifiedById)
                  .OnDelete(DeleteBehavior.Restrict);
      }
}
