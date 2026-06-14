using BudgetFlowAPi.Models;
using BudgetFlowAPi.Infrastructure.ApiClients.Receipts.Dtos;
using BudgetFlowAPi.DTO;

namespace BudgetFlowAPi.Services;

public interface ITransactionService : ICrudService<Transaction>
{
    Task<IEnumerable<Transaction>> GetByCounterpartyAsync(string counterparty);
    Task<IEnumerable<Transaction>> GetByUserIdAsync(int userId);
    Task<Transaction?> GetByIdForUserIdAsync(int id, int userId);
    Task UpdateAsync(TransactionDto dto);
    Task<Transaction> AddAsync(TransactionDto dto, int userId);

    Task<Transaction> CreateTransactionFromReceiptFields(ReceiptDto fields, int userId);
    Task<Transaction> AddTransactionFromReceiptImage(IFormFile receiptImage, int userId, CancellationToken cancellationToken = default);
}
