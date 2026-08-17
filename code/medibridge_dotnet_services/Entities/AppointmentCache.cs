using System;

namespace MediBridge.Services.EmailPayment.Entities
{
    public class AppointmentCache
    {
        public int AppointmentId { get; set; }
        public string PatientName { get; set; }
        public string DoctorName { get; set; }
        public string Status { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}
