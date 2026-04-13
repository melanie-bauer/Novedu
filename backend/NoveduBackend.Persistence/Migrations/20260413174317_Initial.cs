using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NodaTime;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace NoveduBackend.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "NoveduBackend");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:budget_config_type", "role,group,user")
                .Annotation("Npgsql:Enum:budget_period", "daily,weekly,monthly,yearly")
                .Annotation("Npgsql:Enum:didactic_mode", "socratic,hints,step_by_step,concise")
                .Annotation("Npgsql:Enum:message_role", "user,assistant")
                .Annotation("Npgsql:Enum:tutor_document_kind", "knowledge,assignment")
                .Annotation("Npgsql:PostgresExtension:citext", ",,");

            migrationBuilder.CreateTable(
                name: "AiProvider",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiProvider", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BudgetConfig",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    BudgetPeriod = table.Column<int>(type: "integer", nullable: false),
                    LimitAmount = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    WarningThreshold = table.Column<short>(type: "smallint", nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BudgetConfig", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GroupType",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupType", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "School",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_School", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AiModel",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProviderId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CostPerMillionInputTokens = table.Column<decimal>(type: "numeric(10,6)", precision: 10, scale: 6, nullable: false),
                    CostPerMillionOutputTokens = table.Column<decimal>(type: "numeric(10,6)", precision: 10, scale: 6, nullable: false),
                    CostPerMillionCachedInputTokens = table.Column<decimal>(type: "numeric(10,6)", precision: 10, scale: 6, nullable: false),
                    MaxInputTokens = table.Column<int>(type: "integer", nullable: false),
                    MaxOutputTokens = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiModel", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AiModel_AiProvider_ProviderId",
                        column: x => x.ProviderId,
                        principalSchema: "NoveduBackend",
                        principalTable: "AiProvider",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Group",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GroupTypeId = table.Column<int>(type: "integer", nullable: false),
                    SchoolId = table.Column<int>(type: "integer", nullable: false),
                    BudgetConfigId = table.Column<int>(type: "integer", nullable: true),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Group", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Group_BudgetConfig_BudgetConfigId",
                        column: x => x.BudgetConfigId,
                        principalSchema: "NoveduBackend",
                        principalTable: "BudgetConfig",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Group_GroupType_GroupTypeId",
                        column: x => x.GroupTypeId,
                        principalSchema: "NoveduBackend",
                        principalTable: "GroupType",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Group_School_SchoolId",
                        column: x => x.SchoolId,
                        principalSchema: "NoveduBackend",
                        principalTable: "School",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Role",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SchoolId = table.Column<int>(type: "integer", nullable: false),
                    BudgetConfigId = table.Column<int>(type: "integer", nullable: true),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsSystem = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Role", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Role_BudgetConfig_BudgetConfigId",
                        column: x => x.BudgetConfigId,
                        principalSchema: "NoveduBackend",
                        principalTable: "BudgetConfig",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Role_School_SchoolId",
                        column: x => x.SchoolId,
                        principalSchema: "NoveduBackend",
                        principalTable: "School",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SchoolAiProvider",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SchoolId = table.Column<int>(type: "integer", nullable: false),
                    ProviderId = table.Column<int>(type: "integer", nullable: false),
                    ApiKeyEncrypted = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SchoolAiProvider", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SchoolAiProvider_AiProvider_ProviderId",
                        column: x => x.ProviderId,
                        principalSchema: "NoveduBackend",
                        principalTable: "AiProvider",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SchoolAiProvider_School_SchoolId",
                        column: x => x.SchoolId,
                        principalSchema: "NoveduBackend",
                        principalTable: "School",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SchoolEntraConfig",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SchoolId = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientSecretEncrypted = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    RedirectUri = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SchoolEntraConfig", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SchoolEntraConfig_School_SchoolId",
                        column: x => x.SchoolId,
                        principalSchema: "NoveduBackend",
                        principalTable: "School",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Subject",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SchoolId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subject", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Subject_School_SchoolId",
                        column: x => x.SchoolId,
                        principalSchema: "NoveduBackend",
                        principalTable: "School",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SchoolAiModel",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SchoolId = table.Column<int>(type: "integer", nullable: false),
                    ModelId = table.Column<int>(type: "integer", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SchoolAiModel", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SchoolAiModel_AiModel_ModelId",
                        column: x => x.ModelId,
                        principalSchema: "NoveduBackend",
                        principalTable: "AiModel",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SchoolAiModel_School_SchoolId",
                        column: x => x.SchoolId,
                        principalSchema: "NoveduBackend",
                        principalTable: "School",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "User",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SchoolId = table.Column<int>(type: "integer", nullable: false),
                    BudgetConfigId = table.Column<int>(type: "integer", nullable: true),
                    RoleId = table.Column<int>(type: "integer", nullable: false),
                    EntraOid = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "citext", nullable: false),
                    IsFirstLogin = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    LastLoginAt = table.Column<Instant>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.Id);
                    table.ForeignKey(
                        name: "FK_User_BudgetConfig_BudgetConfigId",
                        column: x => x.BudgetConfigId,
                        principalSchema: "NoveduBackend",
                        principalTable: "BudgetConfig",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_User_Role_RoleId",
                        column: x => x.RoleId,
                        principalSchema: "NoveduBackend",
                        principalTable: "Role",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_User_School_SchoolId",
                        column: x => x.SchoolId,
                        principalSchema: "NoveduBackend",
                        principalTable: "School",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BudgetUsagePeriod",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    BudgetPeriod = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<LocalDate>(type: "date", nullable: false),
                    EndDate = table.Column<LocalDate>(type: "date", nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BudgetUsagePeriod", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BudgetUsagePeriod_User_UserId",
                        column: x => x.UserId,
                        principalSchema: "NoveduBackend",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GlobalSettings",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SchoolId = table.Column<int>(type: "integer", nullable: false),
                    LastModifiedById = table.Column<int>(type: "integer", nullable: true),
                    SystemPrompt = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GlobalSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GlobalSettings_School_SchoolId",
                        column: x => x.SchoolId,
                        principalSchema: "NoveduBackend",
                        principalTable: "School",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GlobalSettings_User_LastModifiedById",
                        column: x => x.LastModifiedById,
                        principalSchema: "NoveduBackend",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GroupMember",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GroupId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupMember", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupMember_Group_GroupId",
                        column: x => x.GroupId,
                        principalSchema: "NoveduBackend",
                        principalTable: "Group",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GroupMember_User_UserId",
                        column: x => x.UserId,
                        principalSchema: "NoveduBackend",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TutorConfig",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SubjectId = table.Column<int>(type: "integer", nullable: false),
                    ModelId = table.Column<int>(type: "integer", nullable: false),
                    CreatedById = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    SystemPrompt = table.Column<string>(type: "text", nullable: true),
                    Temperature = table.Column<double>(type: "double precision", nullable: false),
                    MaxOutputTokens = table.Column<int>(type: "integer", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    DidacticMode = table.Column<int>(type: "integer", nullable: false),
                    ShowSources = table.Column<bool>(type: "boolean", nullable: false),
                    HideKnowledgeBase = table.Column<bool>(type: "boolean", nullable: false),
                    ExpiresAt = table.Column<Instant>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TutorConfig", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TutorConfig_AiModel_ModelId",
                        column: x => x.ModelId,
                        principalSchema: "NoveduBackend",
                        principalTable: "AiModel",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TutorConfig_Subject_SubjectId",
                        column: x => x.SubjectId,
                        principalSchema: "NoveduBackend",
                        principalTable: "Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TutorConfig_User_CreatedById",
                        column: x => x.CreatedById,
                        principalSchema: "NoveduBackend",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserSettings",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    NotifyBudgetWarning = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserSettings_User_UserId",
                        column: x => x.UserId,
                        principalSchema: "NoveduBackend",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Chat",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    TutorId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Chat", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Chat_TutorConfig_TutorId",
                        column: x => x.TutorId,
                        principalSchema: "NoveduBackend",
                        principalTable: "TutorConfig",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Chat_User_UserId",
                        column: x => x.UserId,
                        principalSchema: "NoveduBackend",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TutorDocument",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TutorId = table.Column<int>(type: "integer", nullable: false),
                    Kind = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Size = table.Column<long>(type: "bigint", nullable: false),
                    FileId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    UploadedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    LastUploadedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    Location = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TutorDocument", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TutorDocument_TutorConfig_TutorId",
                        column: x => x.TutorId,
                        principalSchema: "NoveduBackend",
                        principalTable: "TutorConfig",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TutorGroupAssignment",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TutorId = table.Column<int>(type: "integer", nullable: false),
                    GroupId = table.Column<int>(type: "integer", nullable: false),
                    EnabledUntil = table.Column<Instant>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TutorGroupAssignment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TutorGroupAssignment_Group_GroupId",
                        column: x => x.GroupId,
                        principalSchema: "NoveduBackend",
                        principalTable: "Group",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TutorGroupAssignment_TutorConfig_TutorId",
                        column: x => x.TutorId,
                        principalSchema: "NoveduBackend",
                        principalTable: "TutorConfig",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TutorStudentAssignment",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TutorId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    EnabledUntil = table.Column<Instant>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TutorStudentAssignment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TutorStudentAssignment_TutorConfig_TutorId",
                        column: x => x.TutorId,
                        principalSchema: "NoveduBackend",
                        principalTable: "TutorConfig",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TutorStudentAssignment_User_UserId",
                        column: x => x.UserId,
                        principalSchema: "NoveduBackend",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Message",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ChatId = table.Column<int>(type: "integer", nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Message", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Message_Chat_ChatId",
                        column: x => x.ChatId,
                        principalSchema: "NoveduBackend",
                        principalTable: "Chat",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChatAttachment",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MessageId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Size = table.Column<long>(type: "bigint", nullable: false),
                    FileId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    UploadedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    Location = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatAttachment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChatAttachment_Message_MessageId",
                        column: x => x.MessageId,
                        principalSchema: "NoveduBackend",
                        principalTable: "Message",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CostEntry",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MessageId = table.Column<int>(type: "integer", nullable: false),
                    BudgetUsagePeriodId = table.Column<int>(type: "integer", nullable: false),
                    TutorId = table.Column<int>(type: "integer", nullable: false),
                    InputTokens = table.Column<int>(type: "integer", nullable: false),
                    OutputTokens = table.Column<int>(type: "integer", nullable: false),
                    Cost = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CostEntry", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CostEntry_BudgetUsagePeriod_BudgetUsagePeriodId",
                        column: x => x.BudgetUsagePeriodId,
                        principalSchema: "NoveduBackend",
                        principalTable: "BudgetUsagePeriod",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CostEntry_Message_MessageId",
                        column: x => x.MessageId,
                        principalSchema: "NoveduBackend",
                        principalTable: "Message",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CostEntry_TutorConfig_TutorId",
                        column: x => x.TutorId,
                        principalSchema: "NoveduBackend",
                        principalTable: "TutorConfig",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AiModel_ProviderId",
                schema: "NoveduBackend",
                table: "AiModel",
                column: "ProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetUsagePeriod_UserId",
                schema: "NoveduBackend",
                table: "BudgetUsagePeriod",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Chat_TutorId",
                schema: "NoveduBackend",
                table: "Chat",
                column: "TutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Chat_UserId",
                schema: "NoveduBackend",
                table: "Chat",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatAttachment_MessageId",
                schema: "NoveduBackend",
                table: "ChatAttachment",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_CostEntry_BudgetUsagePeriodId",
                schema: "NoveduBackend",
                table: "CostEntry",
                column: "BudgetUsagePeriodId");

            migrationBuilder.CreateIndex(
                name: "IX_CostEntry_MessageId",
                schema: "NoveduBackend",
                table: "CostEntry",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_CostEntry_TutorId",
                schema: "NoveduBackend",
                table: "CostEntry",
                column: "TutorId");

            migrationBuilder.CreateIndex(
                name: "IX_GlobalSettings_LastModifiedById",
                schema: "NoveduBackend",
                table: "GlobalSettings",
                column: "LastModifiedById");

            migrationBuilder.CreateIndex(
                name: "IX_GlobalSettings_SchoolId",
                schema: "NoveduBackend",
                table: "GlobalSettings",
                column: "SchoolId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Group_BudgetConfigId",
                schema: "NoveduBackend",
                table: "Group",
                column: "BudgetConfigId");

            migrationBuilder.CreateIndex(
                name: "IX_Group_GroupTypeId",
                schema: "NoveduBackend",
                table: "Group",
                column: "GroupTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Group_SchoolId",
                schema: "NoveduBackend",
                table: "Group",
                column: "SchoolId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMember_GroupId_UserId",
                schema: "NoveduBackend",
                table: "GroupMember",
                columns: new[] { "GroupId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GroupMember_UserId",
                schema: "NoveduBackend",
                table: "GroupMember",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupType_Code",
                schema: "NoveduBackend",
                table: "GroupType",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Message_ChatId",
                schema: "NoveduBackend",
                table: "Message",
                column: "ChatId");

            migrationBuilder.CreateIndex(
                name: "IX_Role_BudgetConfigId",
                schema: "NoveduBackend",
                table: "Role",
                column: "BudgetConfigId");

            migrationBuilder.CreateIndex(
                name: "IX_Role_SchoolId",
                schema: "NoveduBackend",
                table: "Role",
                column: "SchoolId");

            migrationBuilder.CreateIndex(
                name: "IX_SchoolAiModel_ModelId",
                schema: "NoveduBackend",
                table: "SchoolAiModel",
                column: "ModelId");

            migrationBuilder.CreateIndex(
                name: "IX_SchoolAiModel_SchoolId_ModelId",
                schema: "NoveduBackend",
                table: "SchoolAiModel",
                columns: new[] { "SchoolId", "ModelId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SchoolAiProvider_ProviderId",
                schema: "NoveduBackend",
                table: "SchoolAiProvider",
                column: "ProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_SchoolAiProvider_SchoolId_ProviderId",
                schema: "NoveduBackend",
                table: "SchoolAiProvider",
                columns: new[] { "SchoolId", "ProviderId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SchoolEntraConfig_SchoolId",
                schema: "NoveduBackend",
                table: "SchoolEntraConfig",
                column: "SchoolId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Subject_SchoolId",
                schema: "NoveduBackend",
                table: "Subject",
                column: "SchoolId");

            migrationBuilder.CreateIndex(
                name: "IX_TutorConfig_CreatedById",
                schema: "NoveduBackend",
                table: "TutorConfig",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_TutorConfig_ModelId",
                schema: "NoveduBackend",
                table: "TutorConfig",
                column: "ModelId");

            migrationBuilder.CreateIndex(
                name: "IX_TutorConfig_SubjectId",
                schema: "NoveduBackend",
                table: "TutorConfig",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_TutorDocument_TutorId",
                schema: "NoveduBackend",
                table: "TutorDocument",
                column: "TutorId");

            migrationBuilder.CreateIndex(
                name: "IX_TutorGroupAssignment_GroupId",
                schema: "NoveduBackend",
                table: "TutorGroupAssignment",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_TutorGroupAssignment_TutorId_GroupId",
                schema: "NoveduBackend",
                table: "TutorGroupAssignment",
                columns: new[] { "TutorId", "GroupId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TutorStudentAssignment_TutorId_UserId",
                schema: "NoveduBackend",
                table: "TutorStudentAssignment",
                columns: new[] { "TutorId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TutorStudentAssignment_UserId",
                schema: "NoveduBackend",
                table: "TutorStudentAssignment",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_User_BudgetConfigId",
                schema: "NoveduBackend",
                table: "User",
                column: "BudgetConfigId");

            migrationBuilder.CreateIndex(
                name: "IX_User_Email",
                schema: "NoveduBackend",
                table: "User",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_EntraOid",
                schema: "NoveduBackend",
                table: "User",
                column: "EntraOid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_RoleId",
                schema: "NoveduBackend",
                table: "User",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_User_SchoolId",
                schema: "NoveduBackend",
                table: "User",
                column: "SchoolId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSettings_UserId",
                schema: "NoveduBackend",
                table: "UserSettings",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChatAttachment",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "CostEntry",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "GlobalSettings",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "GroupMember",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "SchoolAiModel",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "SchoolAiProvider",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "SchoolEntraConfig",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "TutorDocument",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "TutorGroupAssignment",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "TutorStudentAssignment",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "UserSettings",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "BudgetUsagePeriod",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "Message",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "Group",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "Chat",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "GroupType",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "TutorConfig",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "AiModel",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "Subject",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "User",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "AiProvider",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "Role",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "BudgetConfig",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "School",
                schema: "NoveduBackend");
        }
    }
}
