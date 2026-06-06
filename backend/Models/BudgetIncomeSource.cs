using System.ComponentModel.DataAnnotations; using System.ComponentModel.DataAnnotations.Schema;
namespace BudgetFlowAPi.Models;
[Table("budget_income_sources")]
public class BudgetIncomeSource { [Key] public int Id{get;set;} [Required,Column("budget_id")] public int BudgetId{get;set;} [Required,Column("name"),StringLength(160)] public string Name{get;set;}=string.Empty; [Required,Column("amount")] public decimal Amount{get;set;} [Column("frequency"),StringLength(120)] public string Frequency{get;set;}=string.Empty; [Column("expected_date")] public DateTime? ExpectedDate{get;set;} [Required,Column("is_received")] public bool IsReceived{get;set;} [ForeignKey(nameof(BudgetId))] public Budget Budget{get;set;}=null!; }
