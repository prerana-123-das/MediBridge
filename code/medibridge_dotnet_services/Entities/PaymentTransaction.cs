using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MediBridge.Services.EmailPayment.Entities
{
   // Entity Framework Core Code-First entity representing a Payment Transaction.
   // Maps this class to the payment_transaction table
    [Table("payment_transaction")]
    public class PaymentTransaction
    {
        // Primary key; generated automatically by the database
        [Key]
        [Column("transaction_id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TransactionId { get; set; }

        // Appointment for which the payment was made
        [Required]
        [Column("appointment_id")]
        public int AppointmentId { get; set; }

        // Payment amount
        [Required]
        [Column("amount", TypeName = "decimal(10, 2)")]
        public decimal Amount { get; set; }

        // Payment method: Card, UPI, etc.
        [Required]
        [Column("payment_method", TypeName = "varchar(50)")]
        public string PaymentMethod { get; set; } = string.Empty;

        // Current payment status
        [Required]
        [Column("transaction_status", TypeName = "varchar(30)")]
        public string TransactionStatus { get; set; } = "Paid";

        // Time when the payment was processed
        [Column("processed_at")]
        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
    }

    // Common payment status values
    public static class TransactionStatuses
    {
        public const string Paid = "Paid";
        public const string Refunded = "Refunded";
        public const string Failed = "Failed";
    }
}