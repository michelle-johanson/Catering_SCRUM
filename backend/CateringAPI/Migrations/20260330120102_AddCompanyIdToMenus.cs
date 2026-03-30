using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CateringAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyIdToMenus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "Menus",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Menus_CompanyId",
                table: "Menus",
                column: "CompanyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Menus_Companies_CompanyId",
                table: "Menus",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Menus_Companies_CompanyId",
                table: "Menus");

            migrationBuilder.DropIndex(
                name: "IX_Menus_CompanyId",
                table: "Menus");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "Menus");
        }
    }
}
