using Microsoft.EntityFrameworkCore.Migrations;
using NodaTime;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace NoveduBackend.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ErdV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpiresAt",
                schema: "NoveduBackend",
                table: "TutorConfig");

            migrationBuilder.DropColumn(
                name: "IsEnabled",
                schema: "NoveduBackend",
                table: "TutorConfig");

            migrationBuilder.DropColumn(
                name: "BudgetPeriod",
                schema: "NoveduBackend",
                table: "BudgetUsagePeriod");

            migrationBuilder.AddColumn<bool>(
                name: "AnonymizePii",
                schema: "NoveduBackend",
                table: "TutorConfig",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Instant>(
                name: "EnabledFrom",
                schema: "NoveduBackend",
                table: "TutorStudentAssignment",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: NodaTime.Instant.FromUnixTimeTicks(0L));

            migrationBuilder.AddColumn<int>(
                name: "AssignedById",
                schema: "NoveduBackend",
                table: "TutorGroupAssignment",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "BudgetConfigId",
                schema: "NoveduBackend",
                table: "TutorGroupAssignment",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<Instant>(
                name: "EnabledFrom",
                schema: "NoveduBackend",
                table: "TutorGroupAssignment",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: NodaTime.Instant.FromUnixTimeTicks(0L));

            migrationBuilder.AddColumn<int>(
                name: "CopiedFromId",
                schema: "NoveduBackend",
                table: "TutorConfig",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DefaultInternalPermission",
                schema: "NoveduBackend",
                table: "TutorConfig",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Visibility",
                schema: "NoveduBackend",
                table: "TutorConfig",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Role",
                schema: "NoveduBackend",
                table: "GroupMember",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "BudgetConfigId",
                schema: "NoveduBackend",
                table: "BudgetUsagePeriod",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsAuto",
                schema: "NoveduBackend",
                table: "AiModel",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "RecommendationTag",
                schema: "NoveduBackend",
                table: "AiModel",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MessageMonitoringFlag",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MessageId = table.Column<int>(type: "integer", nullable: false),
                    ReviewedById = table.Column<int>(type: "integer", nullable: true),
                    FlagType = table.Column<string>(type: "text", nullable: false),
                    Severity = table.Column<string>(type: "text", nullable: false),
                    Details = table.Column<string>(type: "text", nullable: true),
                    IsReviewed = table.Column<bool>(type: "boolean", nullable: false),
                    ReviewedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageMonitoringFlag", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MessageMonitoringFlag_Message_MessageId",
                        column: x => x.MessageId,
                        principalSchema: "NoveduBackend",
                        principalTable: "Message",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MessageMonitoringFlag_User_ReviewedById",
                        column: x => x.ReviewedById,
                        principalSchema: "NoveduBackend",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TutorCollaborator",
                schema: "NoveduBackend",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TutorId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    GroupId = table.Column<int>(type: "integer", nullable: true),
                    SharedById = table.Column<int>(type: "integer", nullable: false),
                    Permission = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TutorCollaborator", x => x.Id);
                    table.CheckConstraint("CK_TutorCollaborator_UserOrGroup", "(\"UserId\" IS NOT NULL AND \"GroupId\" IS NULL) OR (\"UserId\" IS NULL AND \"GroupId\" IS NOT NULL)");
                    table.ForeignKey(
                        name: "FK_TutorCollaborator_Group_GroupId",
                        column: x => x.GroupId,
                        principalSchema: "NoveduBackend",
                        principalTable: "Group",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TutorCollaborator_TutorConfig_TutorId",
                        column: x => x.TutorId,
                        principalSchema: "NoveduBackend",
                        principalTable: "TutorConfig",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TutorCollaborator_User_SharedById",
                        column: x => x.SharedById,
                        principalSchema: "NoveduBackend",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TutorCollaborator_User_UserId",
                        column: x => x.UserId,
                        principalSchema: "NoveduBackend",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TutorGroupAssignment_AssignedById",
                schema: "NoveduBackend",
                table: "TutorGroupAssignment",
                column: "AssignedById");

            migrationBuilder.CreateIndex(
                name: "IX_TutorGroupAssignment_BudgetConfigId",
                schema: "NoveduBackend",
                table: "TutorGroupAssignment",
                column: "BudgetConfigId");

            migrationBuilder.CreateIndex(
                name: "IX_TutorConfig_CopiedFromId",
                schema: "NoveduBackend",
                table: "TutorConfig",
                column: "CopiedFromId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetUsagePeriod_BudgetConfigId",
                schema: "NoveduBackend",
                table: "BudgetUsagePeriod",
                column: "BudgetConfigId");

            migrationBuilder.CreateIndex(
                name: "IX_MessageMonitoringFlag_MessageId",
                schema: "NoveduBackend",
                table: "MessageMonitoringFlag",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_MessageMonitoringFlag_ReviewedById",
                schema: "NoveduBackend",
                table: "MessageMonitoringFlag",
                column: "ReviewedById");

            migrationBuilder.CreateIndex(
                name: "IX_TutorCollaborator_GroupId",
                schema: "NoveduBackend",
                table: "TutorCollaborator",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_TutorCollaborator_SharedById",
                schema: "NoveduBackend",
                table: "TutorCollaborator",
                column: "SharedById");

            migrationBuilder.CreateIndex(
                name: "IX_TutorCollaborator_TutorId_GroupId",
                schema: "NoveduBackend",
                table: "TutorCollaborator",
                columns: new[] { "TutorId", "GroupId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TutorCollaborator_TutorId_UserId",
                schema: "NoveduBackend",
                table: "TutorCollaborator",
                columns: new[] { "TutorId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TutorCollaborator_UserId",
                schema: "NoveduBackend",
                table: "TutorCollaborator",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetUsagePeriod_BudgetConfig_BudgetConfigId",
                schema: "NoveduBackend",
                table: "BudgetUsagePeriod",
                column: "BudgetConfigId",
                principalSchema: "NoveduBackend",
                principalTable: "BudgetConfig",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TutorConfig_TutorConfig_CopiedFromId",
                schema: "NoveduBackend",
                table: "TutorConfig",
                column: "CopiedFromId",
                principalSchema: "NoveduBackend",
                principalTable: "TutorConfig",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TutorGroupAssignment_BudgetConfig_BudgetConfigId",
                schema: "NoveduBackend",
                table: "TutorGroupAssignment",
                column: "BudgetConfigId",
                principalSchema: "NoveduBackend",
                principalTable: "BudgetConfig",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TutorGroupAssignment_User_AssignedById",
                schema: "NoveduBackend",
                table: "TutorGroupAssignment",
                column: "AssignedById",
                principalSchema: "NoveduBackend",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BudgetUsagePeriod_BudgetConfig_BudgetConfigId",
                schema: "NoveduBackend",
                table: "BudgetUsagePeriod");

            migrationBuilder.DropForeignKey(
                name: "FK_TutorConfig_TutorConfig_CopiedFromId",
                schema: "NoveduBackend",
                table: "TutorConfig");

            migrationBuilder.DropForeignKey(
                name: "FK_TutorGroupAssignment_BudgetConfig_BudgetConfigId",
                schema: "NoveduBackend",
                table: "TutorGroupAssignment");

            migrationBuilder.DropForeignKey(
                name: "FK_TutorGroupAssignment_User_AssignedById",
                schema: "NoveduBackend",
                table: "TutorGroupAssignment");

            migrationBuilder.DropTable(
                name: "MessageMonitoringFlag",
                schema: "NoveduBackend");

            migrationBuilder.DropTable(
                name: "TutorCollaborator",
                schema: "NoveduBackend");

            migrationBuilder.DropIndex(
                name: "IX_TutorGroupAssignment_AssignedById",
                schema: "NoveduBackend",
                table: "TutorGroupAssignment");

            migrationBuilder.DropIndex(
                name: "IX_TutorGroupAssignment_BudgetConfigId",
                schema: "NoveduBackend",
                table: "TutorGroupAssignment");

            migrationBuilder.DropIndex(
                name: "IX_TutorConfig_CopiedFromId",
                schema: "NoveduBackend",
                table: "TutorConfig");

            migrationBuilder.DropIndex(
                name: "IX_BudgetUsagePeriod_BudgetConfigId",
                schema: "NoveduBackend",
                table: "BudgetUsagePeriod");

            migrationBuilder.DropColumn(
                name: "EnabledFrom",
                schema: "NoveduBackend",
                table: "TutorStudentAssignment");

            migrationBuilder.DropColumn(
                name: "AssignedById",
                schema: "NoveduBackend",
                table: "TutorGroupAssignment");

            migrationBuilder.DropColumn(
                name: "BudgetConfigId",
                schema: "NoveduBackend",
                table: "TutorGroupAssignment");

            migrationBuilder.DropColumn(
                name: "EnabledFrom",
                schema: "NoveduBackend",
                table: "TutorGroupAssignment");

            migrationBuilder.DropColumn(
                name: "CopiedFromId",
                schema: "NoveduBackend",
                table: "TutorConfig");

            migrationBuilder.DropColumn(
                name: "DefaultInternalPermission",
                schema: "NoveduBackend",
                table: "TutorConfig");

            migrationBuilder.DropColumn(
                name: "Visibility",
                schema: "NoveduBackend",
                table: "TutorConfig");

            migrationBuilder.DropColumn(
                name: "Role",
                schema: "NoveduBackend",
                table: "GroupMember");

            migrationBuilder.DropColumn(
                name: "BudgetConfigId",
                schema: "NoveduBackend",
                table: "BudgetUsagePeriod");

            migrationBuilder.DropColumn(
                name: "AnonymizePii",
                schema: "NoveduBackend",
                table: "TutorConfig");

            migrationBuilder.DropColumn(
                name: "IsAuto",
                schema: "NoveduBackend",
                table: "AiModel");

            migrationBuilder.DropColumn(
                name: "RecommendationTag",
                schema: "NoveduBackend",
                table: "AiModel");

            migrationBuilder.AddColumn<bool>(
                name: "IsEnabled",
                schema: "NoveduBackend",
                table: "TutorConfig",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Instant>(
                name: "ExpiresAt",
                schema: "NoveduBackend",
                table: "TutorConfig",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BudgetPeriod",
                schema: "NoveduBackend",
                table: "BudgetUsagePeriod",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
