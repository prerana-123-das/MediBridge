import axios from 'axios';
async function test() {
  const payload = {
    doctorId: '1',
    appointmentDate: '2026-08-11T10:00:00',
    reason: 'Consultation',
    description: 'Test',
    attachedFiles: []
  };
  const token = '';
  // I need a valid token to test this. Nevermind, I can check the logs of the Java backend to see what it sent!
}
