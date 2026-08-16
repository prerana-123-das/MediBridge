using System;

namespace MediBridge.Services.EmailPayment.DTOs
{
    public class DetailedReceiptDto
    {
         // Contains detailed information for a payment receipt
        public int TransactionId { get; set; }
        public int AppointmentId { get; set; }
        public decimal AmountPaid { get; set; }
        public string PaymentMethod { get; set; }
        public DateTime ProcessedAt { get; set; }
        public string PatientName { get; set; }
        public string DoctorName { get; set; }
    }
}
