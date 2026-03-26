using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CateringAPI.Migrations
{
    /// <inheritdoc />
    public partial class MakeTaskEventNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Events_EventId",
                table: "Tasks");

            migrationBuilder.AlterColumn<int>(
                name: "EventId",
                table: "Tasks",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Events_EventId",
                table: "Tasks",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Events_EventId",
                table: "Tasks");

            migrationBuilder.AlterColumn<int>(
                name: "EventId",
                table: "Tasks",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Events_EventId",
                table: "Tasks",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
