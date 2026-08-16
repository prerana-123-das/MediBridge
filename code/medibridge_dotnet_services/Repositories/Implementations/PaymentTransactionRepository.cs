using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MediBridge.Services.EmailPayment.Data;
using MediBridge.Services.EmailPayment.Entities;
using MediBridge.Services.EmailPayment.Repositories.Interfaces;

namespace MediBridge.Services.EmailPayment.Repositories.Implementations
{
    /// <summary>
    /// Implementation of IPaymentTransactionRepository using Entity Framework Core and MySQL.
    /// Encapsulates all persistence operations and query logic.
    /// </summary>
    public class PaymentTransactionRepository : IPaymentTransactionRepository
    {
        private readonly MediBridgeDbContext _context;

        public PaymentTransactionRepository(MediBridgeDbContext context)
        {
            _context = context;
        }

        public async Task<PaymentTransaction> CreateAsync(PaymentTransaction transaction)
        {
            await _context.PaymentTransactions.AddAsync(transaction);
            await _context.SaveChangesAsync();
            return transaction;
        }

        public async Task<PaymentTransaction?> GetByIdAsync(int transactionId)
        {
            return await _context.PaymentTransactions
                .FirstOrDefaultAsync(t => t.TransactionId == transactionId);
        }

        public async Task<IEnumerable<PaymentTransaction>> GetByAppointmentIdAsync(int appointmentId)
        {
            return await _context.PaymentTransactions
                .Where(t => t.AppointmentId == appointmentId)
                .OrderByDescending(t => t.ProcessedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<PaymentTransaction>> GetAllAsync()
        {
            return await _context.PaymentTransactions
                .OrderByDescending(t => t.ProcessedAt)
                .ToListAsync();
        }

        public async Task<bool> ExistsForAppointmentAsync(int appointmentId)
        {
            return await _context.PaymentTransactions
                .AnyAsync(t => t.AppointmentId == appointmentId && t.TransactionStatus == TransactionStatuses.Paid);
        }
    }
}
