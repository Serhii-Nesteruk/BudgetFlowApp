using BudgetFlowAPi.Models;
using BudgetFlowAPi.Repositories;
using BudgetFlowAPi.Controllers;
using BudgetFlowAPi.Data;
using BudgetFlowAPi.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.AddDbContext<AppDbContext>(
    options => options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IRepository<User>, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
   
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllers();
app.Run();
