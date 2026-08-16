using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MediBridge.Services.EmailPayment.DTOs;
using MediBridge.Services.EmailPayment.Services.Interfaces;

namespace MediBridge.Services.EmailPayment.Controllers
{
    [ApiController]
    [Route("api/v1/email")]
    [Produces("application/json")]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<EmailController> _logger;

        public EmailController(IEmailService emailService, ILogger<EmailController> logger)
        {
            _emailService = emailService;
            _logger = logger;
        }

        /// <summary>
        /// Sends a general customizable notification email.
        /// </summary>
        [HttpPost("send")]
        public async Task<IActionResult> SendGeneralEmail([FromBody] EmailRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _emailService.SendGeneralEmailAsync(request);
            return Ok(new { success = true, message = "Email dispatched successfully", data = result });
        }

        /// <summary>
        /// Sends a specialized onboarding welcome email when a Patient or Doctor registers.
        /// </summary>
        [HttpPost("welcome")]
        public async Task<IActionResult> SendWelcomeEmail([FromBody] WelcomeEmailDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _emailService.SendWelcomeEmailAsync(request);
            return Ok(new { success = true, message = $"Welcome email dispatched to {request.FullName}", data = result });
        }

        /// <summary>
        /// Initiates the password recovery workflow and dispatches reset instructions.
        /// </summary>
        [HttpPost("forgot-password")]
        public async Task<IActionResult> SendForgotPasswordEmail([FromBody] ForgotPasswordDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _emailService.SendForgotPasswordEmailAsync(request);
            return Ok(new { success = true, message = result.Message, token = result.ResetToken });
        }

        /// <summary>
        /// Dev Inspection Endpoint: Retrieve recently dispatched emails stored in the Singleton Notification Log.
        /// </summary>
        [HttpGet("logs")]
        public IActionResult GetSentLogs([FromQuery] int limit = 50, [FromQuery] string? email = null)
        {
            var logs = string.IsNullOrWhiteSpace(email) 
                ? _emailService.GetSentLogs(limit) 
                : _emailService.GetLogsByEmail(email);

            return Ok(new { success = true, count = ((System.Collections.ICollection)logs).Count, logs = logs });
        }
    }
}
