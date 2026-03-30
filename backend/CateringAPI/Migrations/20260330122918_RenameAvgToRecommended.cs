using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CateringAPI.Migrations
{
    /// <inheritdoc />
    public partial class RenameAvgToRecommended : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvgOrderedPerPerson",
                table: "MenuItems");

            migrationBuilder.AddColumn<int>(
                name: "RecommendedPer100Guests",
                table: "MenuItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RecommendedPer100Guests",
                table: "MenuItems");

            migrationBuilder.AddColumn<decimal>(
                name: "AvgOrderedPerPerson",
                table: "MenuItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
