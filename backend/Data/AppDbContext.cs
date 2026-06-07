using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Models.User> Users
    {
        get; set;
    }
    public DbSet<Models.Transaction> Transactions
    {
        get; set;
    }
    public DbSet<Models.Receipt> Receipts
    {
        get; set;
    }
    public DbSet<Models.Debt> Debts
    {
        get; set;
    }
    public DbSet<Models.DebtPayment> DebtPayments
    {
        get; set;
    }
    public DbSet<Models.DebtInstallment> DebtInstallments
    {
        get; set;
    }
    public DbSet<Models.UserSettings> UserSettings
    {
        get; set;
    }
    public DbSet<Models.TelegramAccount> TelegramAccounts
    {
        get; set;
    }
    public DbSet<Models.TelegramConnectionCode> TelegramConnectionCodes
    {
        get; set;
    }
    public DbSet<Models.Budget> Budgets
    {
        get; set;
    }
    public DbSet<Models.BudgetCategory> BudgetCategories
    {
        get; set;
    }
    public DbSet<Models.BudgetCategoryLabel> BudgetCategoryLabels
    {
        get; set;
    }
    public DbSet<Models.BudgetIncomeSource> BudgetIncomeSources
    {
        get; set;
    }
    public DbSet<Models.BudgetMandatoryExpense> BudgetMandatoryExpenses
    {
        get; set;
    }
    public DbSet<Models.BudgetPlannedExpense> BudgetPlannedExpenses
    {
        get; set;
    }
    public DbSet<Models.BudgetSharedUser> BudgetSharedUsers
    {
        get; set;
    }
    public DbSet<Models.TransactionTag> TransactionTags
    {
        get; set;
    }
    public DbSet<Models.SavingsGoal> SavingsGoals
    {
        get; set;
    }
    public DbSet<Models.SavingsGoalTag> SavingsGoalTags
    {
        get; set;
    }
    public DbSet<Models.SavingsEntry> SavingsEntries
    {
        get; set;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        modelBuilder.Entity<Models.TransactionTag>()
            .HasOne(x => x.Transaction)
            .WithMany(x => x.Tags)
            .HasForeignKey(x => x.TransactionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Models.SavingsGoal>()
            .HasOne(x => x.User)
            .WithMany(x => x.SavingsGoals)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Models.SavingsGoalTag>()
            .HasOne(x => x.SavingsGoal)
            .WithMany(x => x.Tags)
            .HasForeignKey(x => x.SavingsGoalId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Models.SavingsEntry>()
            .HasOne(x => x.SavingsGoal)
            .WithMany(x => x.Entries)
            .HasForeignKey(x => x.SavingsGoalId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Models.UserSettings>()
            .HasOne(x => x.User)
            .WithOne(x => x.Settings)
            .HasForeignKey<Models.UserSettings>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Models.UserSettings>()
            .Property(x => x.FontSize)
            .HasDefaultValue("normal");

        modelBuilder.Entity<Models.Budget>()
            .HasOne(x => x.Owner)
            .WithMany(x => x.OwnedBudgets)
            .HasForeignKey(x => x.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Models.BudgetSharedUser>()
            .HasOne(x => x.User)
            .WithMany(x => x.SharedBudgets)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Models.BudgetSharedUser>()
            .HasOne(x => x.Budget)
            .WithMany(x => x.SharedUsers)
            .HasForeignKey(x => x.BudgetId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Models.BudgetPlannedExpense>()
            .HasOne(x => x.Category)
            .WithMany()
            .HasForeignKey(x => x.BudgetCategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Models.BudgetMandatoryExpense>()
            .HasOne(x => x.Category)
            .WithMany()
            .HasForeignKey(x => x.BudgetCategoryId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
