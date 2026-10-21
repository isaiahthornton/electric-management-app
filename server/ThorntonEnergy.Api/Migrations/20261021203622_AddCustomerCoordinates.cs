using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThorntonEnergy.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerCoordinates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Latitude",
                table: "Customers",
                type: "decimal(9,6)",
                precision: 9,
                scale: 6,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Longitude",
                table: "Customers",
                type: "decimal(9,6)",
                precision: 9,
                scale: 6,
                nullable: true);

            // Data migration: put the 4 demo customers on the map, a few blocks apart around East Windsor, NJ
            migrationBuilder.Sql("UPDATE dbo.Customers SET Latitude = 40.270000, Longitude = -74.530000 WHERE Id = 1");
            migrationBuilder.Sql("UPDATE dbo.Customers SET Latitude = 40.273500, Longitude = -74.526200 WHERE Id = 2");
            migrationBuilder.Sql("UPDATE dbo.Customers SET Latitude = 40.266800, Longitude = -74.534100 WHERE Id = 3");
            migrationBuilder.Sql("UPDATE dbo.Customers SET Latitude = 40.271200, Longitude = -74.538500 WHERE Id = 4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Customers");
        }
    }
}
