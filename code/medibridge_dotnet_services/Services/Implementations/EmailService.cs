using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MediBridge.Services.EmailPayment.DTOs;
using MediBridge.Services.EmailPayment.Services.Interfaces;
using MediBridge.Services.EmailPayment.Services.Singletons;

namespace MediBridge.Services.EmailPayment.Services.Implementations
{
    /// <summary>
    /// Implementation of IEmailService using rich HTML formatting, real SMTP internet email delivery, and Singleton Dev Log archiving.
    /// Encapsulates notification template design matching MediBridge visual branding.
    /// </summary>
    public class EmailService : IEmailService
    {
        private readonly DevEmailLogSingleton _emailLogSingleton;
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(DevEmailLogSingleton emailLogSingleton, IConfiguration config, ILogger<EmailService> logger)
        {
            _emailLogSingleton = emailLogSingleton;
            _config = config;
            _logger = logger;
        }

        public async Task<SentEmailLogDto> SendGeneralEmailAsync(EmailRequestDto request)
        {
            var log = new SentEmailLogDto
            {
                RecipientEmail = request.RecipientEmail,
                Subject = request.Subject,
                BodyPreview = request.Body.Length > 100 ? request.Body.Substring(0, 100) + "..." : request.Body,
                FullBody = WrapInHtmlTemplate(request.Subject, request.Body),
                Category = "General",
                Timestamp = DateTime.UtcNow,
                Status = "Delivered"
            };

            _emailLogSingleton.LogEmail(log);
            _logger.LogInformation("Email sent to {Recipient} with Subject: {Subject}", log.RecipientEmail, log.Subject);
            
            await SendRealSmtpEmailAsync(log);

            return log;
        }

        public async Task<SentEmailLogDto> SendWelcomeEmailAsync(WelcomeEmailDto request)
        {
            string roleDisplayName = string.Equals(request.Role, "Doctor", StringComparison.OrdinalIgnoreCase) 
                ? "Healthcare Practitioner" 
                : "Patient";

            string subject = $"Welcome to MediBridge, {request.FullName}!";
            string bodyContent = $@"
                <h2 style='color: #1E3A8A; margin-bottom: 10px;'>Welcome to the Future of Healthcare!</h2>
                <p>Hello <strong>{request.FullName}</strong>,</p>
                <p>Your account as a <strong>{roleDisplayName}</strong> has been successfully created and registered on MediBridge.</p>
                <div style='background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0;'>
                    <p style='margin: 0; color: #1E40AF;'>You can now securely access your digital health dashboard, manage appointments, and interact with healthcare specialists.</p>
                </div>
                <p>If you have any questions, our patient support team is ready to help 24/7.</p>
                <p>Best regards,<br/><strong>The MediBridge Team</strong></p>";

            var log = new SentEmailLogDto
            {
                RecipientEmail = request.RecipientEmail,
                Subject = subject,
                BodyPreview = $"Welcome {request.FullName}! Your MediBridge account has been created.",
                FullBody = WrapInHtmlTemplate("Welcome to MediBridge", bodyContent),
                Category = "Registration",
                Timestamp = DateTime.UtcNow,
                Status = "Delivered"
            };

            _emailLogSingleton.LogEmail(log);
            _logger.LogInformation("Welcome email sent to new {Role} account: {Email}", request.Role, request.RecipientEmail);

            await SendRealSmtpEmailAsync(log);

            return log;
        }

        public async Task<ForgotPasswordResponseDto> SendForgotPasswordEmailAsync(ForgotPasswordDto request)
        {
            string resetToken = Guid.NewGuid().ToString("N");
            string resetLink = $"http://localhost:4000/reset-password?token={resetToken}&email={Uri.EscapeDataString(request.Email)}";

            string subject = "MediBridge - Password Reset Request";
            string bodyContent = $@"
                <h2 style='color: #DC2626; margin-bottom: 10px;'>Password Recovery Instructions</h2>
                <p>We received a request to reset the password associated with your MediBridge account (<strong>{request.Email}</strong>).</p>
                <p>Please click the secure link below to proceed with resetting your credentials:</p>
                <div style='text-align: center; margin: 25px 0;'>
                    <a href='{resetLink}' style='background-color: #2563EB; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>Reset My Password</a>
                </div>
                <p style='color: #6B7280; font-size: 13px;'>Or paste this token directly into your verification window:<br/><strong>{resetToken}</strong></p>
                <p style='color: #6B7280; font-size: 13px;'>If you did not initiate this request, please safely ignore this communication.</p>";

            var log = new SentEmailLogDto
            {
                RecipientEmail = request.Email,
                Subject = subject,
                BodyPreview = $"Password reset link created for {request.Email}. Token: {resetToken}",
                FullBody = WrapInHtmlTemplate("Password Reset", bodyContent),
                Category = "PasswordReset",
                Timestamp = DateTime.UtcNow,
                Status = "Delivered"
            };

            _emailLogSingleton.LogEmail(log);
            _logger.LogInformation("Password reset token generated and email dispatched to: {Email}", request.Email);

            await SendRealSmtpEmailAsync(log);

            return new ForgotPasswordResponseDto
            {
                Success = true,
                Message = "Password reset instructions have been dispatched to your email address.",
                ResetToken = resetToken
            };
        }

        public async Task<SentEmailLogDto> SendPaymentReceiptAsync(int appointmentId, decimal amount, string paymentMethod, string recipientEmail, string patientName, string doctorName, string receiptReference)
        {
            string subject = $"MediBridge Payment Receipt - Appointment #{appointmentId}";
            string bodyContent = $@"
                <h2 style='color: #10B981; margin-bottom: 5px;'>Payment Confirmed!</h2>
                <p>Thank you, <strong>{patientName}</strong>. Your healthcare payment has been processed securely.</p>
                <table style='width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;'>
                    <tr style='background-color: #F3F4F6;'><td style='padding: 10px; font-weight: bold;'>Receipt Ref:</td><td style='padding: 10px;'>{receiptReference}</td></tr>
                    <tr><td style='padding: 10px; font-weight: bold; border-bottom: 1px solid #E5E7EB;'>Appointment ID:</td><td style='padding: 10px; border-bottom: 1px solid #E5E7EB;'>#{appointmentId}</td></tr>
                    <tr><td style='padding: 10px; font-weight: bold; border-bottom: 1px solid #E5E7EB;'>Specialist / Doctor:</td><td style='padding: 10px; border-bottom: 1px solid #E5E7EB;'>{doctorName}</td></tr>
                    <tr><td style='padding: 10px; font-weight: bold; border-bottom: 1px solid #E5E7EB;'>Payment Method:</td><td style='padding: 10px; border-bottom: 1px solid #E5E7EB;'>{paymentMethod.ToUpper()}</td></tr>
                    <tr style='background-color: #ECFDF5;'><td style='padding: 10px; font-weight: bold; color: #065F46;'>Total Paid:</td><td style='padding: 10px; font-weight: bold; color: #065F46; font-size: 16px;'>${amount:0.00}</td></tr>
                </table>
                <p>Your booking status is confirmed. We look forward to supporting your care.</p>";

            var log = new SentEmailLogDto
            {
                RecipientEmail = recipientEmail,
                Subject = subject,
                BodyPreview = $"Receipt {receiptReference} ($ {amount:0.00} via {paymentMethod}) for Appt #{appointmentId}",
                FullBody = WrapInHtmlTemplate("Payment Confirmed", bodyContent),
                Category = "Receipt",
                Timestamp = DateTime.UtcNow,
                Status = "Delivered"
            };

            _emailLogSingleton.LogEmail(log);
            await SendRealSmtpEmailAsync(log);

            return log;
        }

        public IEnumerable<SentEmailLogDto> GetSentLogs(int count = 50) => _emailLogSingleton.GetRecentLogs(count);
        public IEnumerable<SentEmailLogDto> GetLogsByEmail(string email) => _emailLogSingleton.GetLogsByEmail(email);

        private async Task SendRealSmtpEmailAsync(SentEmailLogDto log)
        {
            try
            {
                var smtpHost = _config["EmailSettings:SmtpHost"] ?? "smtp.gmail.com";
                int smtpPort = int.TryParse(_config["EmailSettings:SmtpPort"], out int p) ? p : 587;
                bool enableSsl = bool.TryParse(_config["EmailSettings:EnableSsl"], out bool s) ? s : true;
                string senderEmail = _config["EmailSettings:SenderEmail"] ?? "";
                string senderName = _config["EmailSettings:SenderName"] ?? "MediBridge Hospital Management";
                string senderPassword = _config["EmailSettings:SenderPassword"] ?? "";

                // If real credentials aren't configured yet, skip SMTP delivery safely
                if (string.IsNullOrWhiteSpace(senderEmail) || senderEmail.Contains("YOUR_GMAIL") || string.IsNullOrWhiteSpace(senderPassword) || senderPassword.Contains("YOUR_16_DIGIT"))
                {
                    _logger.LogWarning("Notice: Real SMTP credentials are not yet set in appsettings.json. Email logged to memory, but real internet delivery skipped.");
                    log.Status = "Logged in memory (SMTP credentials missing in appsettings.json)";
                    return;
                }

                using (var client = new SmtpClient(smtpHost, smtpPort))
                {
                    // Critical .NET bugfix: UseDefaultCredentials MUST be set to false BEFORE setting custom NetworkCredential
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential(senderEmail.Trim(), senderPassword.Trim());
                    client.EnableSsl = enableSsl;
                    client.DeliveryMethod = SmtpDeliveryMethod.Network;
                    client.Timeout = 15000;

                    using (var mailMessage = new MailMessage())
                    {
                        mailMessage.From = new MailAddress(senderEmail.Trim(), senderName);
                        mailMessage.To.Add(new MailAddress(log.RecipientEmail));
                        mailMessage.Subject = log.Subject;
                        mailMessage.Body = log.FullBody;
                        mailMessage.IsBodyHtml = true;

                        await client.SendMailAsync(mailMessage);
                        _logger.LogInformation("Successfully dispatched REAL SMTP email across internet to {Recipient}", log.RecipientEmail);
                        log.Status = "Delivered to REAL email inbox via Gmail SMTP";
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to deliver real SMTP email to {Recipient}. Diagnostic error: {Msg}", log.RecipientEmail, ex.Message);
                log.Status = $"SMTP Delivery Failed: {ex.InnerException?.Message ?? ex.Message}";
            }
        }

        private static string WrapInHtmlTemplate(string title, string innerHtml)
        {
            return $@"<!DOCTYPE html>
<html>
<head><meta charset='utf-8'><title>{title}</title></head>
<body style='font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 30px;'>
    <div style='max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #E2E8F0;'>
        <div style='background: linear-gradient(to right, #1E3A8A, #2563EB); padding: 20px 30px; color: #FFFFFF;'>
            <h1 style='margin: 0; font-size: 22px; font-weight: bold;'>MediBridge</h1>
            <p style='margin: 4px 0 0; font-size: 13px; opacity: 0.9;'>Advanced Digital Healthcare Platform</p>
        </div>
        <div style='padding: 30px; color: #1E293B; line-height: 1.6;'>
            {innerHtml}
        </div>
        <div style='background-color: #F1F5F9; padding: 15px 30px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0;'>
            &copy; {DateTime.UtcNow.Year} MediBridge Platform. All rights reserved.<br/>
            This is an automated operational notice generated by the MediBridge .NET Microservice.
        </div>
    </div>
</body>
</html>";
        }
    }
}
