using BudgetFlowAPi.Models;
using BudgetFlowAPi.Repositories;
using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Mappings;
using BudgetFlowAPi.Infrastructure.ApiClients.Receipts.Dtos;

namespace BudgetFlowAPi.Services;

public class TransactionService : CrudService<Transaction>, ITransactionService
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IReceiptService _receiptService;
    public TransactionService(ITransactionRepository transactionRepository, IReceiptService receiptService) : base(transactionRepository)
    {
        _transactionRepository = transactionRepository;
        _receiptService = receiptService;
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

    public async Task UpdateAsync(TransactionDto dto)
    {
        var transaction = await GetByIdForUserIdAsync(dto.Id, dto.UserId);
        if (transaction == null)
        {
            throw new Exception("Transaction not found for the given user.");
        }

        transaction.Counterparty = dto.Counterparty;
        transaction.Title = dto.Title;
        transaction.Description = dto.Description;
        transaction.Details = dto.Details;
        transaction.Amount = dto.Amount;
        transaction.Currency = dto.Currency;
        transaction.Date = dto.Date;
        transaction.Type = dto.Type;
        transaction.UpdatedAt = DateTime.UtcNow;

        await _transactionRepository.UpdateAsync(transaction);
    }

    public Task<Transaction> AddTransactionFromReceiptImage(IFormFile receiptImage, int userId, CancellationToken cancellationToken = default)
    {
        return _receiptService.ExtractReceiptFieldsAsync(receiptImage, cancellationToken)
            .ContinueWith(task =>
            {
                var fields = task.Result;
                if (fields == null)
                {
                    throw new Exception("Failed to extract fields from receipt image.");
                }
                return CreateTransactionFromReceiptFields(fields).Result;
            }, cancellationToken);
    }
    public Task<Transaction> CreateTransactionFromReceiptFields(ReceiptDto fields)
    {
       var transaction = TransactionMapping.FromReceiptFieldsToTransaction(fields);
       transaction.CreatedAt = DateTime.UtcNow;
       return _transactionRepository.AddAsync(transaction);
    }

    public async Task<Transaction> AddAsync(TransactionDto dto, int userId)
    {
        var transaction = TransactionMapping.ToEntity(dto);
        transaction.UserId = userId;
        transaction.CreatedAt = DateTime.UtcNow;

        return await _transactionRepository.AddAsync(transaction);
    }
}