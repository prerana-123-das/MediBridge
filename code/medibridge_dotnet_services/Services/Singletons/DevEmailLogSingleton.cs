using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using MediBridge.Services.EmailPayment.DTOs;

namespace MediBridge.Services.EmailPayment.Services.Singletons
{
    /// <summary>
    /// Implementation of the SINGLETON DESIGN PATTERN.
    /// Acts as a central in-memory repository for sent notification logs and notification templates across the entire lifetime of the microservice application.
    /// Thread-safe for high-concurrency microservice environments.
    /// </summary>
    public class DevEmailLogSingleton
    {
        private readonly ConcurrentQueue<SentEmailLogDto> _emailLogs = new ConcurrentQueue<SentEmailLogDto>();
        private const int MaxLogSize = 500;

        public DevEmailLogSingleton()
        {
            // Initialize with an introductory system log
            LogEmail(new SentEmailLogDto
            {
                RecipientEmail = "admin@medibridge.org",
                Subject = "MediBridge .NET Microservice Initialized",
                BodyPreview = "Email and Payment service started successfully in local Dev Logging mode.",
                FullBody = "<h3>MediBridge Notification Engine Ready</h3><p>All transactional receipts and welcome notifications will be archived here for live inspection.</p>",
                Category = "System",
                Timestamp = DateTime.UtcNow,
                Status = "Initialized"
            });
        }

        public void LogEmail(SentEmailLogDto logEntry)
        {
            _emailLogs.Enqueue(logEntry);

            // Keep memory bounded
            while (_emailLogs.Count > MaxLogSize && _emailLogs.TryDequeue(out _))
            {
            }
        }

        public IEnumerable<SentEmailLogDto> GetRecentLogs(int count = 50)
        {
            return _emailLogs
                .OrderByDescending(l => l.Timestamp)
                .Take(count)
                .ToList();
        }

        public IEnumerable<SentEmailLogDto> GetLogsByEmail(string email)
        {
            return _emailLogs
                .Where(l => string.Equals(l.RecipientEmail, email, StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(l => l.Timestamp)
                .ToList();
        }

        public int GetTotalSentCount() => _emailLogs.Count;
    }
}
