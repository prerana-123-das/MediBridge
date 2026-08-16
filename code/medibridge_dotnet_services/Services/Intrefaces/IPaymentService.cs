using System.Collections.Generic;
using System.Threading.Tasks;
using MediBridge.Services.EmailPayment.DTOs;

namespace MediBridge.Services.EmailPayment.Services.Interfaces
{
    /// <summary>
    /// Service Layer interface for Payment processing and transaction verification.
    /// Follows Dependency Inversion and Interface Segregation principles.
    /// </summary>
    public interface IPaymentService
    {
        Task<CreateOrderResponseDto> CreateOrderAsync(CreateOrderRequestDto request);
        Task<PaymentResponseDto> ProcessPaymentAsync(PaymentRequestDto request);
        Task<IEnumerable<PaymentResponseDto>> GetPaymentsForAppointmentAsync(int appointmentId);
        Task<IEnumerable<PaymentResponseDto>> GetAllPaymentsAsync();
        Task<DetailedReceiptDto> GetDetailedReceiptAsync(int transactionId);
    }
}
