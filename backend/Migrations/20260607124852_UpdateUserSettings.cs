using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BudgetFlowAPi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "font_size",
                table: "user_settings",
                type: "varchar(12)",
                maxLength: 12,
                nullable: false,
                defaultValue: "normal");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "font_size",
                table: "user_settings");
        }
    }
}
