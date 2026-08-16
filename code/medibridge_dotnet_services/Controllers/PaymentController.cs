using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MediBridge.Services.EmailPayment.DTOs;
using MediBridge.Services.EmailPayment.Services.Interfaces;

namespace MediBridge.Services.EmailPayment.Controllers
{
    [ApiController]
    [Route("api/v1/payments")]
    [Produces("application/json")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IPaymentService paymentService, ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _logger = logger;
        }

        /// <summary>
        /// Create a Razorpay Order for a new payment transaction.
        /// </summary>
        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _paymentService.CreateOrderAsync(request);
            if (result.Success)
                return Ok(new { success = true, data = result });
            return StatusCode(500, new { success = false, message = result.Message });
        }

        /// <summary>
        /// Process an online payment transaction (Card, UPI, NetBanking), record to MySQL, and deliver email receipt.
        /// </summary>
        [HttpPost("process")]
        public async Task<IActionResult> ProcessPayment([FromBody] PaymentRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _paymentService.ProcessPaymentAsync(request);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to complete payment transaction for Appointment #{Id}", request.AppointmentId);
                return StatusCode(500, new { success = false, message = "Payment processing error occurred", details = ex.Message });
            }
        }

        /// <summary>
        /// Get payment transaction history associated with a specific appointment ID.
        /// </summary>
        [HttpGet("appointment/{appointmentId}")]
        public async Task<IActionResult> GetByAppointmentId(int appointmentId)
        {
            var results = await _paymentService.GetPaymentsForAppointmentAsync(appointmentId);
            return Ok(new { success = true, data = results });
        }

        /// <summary>
        /// Admin/Debug Endpoint: Retrieve all recorded payment transactions in the system.
        /// </summary>
        [HttpGet("all")]
        public async Task<IActionResult> GetAllPayments()
        {
            var results = await _paymentService.GetAllPaymentsAsync();
            return Ok(new { success = true, data = results });
        }

        /// <summary>
        /// Get a detailed receipt that includes local payment data and Kafka-synced appointment data.
        /// </summary>
        [HttpGet("{transactionId}/receipt")]
        public async Task<IActionResult> GetDetailedReceipt(int transactionId)
        {
            var receipt = await _paymentService.GetDetailedReceiptAsync(transactionId);
            if (receipt == null) return NotFound(new { success = false, message = "Transaction not found" });

            return Ok(new { success = true, data = receipt });
        }
    }
}
