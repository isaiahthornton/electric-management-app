using Microsoft.AspNetCore.Mvc;
using ThorntonEnergy.Api.Auth;

namespace ThorntonEnergy.Api.Controllers;

// Shared ownership rules for every controller that serves customer data (each controller "is an" AppControllerBase)
public abstract class AppControllerBase : ControllerBase
{
    protected bool IsAdmin => User.IsAdmin();

    // The logged-in customer's id, read from the JWT (null for admins)
    protected int? CurrentCustomerId => User.GetCustomerId();

    // Single-record rule: admins can reach any customer's data; customers only their own
    protected bool CanAccessCustomer(int customerId) => IsAdmin || CurrentCustomerId == customerId;

    // List rule: which customer's rows may this request see?
    //   admin    -> whatever they asked for (null = everyone)
    //   customer -> always their own id; asking for someone else's returns false (refused)
    protected bool TryGetCustomerScope(int? requestedCustomerId, out int? scope)
    {
        if (IsAdmin)
        {
            scope = requestedCustomerId;
            return true;
        }

        scope = CurrentCustomerId;
        return scope is not null && (requestedCustomerId is null || requestedCustomerId == scope);
    }
}