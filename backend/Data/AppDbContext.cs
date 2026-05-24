using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Models.User> Users { get; set; }
    public DbSet<Models.Transaction> Transactions { get; set; }
    public DbSet<Models.Receipt> Receipts { get; set; }
}