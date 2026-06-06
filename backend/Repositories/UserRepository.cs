using BudgetFlowAPi.Data; using BudgetFlowAPi.Models; using Microsoft.EntityFrameworkCore;
namespace BudgetFlowAPi.Repositories;
public class UserRepository : Repository<User>, IUserRepository
{
 private readonly AppDbContext _context; public UserRepository(AppDbContext context):base(context){_context=context;}
 public async Task<User?> GetByEmailAsync(string email)=>await _context.Users.FirstOrDefaultAsync(u=>u.Email==email);
 public async Task<UserSettings?> GetSettingsByUserIdAsync(int userId)=>await _context.UserSettings.FirstOrDefaultAsync(x=>x.UserId==userId);
 public async Task<IEnumerable<TelegramAccount>> GetTelegramAccountsByUserIdAsync(int userId)=>await _context.TelegramAccounts.Where(x=>x.UserId==userId).OrderBy(x=>x.ConnectedAt).ToListAsync();
 public async Task<TelegramConnectionCode?> GetValidTelegramConnectionCodeAsync(string code)=>await _context.TelegramConnectionCodes.Include(x=>x.User).FirstOrDefaultAsync(x=>x.Code==code&&!x.IsUsed&&x.ExpiresAt>DateTime.UtcNow);
 public async Task<TelegramAccount?> GetTelegramAccountByIdForUserIdAsync(int id,int userId)=>await _context.TelegramAccounts.FirstOrDefaultAsync(x=>x.Id==id&&x.UserId==userId);
 public async Task<TelegramAccount?> GetTelegramAccountByTelegramUserIdAsync(long telegramUserId)=>await _context.TelegramAccounts.FirstOrDefaultAsync(x=>x.TelegramUserId==telegramUserId);
 public async Task SaveChangesAsync()=>await _context.SaveChangesAsync();
}
