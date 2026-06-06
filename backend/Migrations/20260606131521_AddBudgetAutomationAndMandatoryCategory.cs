using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BudgetFlowAPi.Migrations
{
    /// <inheritdoc />
    public partial class AddBudgetAutomationAndMandatoryCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "auto_create_next_monthly",
                table: "budgets",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "budget_category_id",
                table: "budget_mandatory_expenses",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_budgets_owner_id_year_month",
                table: "budgets",
                columns: new[] { "owner_id", "year", "month" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_budget_mandatory_expenses_budget_category_id",
                table: "budget_mandatory_expenses",
                column: "budget_category_id");

            migrationBuilder.AddForeignKey(
                name: "FK_budget_mandatory_expenses_budget_categories_budget_category~",
                table: "budget_mandatory_expenses",
                column: "budget_category_id",
                principalTable: "budget_categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_budget_mandatory_expenses_budget_categories_budget_category~",
                table: "budget_mandatory_expenses");

            migrationBuilder.DropIndex(
                name: "IX_budgets_owner_id_year_month",
                table: "budgets");

            migrationBuilder.DropIndex(
                name: "IX_budget_mandatory_expenses_budget_category_id",
                table: "budget_mandatory_expenses");

            migrationBuilder.DropColumn(
                name: "auto_create_next_monthly",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "budget_category_id",
                table: "budget_mandatory_expenses");
        }
    }
}
