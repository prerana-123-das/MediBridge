using System.Collections.Generic;
using System.Threading.Tasks;
using MediBridge.Services.EmailPayment.Entities;

namespace MediBridge.Services.EmailPayment.Repositories.Interfaces
{
    /// <summary>
    /// Repository Pattern interface for Payment Transaction data access.
    /// Follows SOLID principles (Interface Segregation & Dependency Inversion) to decouple service logic from database details.
    /// </summary>
    public interface IPaymentTransactionRepository
    {
        Task<PaymentTransaction> CreateAsync(PaymentTransaction transaction);
        Task<PaymentTransaction?> GetByIdAsync(int transactionId);
        Task<IEnumerable<PaymentTransaction>> GetByAppointmentIdAsync(int appointmentId);
        Task<IEnumerable<PaymentTransaction>> GetAllAsync();
        Task<bool> ExistsForAppointmentAsync(int appointmentId);
    }
}
