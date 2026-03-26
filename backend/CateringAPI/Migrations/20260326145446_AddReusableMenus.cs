using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CateringAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddReusableMenus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EventMenus",
                columns: table => new
                {
                    EventsId = table.Column<int>(type: "integer", nullable: false),
                    MenusId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventMenus", x => new { x.EventsId, x.MenusId });
                    table.ForeignKey(
                        name: "FK_EventMenus_Events_EventsId",
                        column: x => x.EventsId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventMenus_Menus_MenusId",
                        column: x => x.MenusId,
                        principalTable: "Menus",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EventMenus_MenusId",
                table: "EventMenus",
                column: "MenusId");

            migrationBuilder.Sql(
                """
                INSERT INTO "EventMenus" ("EventsId", "MenusId")
                SELECT "EventId", "Id"
                FROM "Menus";
                """);

            migrationBuilder.DropForeignKey(
                name: "FK_Menus_Events_EventId",
                table: "Menus");

            migrationBuilder.DropIndex(
                name: "IX_Menus_EventId",
                table: "Menus");

            migrationBuilder.DropColumn(
                name: "EventId",
                table: "Menus");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventMenus");

            migrationBuilder.AddColumn<int>(
                name: "EventId",
                table: "Menus",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Menus_EventId",
                table: "Menus",
                column: "EventId");

            migrationBuilder.AddForeignKey(
                name: "FK_Menus_Events_EventId",
                table: "Menus",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
