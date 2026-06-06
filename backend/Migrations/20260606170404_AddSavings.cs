using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BudgetFlowAPi.Migrations
{
    /// <inheritdoc />
    public partial class AddSavings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "savings_goals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    target_amount = table.Column<decimal>(type: "numeric", nullable: true),
                    currency = table.Column<string>(type: "varchar(5)", maxLength: 5, nullable: false),
                    icon = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_savings_goals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_savings_goals_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "transaction_tags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    transaction_id = table.Column<int>(type: "integer", nullable: false),
                    value = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_transaction_tags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_transaction_tags_transactions_transaction_id",
                        column: x => x.transaction_id,
                        principalTable: "transactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "savings_entries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    savings_goal_id = table.Column<int>(type: "integer", nullable: false),
                    amount = table.Column<decimal>(type: "numeric", nullable: false),
                    date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_savings_entries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_savings_entries_savings_goals_savings_goal_id",
                        column: x => x.savings_goal_id,
                        principalTable: "savings_goals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "savings_goal_tags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    savings_goal_id = table.Column<int>(type: "integer", nullable: false),
                    value = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_savings_goal_tags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_savings_goal_tags_savings_goals_savings_goal_id",
                        column: x => x.savings_goal_id,
                        principalTable: "savings_goals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_savings_entries_date",
                table: "savings_entries",
                column: "date");

            migrationBuilder.CreateIndex(
                name: "IX_savings_entries_savings_goal_id",
                table: "savings_entries",
                column: "savings_goal_id");

            migrationBuilder.CreateIndex(
                name: "IX_savings_goal_tags_savings_goal_id",
                table: "savings_goal_tags",
                column: "savings_goal_id");

            migrationBuilder.CreateIndex(
                name: "IX_savings_goal_tags_value",
                table: "savings_goal_tags",
                column: "value");

            migrationBuilder.CreateIndex(
                name: "IX_savings_goals_user_id",
                table: "savings_goals",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_transaction_tags_transaction_id",
                table: "transaction_tags",
                column: "transaction_id");

            migrationBuilder.CreateIndex(
                name: "IX_transaction_tags_value",
                table: "transaction_tags",
                column: "value");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "savings_entries");

            migrationBuilder.DropTable(
                name: "savings_goal_tags");

            migrationBuilder.DropTable(
                name: "transaction_tags");

            migrationBuilder.DropTable(
                name: "savings_goals");
        }
    }
}
