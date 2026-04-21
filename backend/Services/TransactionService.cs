using BudgetFlowAPi.Models;
using BudgetFlowAPi.Repositories;

namespace BudgetFlowAPi.Services;

public class TransactionService : CrudService<Transaction>, ITransactionService
{
    private readonly ITransactionRepository _transactionRepository;
    public TransactionService(ITransactionRepository transactionRepository) : base(transactionRepository)
    {
        _transactionRepository = transactionRepository;
    }

    public async Task<IEnumerable<Transaction>> GetByCounterpartyAsync(string counterparty)
    {
        return await _transactionRepository.GetByCounterpartyAsync(counterparty);
    }    

    public async Task<IEnumerable<Transaction>> GetByUserIdAsync(int userId)
    {
        return await _transactionRepository.GetByUserIdAsync(userId);
    }

    public async Task<Transaction?> GetByIdForUserIdAsync(int id, int userId)
    {
        return await _transactionRepository.GetByIdForUserIdAsync(id, userId);
    }
}