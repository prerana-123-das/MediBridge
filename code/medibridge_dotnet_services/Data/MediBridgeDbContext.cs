using Microsoft.EntityFrameworkCore;
using MediBridge.Services.EmailPayment.Entities;

namespace MediBridge.Services.EmailPayment.Data
{
    /// <summary>
    /// Entity Framework Core DbContext implementing Code-First schema configuration.
    /// Manages the MySQL database connection and entities for Payment Transactions.
    /// </summary>
    public class MediBridgeDbContext : DbContext
    {
        public MediBridgeDbContext(DbContextOptions<MediBridgeDbContext> options) : base(options)
        {
        }

        public DbSet<PaymentTransaction> PaymentTransactions { get; set; }
        public DbSet<AppointmentCache> AppointmentCaches { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PaymentTransaction>(entity =>
            {
                entity.HasKey(e => e.TransactionId);

                entity.Property(e => e.TransactionId)
                      .HasColumnName("transaction_id")
                      .ValueGeneratedOnAdd();

                entity.Property(e => e.AppointmentId)
                      .HasColumnName("appointment_id")
                      .IsRequired();

                entity.Property(e => e.Amount)
                      .HasColumnName("amount")
                      .HasColumnType("decimal(10, 2)")
                      .IsRequired();

                entity.Property(e => e.PaymentMethod)
                      .HasColumnName("payment_method")
                      .HasColumnType("varchar(50)")
                      .IsRequired();

                entity.Property(e => e.TransactionStatus)
                      .HasColumnName("transaction_status")
                      .HasColumnType("varchar(30)")
                      .HasDefaultValue("Paid");

                entity.Property(e => e.ProcessedAt)
                      .HasColumnName("processed_at")
                      .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            });

            modelBuilder.Entity<AppointmentCache>(entity =>
            {
                entity.HasKey(e => e.AppointmentId);
                entity.ToTable("appointment_cache");

                entity.Property(e => e.AppointmentId)
                      .HasColumnName("appointment_id")
                      .ValueGeneratedNever();

                entity.Property(e => e.PatientName)
                      .HasColumnName("patient_name")
                      .HasColumnType("varchar(150)")
                      .IsRequired();

                entity.Property(e => e.DoctorName)
                      .HasColumnName("doctor_name")
                      .HasColumnType("varchar(150)")
                      .IsRequired();

                entity.Property(e => e.Status)
                      .HasColumnName("status")
                      .HasColumnType("varchar(50)");

                entity.Property(e => e.LastUpdated)
                      .HasColumnName("last_updated")
                      .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            });
        }
    }
}
