const axios = require('axios');

const baseURL = 'http://localhost:8080/api/v1';

const endpoints = [
  // Patient
  { method: 'GET', url: '/patients/1' },
  { method: 'PUT', url: '/patients/1', data: {} },
  
  // Doctor
  { method: 'PUT', url: '/doctors/profile', data: {} },
  { method: 'PUT', url: '/doctors/availability', data: {} },
  { method: 'GET', url: '/doctors' },
  { method: 'GET', url: '/doctors/1' },
  { method: 'GET', url: '/doctors/1/slots' },
  { method: 'GET', url: '/doctors/1/availability' },
  { method: 'GET', url: '/doctors/specialties' },
  { method: 'GET', url: '/doctors/specializations' },
  
  // Appointment
  { method: 'POST', url: '/appointments', data: {} },
  { method: 'POST', url: '/appointments/1/rate', data: {} },
  { method: 'PATCH', url: '/appointments/1/status', data: {} },
  { method: 'PATCH', url: '/appointments/1/respond', data: {} },
  { method: 'PATCH', url: '/appointments/1/reschedule', data: {} },
  { method: 'PATCH', url: '/appointments/1/prescription', data: {} },
  { method: 'PATCH', url: '/appointments/1/patient-response', data: {} },
  { method: 'PATCH', url: '/appointments/1/patient-reschedule', data: {} },
  { method: 'PATCH', url: '/appointments/1/cancel', data: {} },
  { method: 'GET', url: '/appointments/patient' },
  { method: 'GET', url: '/appointments/doctor/dashboard' },
  
  // Records
  { method: 'GET', url: '/records/reports' },
  { method: 'POST', url: '/records/reports', data: {} },
  { method: 'POST', url: '/records/consultations', data: {} },
  { method: 'DELETE', url: '/records/reports/1' },
  
  // Admin
  { method: 'GET', url: '/admin/dashboard' },
  { method: 'GET', url: '/admin/analytics' },
  { method: 'GET', url: '/admin/settings' },
  { method: 'PUT', url: '/admin/settings', data: {} },
  { method: 'GET', url: '/admin/patients' },
  { method: 'PUT', url: '/admin/patients/1/status', data: {} },
  { method: 'GET', url: '/admin/doctors' },
  { method: 'PUT', url: '/admin/doctors/1/status', data: {} },
  { method: 'GET', url: '/admin/appointments' },
  { method: 'DELETE', url: '/admin/appointments/1' },
  { method: 'GET', url: '/admin/contact-messages' },
  { method: 'PATCH', url: '/admin/contact-messages/1/read' },
  
  // Auth & OAuth
  { method: 'GET', url: '/oauth2/authorize' },
  { method: 'GET', url: '/oauth2/callback' },
  { method: 'POST', url: '/auth/reset-password', data: {} },
  { method: 'POST', url: '/auth/register/patient', data: {} },
  { method: 'POST', url: '/auth/register/doctor', data: {} },
  { method: 'POST', url: '/auth/login', data: {} },
  { method: 'POST', url: '/auth/change-password', data: {} },
  
  // Public & Export
  { method: 'POST', url: '/public/contact', data: {} },
  { method: 'POST', url: '/ratings', data: {} },
  { method: 'GET', url: '/ratings/doctor/1' },
  { method: 'GET', url: '/export/prescription/1' },
  { method: 'GET', url: '/export/history/1' },
  { method: 'GET', url: '/test/meet' },
  
  // Email (.NET)
  { method: 'POST', url: '/email/send', data: {} },
  { method: 'POST', url: '/email/welcome', data: {} },
  { method: 'POST', url: '/email/forgot-password', data: {} },
  { method: 'GET', url: '/email/logs' },
  
  // Payments (.NET)
  { method: 'POST', url: '/payments/create-order', data: {} },
  { method: 'POST', url: '/payments/process', data: {} },
  { method: 'GET', url: '/payments/appointment/1' },
  { method: 'GET', url: '/payments/all' }
];

async function run() {
  console.log('Testing APIs...');
  for (const ep of endpoints) {
    try {
      const config = {
        method: ep.method,
        url: baseURL + ep.url,
        data: ep.data,
        validateStatus: () => true // Resolve all statuses to analyze them
      };
      
      const response = await axios(config);
      console.log(`[${response.status}] ${ep.method} ${ep.url}`);
      if (response.status === 404 || response.status >= 500) {
        console.log(`   -> FAILED: Code ${response.status}`);
      }
    } catch (e) {
      console.log(`[ERROR] ${ep.method} ${ep.url} - ${e.message}`);
    }
  }
}

run();
