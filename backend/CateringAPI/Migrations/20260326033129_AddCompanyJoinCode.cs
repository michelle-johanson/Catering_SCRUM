using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CateringAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyJoinCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "JoinCode",
                table: "Companies",
                type: "text",
                nullable: false,
                defaultValue: "DEFAULT1");

            // Give the seeded Default Company a proper join code
            migrationBuilder.Sql("UPDATE \"Companies\" SET \"JoinCode\" = 'DEFAULT1' WHERE \"Name\" = 'Default Company'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "JoinCode",
                table: "Companies");
        }
    }
}
