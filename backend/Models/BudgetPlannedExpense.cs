using System.ComponentModel.DataAnnotations; using System.ComponentModel.DataAnnotations.Schema;
namespace BudgetFlowAPi.Models;

[Table("budget_planned_expenses")]
public class BudgetPlannedExpense { [Key] public int Id{get;set;} [Required,Column("budget_id")] public int BudgetId{get;set;} [Column("budget_category_id")] public int? BudgetCategoryId{get;set;} [Required,Column("name"),StringLength(160)] public string Name{get;set;}=string.Empty; [Required,Column("amount")] public decimal Amount{get;set;} [Required,Column("date")] public DateTime Date{get;set;} [Required,Column("is_paid")] public bool IsPaid{get;set;} [Column("notes")] public string Notes{get;set;}=string.Empty; [ForeignKey(nameof(BudgetId))] public Budget Budget{get;set;}=null!; [ForeignKey(nameof(BudgetCategoryId))] public BudgetCategory? Category{get;set;} }
