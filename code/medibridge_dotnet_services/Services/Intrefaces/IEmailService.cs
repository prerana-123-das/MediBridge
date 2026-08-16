using System.Collections.Generic;
using System.Threading.Tasks;
using MediBridge.Services.EmailPayment.DTOs;

namespace MediBridge.Services.EmailPayment.Services.Interfaces
{
    /// <summary>
    /// Service Layer interface for Automated Email Notifications.
    /// Abstracts notification rendering and delivery mechanisms (Dev logging vs real SMTP).
    /// Follows SOLID principles by decoupling notification requests from SMTP driver specifics.
    /// </summary>
    public interface IEmailService
    {
        Task<SentEmailLogDto> SendGeneralEmailAsync(EmailRequestDto request);
        Task<SentEmailLogDto> SendWelcomeEmailAsync(WelcomeEmailDto request);
        Task<ForgotPasswordResponseDto> SendForgotPasswordEmailAsync(ForgotPasswordDto request);
        Task<SentEmailLogDto> SendPaymentReceiptAsync(int appointmentId, decimal amount, string paymentMethod, string recipientEmail, string patientName, string doctorName, string receiptReference);
        IEnumerable<SentEmailLogDto> GetSentLogs(int count = 50);
        IEnumerable<SentEmailLogDto> GetLogsByEmail(string email);
    }
}
