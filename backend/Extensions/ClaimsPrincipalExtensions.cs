using System.Security.Claims;

namespace BudgetFlowAPi.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier);

        if (claim == null || !int.TryParse(claim.Value, out var userId))
            throw new UnauthorizedAccessException("Invalid or missing user ID claim.");

        return userId;
    }
}
