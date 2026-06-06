using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BudgetFlowAPi.Migrations
{
    /// <inheritdoc />
    public partial class AddBudgetsAndUserSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "budgets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    owner_id = table.Column<int>(type: "integer", nullable: false),
                    type = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    currency = table.Column<string>(type: "varchar(5)", maxLength: 5, nullable: false),
                    total_limit = table.Column<decimal>(type: "numeric", nullable: false),
                    month = table.Column<int>(type: "integer", nullable: true),
                    year = table.Column<int>(type: "integer", nullable: true),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    telegram_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    warning_threshold = table.Column<int>(type: "integer", nullable: false),
                    share_token = table.Column<Guid>(type: "uuid", nullable: false),
                    sharing_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_budgets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_budgets_users_owner_id",
                        column: x => x.owner_id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "telegram_accounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    telegram_user_id = table.Column<long>(type: "bigint", nullable: false),
                    username = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    display_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    connected_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_telegram_accounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_telegram_accounts_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "telegram_connection_codes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    code = table.Column<string>(type: "character varying(6)", maxLength: 6, nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_used = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    used_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_telegram_connection_codes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_telegram_connection_codes_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_settings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    base_currency = table.Column<string>(type: "varchar(5)", maxLength: 5, nullable: false),
                    language = table.Column<string>(type: "varchar(5)", maxLength: 5, nullable: false),
                    minimum_notification_gap_minutes = table.Column<int>(type: "integer", nullable: false),
                    budget_limit_notifications_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    new_entry_notifications_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    debt_deadline_notifications_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    debt_reminder_before_days = table.Column<int>(type: "integer", nullable: false),
                    debt_reminder_repeat_hours = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_settings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_user_settings_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "budget_categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    budget_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    icon = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    color = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    limit = table.Column<decimal>(type: "numeric", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_budget_categories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_budget_categories_budgets_budget_id",
                        column: x => x.budget_id,
                        principalTable: "budgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "budget_income_sources",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    budget_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    amount = table.Column<decimal>(type: "numeric", nullable: false),
                    frequency = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    expected_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_received = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_budget_income_sources", x => x.Id);
                    table.ForeignKey(
                        name: "FK_budget_income_sources_budgets_budget_id",
                        column: x => x.budget_id,
                        principalTable: "budgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "budget_mandatory_expenses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    budget_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    amount = table.Column<decimal>(type: "numeric", nullable: false),
                    due_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    frequency = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    is_paid = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_budget_mandatory_expenses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_budget_mandatory_expenses_budgets_budget_id",
                        column: x => x.budget_id,
                        principalTable: "budgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "budget_shared_users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    budget_id = table.Column<int>(type: "integer", nullable: false),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_budget_shared_users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_budget_shared_users_budgets_budget_id",
                        column: x => x.budget_id,
                        principalTable: "budgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_budget_shared_users_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "budget_category_labels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    budget_category_id = table.Column<int>(type: "integer", nullable: false),
                    value = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_budget_category_labels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_budget_category_labels_budget_categories_budget_category_id",
                        column: x => x.budget_category_id,
                        principalTable: "budget_categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "budget_planned_expenses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    budget_id = table.Column<int>(type: "integer", nullable: false),
                    budget_category_id = table.Column<int>(type: "integer", nullable: true),
                    name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    amount = table.Column<decimal>(type: "numeric", nullable: false),
                    date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_paid = table.Column<bool>(type: "boolean", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_budget_planned_expenses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_budget_planned_expenses_budget_categories_budget_category_id",
                        column: x => x.budget_category_id,
                        principalTable: "budget_categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_budget_planned_expenses_budgets_budget_id",
                        column: x => x.budget_id,
                        principalTable: "budgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_budget_categories_budget_id",
                table: "budget_categories",
                column: "budget_id");

            migrationBuilder.CreateIndex(
                name: "IX_budget_category_labels_budget_category_id_value",
                table: "budget_category_labels",
                columns: new[] { "budget_category_id", "value" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_budget_income_sources_budget_id",
                table: "budget_income_sources",
                column: "budget_id");

            migrationBuilder.CreateIndex(
                name: "IX_budget_mandatory_expenses_budget_id",
                table: "budget_mandatory_expenses",
                column: "budget_id");

            migrationBuilder.CreateIndex(
                name: "IX_budget_planned_expenses_budget_category_id",
                table: "budget_planned_expenses",
                column: "budget_category_id");

            migrationBuilder.CreateIndex(
                name: "IX_budget_planned_expenses_budget_id",
                table: "budget_planned_expenses",
                column: "budget_id");

            migrationBuilder.CreateIndex(
                name: "IX_budget_shared_users_budget_id_user_id",
                table: "budget_shared_users",
                columns: new[] { "budget_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_budget_shared_users_user_id",
                table: "budget_shared_users",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_budgets_owner_id",
                table: "budgets",
                column: "owner_id");

            migrationBuilder.CreateIndex(
                name: "IX_budgets_share_token",
                table: "budgets",
                column: "share_token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_telegram_accounts_telegram_user_id",
                table: "telegram_accounts",
                column: "telegram_user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_telegram_accounts_user_id",
                table: "telegram_accounts",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_telegram_connection_codes_code",
                table: "telegram_connection_codes",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_telegram_connection_codes_user_id",
                table: "telegram_connection_codes",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_settings_user_id",
                table: "user_settings",
                column: "user_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "budget_category_labels");

            migrationBuilder.DropTable(
                name: "budget_income_sources");

            migrationBuilder.DropTable(
                name: "budget_mandatory_expenses");

            migrationBuilder.DropTable(
                name: "budget_planned_expenses");

            migrationBuilder.DropTable(
                name: "budget_shared_users");

            migrationBuilder.DropTable(
                name: "telegram_accounts");

            migrationBuilder.DropTable(
                name: "telegram_connection_codes");

            migrationBuilder.DropTable(
                name: "user_settings");

            migrationBuilder.DropTable(
                name: "budget_categories");

            migrationBuilder.DropTable(
                name: "budgets");
        }
    }
}
