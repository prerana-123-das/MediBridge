using System.ComponentModel.DataAnnotations;

namespace MediBridge.Services.EmailPayment.DTOs
{
    // Data required to create a Razorpay order
    public class CreateOrderRequestDto
    {
        [Required]
        [Range(0.01, 100000.00, ErrorMessage = "Amount must be greater than zero.")]
        public decimal Amount { get; set; }

        [Required]
        public int AppointmentId { get; set; }
    }

    // Response returned after creating the order
    public class CreateOrderResponseDto
    {
        public bool Success { get; set; }
        public string OrderId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public string Message { get; set; } = string.Empty;
    }
}