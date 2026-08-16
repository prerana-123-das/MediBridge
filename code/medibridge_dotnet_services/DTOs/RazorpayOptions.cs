namespace MediBridge.Services.EmailPayment.DTOs
{
    // Stores Razorpay configuration values
    public class RazorpayOptions
    {
        // Razorpay public key
        public string KeyId { get; set; } = string.Empty;

        // Razorpay secret key
        public string KeySecret { get; set; } = string.Empty;
    }
}