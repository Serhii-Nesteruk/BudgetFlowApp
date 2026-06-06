using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BudgetFlowAPi.Migrations
{
    /// <inheritdoc />
    public partial class AddDebts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "debts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    direction = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    type = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    creditor = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    amount = table.Column<decimal>(type: "numeric", nullable: false),
                    remaining = table.Column<decimal>(type: "numeric", nullable: false),
                    currency = table.Column<string>(type: "varchar(5)", maxLength: 5, nullable: false),
                    due_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    priority = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false),
                    total_installments = table.Column<int>(type: "integer", nullable: true),
                    paid_installments = table.Column<int>(type: "integer", nullable: true),
                    monthly_payment = table.Column<decimal>(type: "numeric", nullable: true),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    recurring_day = table.Column<int>(type: "integer", nullable: true),
                    recurring_period = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_debts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_debts_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "debt_installments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    debt_id = table.Column<int>(type: "integer", nullable: false),
                    installment_index = table.Column<int>(type: "integer", nullable: false),
                    date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    amount = table.Column<decimal>(type: "numeric", nullable: false),
                    paid = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_debt_installments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_debt_installments_debts_debt_id",
                        column: x => x.debt_id,
                        principalTable: "debts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "debt_payments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    debt_id = table.Column<int>(type: "integer", nullable: false),
                    date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    amount = table.Column<decimal>(type: "numeric", nullable: false),
                    note = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_debt_payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_debt_payments_debts_debt_id",
                        column: x => x.debt_id,
                        principalTable: "debts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_debt_installments_date",
                table: "debt_installments",
                column: "date");

            migrationBuilder.CreateIndex(
                name: "IX_debt_installments_debt_id",
                table: "debt_installments",
                column: "debt_id");

            migrationBuilder.CreateIndex(
                name: "IX_debt_payments_date",
                table: "debt_payments",
                column: "date");

            migrationBuilder.CreateIndex(
                name: "IX_debt_payments_debt_id",
                table: "debt_payments",
                column: "debt_id");

            migrationBuilder.CreateIndex(
                name: "IX_debts_direction",
                table: "debts",
                column: "direction");

            migrationBuilder.CreateIndex(
                name: "IX_debts_due_date",
                table: "debts",
                column: "due_date");

            migrationBuilder.CreateIndex(
                name: "IX_debts_status",
                table: "debts",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_debts_user_id",
                table: "debts",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "debt_installments");

            migrationBuilder.DropTable(
                name: "debt_payments");

            migrationBuilder.DropTable(
                name: "debts");
        }
    }
}
