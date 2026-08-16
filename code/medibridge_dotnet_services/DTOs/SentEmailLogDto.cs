using System;

namespace MediBridge.Services.EmailPayment.DTOs
{
    public class SentEmailLogDto
    {
        public Guid MessageId { get; set; } = Guid.NewGuid();
        public string RecipientEmail { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string BodyPreview { get; set; } = string.Empty;
        public string FullBody { get; set; } = string.Empty;
        public string Category { get; set; } = "General"; // Welcome, PasswordReset, Receipt
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Delivered (Dev Log)";
    }
}
