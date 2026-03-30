using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CateringAPI.Migrations
{
    /// <inheritdoc />
    public partial class MenuRedesign : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventMenus");

            migrationBuilder.DropColumn(
                name: "QuantityOrdered",
                table: "MenuItems");

            migrationBuilder.DropColumn(
                name: "QuantityWasted",
                table: "MenuItems");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Menus",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "AvgOrderedPerPerson",
                table: "MenuItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Cost",
                table: "MenuItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ServingSizeLb",
                table: "MenuItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "AssignedMenuId",
                table: "Events",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EventMenuItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EventId = table.Column<int>(type: "integer", nullable: false),
                    MenuItemId = table.Column<int>(type: "integer", nullable: false),
                    QtyOrdered = table.Column<int>(type: "integer", nullable: false),
                    QtyLeftover = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventMenuItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventMenuItems_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventMenuItems_MenuItems_MenuItemId",
                        column: x => x.MenuItemId,
                        principalTable: "MenuItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Events_AssignedMenuId",
                table: "Events",
                column: "AssignedMenuId");

            migrationBuilder.CreateIndex(
                name: "IX_EventMenuItems_EventId",
                table: "EventMenuItems",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_EventMenuItems_MenuItemId",
                table: "EventMenuItems",
                column: "MenuItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_Menus_AssignedMenuId",
                table: "Events",
                column: "AssignedMenuId",
                principalTable: "Menus",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_Menus_AssignedMenuId",
                table: "Events");

            migrationBuilder.DropTable(
                name: "EventMenuItems");

            migrationBuilder.DropIndex(
                name: "IX_Events_AssignedMenuId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Menus");

            migrationBuilder.DropColumn(
                name: "AvgOrderedPerPerson",
                table: "MenuItems");

            migrationBuilder.DropColumn(
                name: "Cost",
                table: "MenuItems");

            migrationBuilder.DropColumn(
                name: "ServingSizeLb",
                table: "MenuItems");

            migrationBuilder.DropColumn(
                name: "AssignedMenuId",
                table: "Events");

            migrationBuilder.AddColumn<int>(
                name: "QuantityOrdered",
                table: "MenuItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "QuantityWasted",
                table: "MenuItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);

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
        }
    }
}
