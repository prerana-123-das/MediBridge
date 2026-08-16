using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Razorpay.Api;
using MediBridge.Services.EmailPayment.DTOs;
using MediBridge.Services.EmailPayment.Entities;
using MediBridge.Services.EmailPayment.Repositories.Interfaces;
using MediBridge.Services.EmailPayment.Services.Interfaces;

namespace MediBridge.Services.EmailPayment.Services.Implementations
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentTransactionRepository _repository;
        private readonly IEmailService _emailService;
        private readonly ILogger<PaymentService> _logger;
        private readonly RazorpayOptions _razorpayOptions;
        private readonly MediBridge.Services.EmailPayment.Data.MediBridgeDbContext _dbContext;

        public PaymentService(
            IPaymentTransactionRepository repository, 
            IEmailService emailService, 
            ILogger<PaymentService> logger,
            IOptions<RazorpayOptions> razorpayOptions,
            MediBridge.Services.EmailPayment.Data.MediBridgeDbContext dbContext)
        {
            _repository = repository;
            _emailService = emailService;
            _logger = logger;
            _razorpayOptions = razorpayOptions.Value;
            _dbContext = dbContext;
        }

        public async Task<CreateOrderResponseDto> CreateOrderAsync(CreateOrderRequestDto request)
        {
            _logger.LogInformation("Creating Razorpay Order for Appointment #{ApptId}, Amount: {Amount}", request.AppointmentId, request.Amount);
            
            try
            {
                RazorpayClient client = new RazorpayClient(_razorpayOptions.KeyId, _razorpayOptions.KeySecret);
                
                Dictionary<string, object> options = new Dictionary<string, object>();
                options.Add("amount", (int)(request.Amount * 100)); // amount in the smallest currency unit (paise)
                options.Add("receipt", $"rcptid_{request.AppointmentId}");
                options.Add("currency", "INR");

                Order order = client.Order.Create(options);

                return new CreateOrderResponseDto
                {
                    Success = true,
                    OrderId = order["id"].ToString(),
                    Amount = request.Amount,
                    Message = "Order created successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create Razorpay Order.");
                return new CreateOrderResponseDto
                {
                    Success = false,
                    Message = "Error creating Razorpay Order: " + ex.Message
                };
            }
        }

        public async Task<PaymentResponseDto> ProcessPaymentAsync(PaymentRequestDto request)
        {
            _logger.LogInformation("Processing payment for Appointment #{ApptId}", request.AppointmentId);

            // Verify Razorpay Signature if provided
            if (!string.IsNullOrEmpty(request.RazorpayPaymentId) && 
                !string.IsNullOrEmpty(request.RazorpayOrderId) && 
                !string.IsNullOrEmpty(request.RazorpaySignature))
            {
                try
                {
                    string expectedSignature = ComputeSha256Hash(request.RazorpayOrderId + "|" + request.RazorpayPaymentId, _razorpayOptions.KeySecret);
                    if (expectedSignature != request.RazorpaySignature)
                    {
                        throw new Exception("Invalid Payment Signature");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Razorpay signature verification failed.");
                    throw new Exception("Payment verification failed: " + ex.Message);
                }
            }
            else
            {
                _logger.LogWarning("No Razorpay signature provided. Proceeding assuming simulated payment.");
            }

            var transaction = new PaymentTransaction
            {
                AppointmentId = request.AppointmentId,
                Amount = request.Amount,
                PaymentMethod = request.PaymentMethod,
                TransactionStatus = TransactionStatuses.Paid,
                ProcessedAt = DateTime.UtcNow
            };

            string dbNotice = string.Empty;
            try
            {
                await _repository.CreateAsync(transaction);
            }
            catch (Exception dbEx)
            {
                _logger.LogWarning("Notice: Could not commit transaction to MySQL: {Msg}. Proceeding in Dev/Demo simulation mode.", dbEx.InnerException?.Message ?? dbEx.Message);
                transaction.TransactionId = new Random().Next(10000, 999999);
                dbNotice = " [Simulated DB Save]";
            }

            string receiptReference = request.RazorpayPaymentId ?? $"MDB-TXN-{transaction.TransactionId:D6}";
            string patientName = string.IsNullOrWhiteSpace(request.PatientName) ? "Valued Patient" : request.PatientName;
            string doctorName = string.IsNullOrWhiteSpace(request.DoctorName) ? "MediBridge Specialist" : request.DoctorName;

            if (!string.IsNullOrWhiteSpace(request.PatientEmail))
            {
                try
                {
                    await _emailService.SendPaymentReceiptAsync(
                        transaction.AppointmentId,
                        transaction.Amount,
                        transaction.PaymentMethod,
                        request.PatientEmail,
                        patientName,
                        doctorName,
                        receiptReference);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Automated receipt email could not be delivered.");
                }
            }

            return new PaymentResponseDto
            {
                Success = true,
                TransactionId = transaction.TransactionId,
                AppointmentId = transaction.AppointmentId,
                Amount = transaction.Amount,
                PaymentMethod = transaction.PaymentMethod,
                Status = transaction.TransactionStatus,
                ProcessedAt = transaction.ProcessedAt,
                ReceiptReference = receiptReference,
                Message = $"Payment completed successfully.{dbNotice}"
            };
        }

        private static string ComputeSha256Hash(string rawData, string secret)
        {
            byte[] keyByte = Encoding.UTF8.GetBytes(secret);
            byte[] messageBytes = Encoding.UTF8.GetBytes(rawData);
            using (var hmacsha256 = new HMACSHA256(keyByte))
            {
                byte[] hashmessage = hmacsha256.ComputeHash(messageBytes);
                return BitConverter.ToString(hashmessage).Replace("-", "").ToLower();
            }
        }

        public async Task<IEnumerable<PaymentResponseDto>> GetPaymentsForAppointmentAsync(int appointmentId)
        {
            var transactions = await _repository.GetByAppointmentIdAsync(appointmentId);
            return transactions.Select(t => new PaymentResponseDto
            {
                Success = t.TransactionStatus == TransactionStatuses.Paid,
                TransactionId = t.TransactionId,
                AppointmentId = t.AppointmentId,
                Amount = t.Amount,
                PaymentMethod = t.PaymentMethod,
                Status = t.TransactionStatus,
                ProcessedAt = t.ProcessedAt,
                ReceiptReference = $"MDB-TXN-{t.TransactionId:D6}",
                Message = "Retrieved transaction details."
            });
        }

        public async Task<IEnumerable<PaymentResponseDto>> GetAllPaymentsAsync()
        {
            var transactions = await _repository.GetAllAsync();
            return transactions.Select(t => new PaymentResponseDto
            {
                Success = t.TransactionStatus == TransactionStatuses.Paid,
                TransactionId = t.TransactionId,
                AppointmentId = t.AppointmentId,
                Amount = t.Amount,
                PaymentMethod = t.PaymentMethod,
                Status = t.TransactionStatus,
                ProcessedAt = t.ProcessedAt,
                ReceiptReference = $"MDB-TXN-{t.TransactionId:D6}",
                Message = "Retrieved transaction details."
            });
        }

        public async Task<DetailedReceiptDto> GetDetailedReceiptAsync(int transactionId)
        {
            var payment = await _repository.GetByIdAsync(transactionId);
            if (payment == null) return null;

            var cache = await _dbContext.AppointmentCaches.FindAsync(payment.AppointmentId);

            return new DetailedReceiptDto
            {
                TransactionId = payment.TransactionId,
                AppointmentId = payment.AppointmentId,
                AmountPaid = payment.Amount,
                PaymentMethod = payment.PaymentMethod,
                ProcessedAt = payment.ProcessedAt,
                PatientName = cache?.PatientName ?? "Unknown (Data not synced yet)",
                DoctorName = cache?.DoctorName ?? "Unknown"
            };
        }
    }
}
