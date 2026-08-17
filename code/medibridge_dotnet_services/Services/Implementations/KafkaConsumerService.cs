using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Confluent.Kafka;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MediBridge.Services.EmailPayment.Data;
using MediBridge.Services.EmailPayment.Entities;

namespace MediBridge.Services.EmailPayment.Services.Implementations
{
    public class KafkaConsumerService : BackgroundService
    {
        private readonly ILogger<KafkaConsumerService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IConsumer<Ignore, string> _consumer;
        private const string Topic = "appointment-events";

        public KafkaConsumerService(ILogger<KafkaConsumerService> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
            
            var config = new ConsumerConfig
            {
                BootstrapServers = Environment.GetEnvironmentVariable("KAFKA_HOST") ?? "localhost" + ":9092",
                GroupId = "dotnet-payment-service-group",
                AutoOffsetReset = AutoOffsetReset.Earliest
            };

            _consumer = new ConsumerBuilder<Ignore, string>(config).Build();
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            return Task.Run(() => StartConsumerLoop(stoppingToken), stoppingToken);
        }

        private void StartConsumerLoop(CancellationToken cancellationToken)
        {
            _consumer.Subscribe(Topic);

            try
            {
                while (!cancellationToken.IsCancellationRequested)
                {
                    try
                    {
                        var cr = _consumer.Consume(cancellationToken);
                        _logger.LogInformation($"Consumed message '{cr.Message.Value}' at: '{cr.TopicPartitionOffset}'.");

                        ProcessMessage(cr.Message.Value);
                    }
                    catch (ConsumeException e)
                    {
                        _logger.LogError($"Consume error: {e.Error.Reason}");
                    }
                }
            }
            catch (OperationCanceledException)
            {
                _consumer.Close();
            }
        }

        private void ProcessMessage(string messageJson)
        {
            try
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var eventDto = JsonSerializer.Deserialize<AppointmentEventDto>(messageJson, options);

                if (eventDto != null)
                {
                    using var scope = _serviceProvider.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<MediBridgeDbContext>();

                    var cacheEntry = dbContext.AppointmentCaches.Find(eventDto.AppointmentId);
                    if (cacheEntry == null)
                    {
                        cacheEntry = new AppointmentCache
                        {
                            AppointmentId = eventDto.AppointmentId,
                            PatientName = eventDto.PatientName,
                            DoctorName = eventDto.DoctorName,
                            Status = eventDto.Status,
                            LastUpdated = DateTime.UtcNow
                        };
                        dbContext.AppointmentCaches.Add(cacheEntry);
                    }
                    else
                    {
                        cacheEntry.PatientName = eventDto.PatientName;
                        cacheEntry.DoctorName = eventDto.DoctorName;
                        cacheEntry.Status = eventDto.Status;
                        cacheEntry.LastUpdated = DateTime.UtcNow;
                    }

                    dbContext.SaveChanges();
                    _logger.LogInformation($"Updated AppointmentCache for ID: {eventDto.AppointmentId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process Kafka message.");
            }
        }

        public class AppointmentEventDto
        {
            public int AppointmentId { get; set; }
            public string PatientName { get; set; }
            public string DoctorName { get; set; }
            public string Status { get; set; }
        }
    }
}
