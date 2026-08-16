using System;
using System.ComponentModel.DataAnnotations;

namespace MediBridge.Services.EmailPayment.DTOs
{
    // Data received when making a payment
    public class PaymentRequestDto
    {
        // Appointment for which payment is being made
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "A valid Appointment ID is required.")]
        public int AppointmentId { get; set; }

        // Amount to be paid
        [Required]
        [Range(0.01, 100000.00, ErrorMessage = "Amount must be greater than zero.")]
        public decimal Amount { get; set; }

        // Payment method: Card, UPI, or NetBanking
        [Required]
        public string PaymentMethod { get; set; } = "Card";

        public string? PatientEmail { get; set; }
        public string? PatientName { get; set; }
        public string? DoctorName { get; set; }

        // Optional payment details
        public string? AccountIdentifier { get; set; }

        // Razorpay payment verification details
        public string? RazorpayPaymentId { get; set; }
        public string? RazorpayOrderId { get; set; }
        public string? RazorpaySignature { get; set; }
    }

    // Data returned after processing a payment
    public class PaymentResponseDto
    {
        public bool Success { get; set; }
        public int TransactionId { get; set; }
        public int AppointmentId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string Status { get; set; } = "Paid";
        public DateTime ProcessedAt { get; set; }
        public string ReceiptReference { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}