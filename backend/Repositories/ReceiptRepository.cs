using BudgetFlowAPi.Data;
using BudgetFlowAPi.Models;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Repositories;

public class ReceiptRepository : Repository<Receipt>, IReceiptRepository
{
    public ReceiptRepository(AppDbContext context) : base(context)
    {
    }
}
