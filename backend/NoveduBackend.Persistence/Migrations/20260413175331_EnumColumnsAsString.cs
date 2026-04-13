using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoveduBackend.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EnumColumnsAsString : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:citext", ",,")
                .OldAnnotation("Npgsql:Enum:budget_config_type", "role,group,user")
                .OldAnnotation("Npgsql:Enum:budget_period", "daily,weekly,monthly,yearly")
                .OldAnnotation("Npgsql:Enum:didactic_mode", "socratic,hints,step_by_step,concise")
                .OldAnnotation("Npgsql:Enum:message_role", "user,assistant")
                .OldAnnotation("Npgsql:Enum:tutor_document_kind", "knowledge,assignment")
                .OldAnnotation("Npgsql:PostgresExtension:citext", ",,");

            migrationBuilder.AlterColumn<string>(
                name: "Kind",
                schema: "NoveduBackend",
                table: "TutorDocument",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "DidacticMode",
                schema: "NoveduBackend",
                table: "TutorConfig",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                schema: "NoveduBackend",
                table: "Message",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "BudgetPeriod",
                schema: "NoveduBackend",
                table: "BudgetUsagePeriod",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                schema: "NoveduBackend",
                table: "BudgetConfig",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "BudgetPeriod",
                schema: "NoveduBackend",
                table: "BudgetConfig",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:budget_config_type", "role,group,user")
                .Annotation("Npgsql:Enum:budget_period", "daily,weekly,monthly,yearly")
                .Annotation("Npgsql:Enum:didactic_mode", "socratic,hints,step_by_step,concise")
                .Annotation("Npgsql:Enum:message_role", "user,assistant")
                .Annotation("Npgsql:Enum:tutor_document_kind", "knowledge,assignment")
                .Annotation("Npgsql:PostgresExtension:citext", ",,")
                .OldAnnotation("Npgsql:PostgresExtension:citext", ",,");

            migrationBuilder.AlterColumn<int>(
                name: "Kind",
                schema: "NoveduBackend",
                table: "TutorDocument",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "DidacticMode",
                schema: "NoveduBackend",
                table: "TutorConfig",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "Role",
                schema: "NoveduBackend",
                table: "Message",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "BudgetPeriod",
                schema: "NoveduBackend",
                table: "BudgetUsagePeriod",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "Type",
                schema: "NoveduBackend",
                table: "BudgetConfig",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "BudgetPeriod",
                schema: "NoveduBackend",
                table: "BudgetConfig",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
