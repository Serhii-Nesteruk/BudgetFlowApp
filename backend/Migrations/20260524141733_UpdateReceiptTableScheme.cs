using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BudgetFlowAPi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateReceiptTableScheme : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "amount",
                table: "receipts",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "receipts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "date",
                table: "receipts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "receipts",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "amount",
                table: "receipts");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "receipts");

            migrationBuilder.DropColumn(
                name: "date",
                table: "receipts");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "receipts");
        }
    }
}
