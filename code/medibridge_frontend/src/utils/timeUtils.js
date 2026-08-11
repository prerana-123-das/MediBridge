import { useState, useEffect } from 'react';

export const isAppointmentTimeReady = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return false;
  
  const [year, month, day] = dateStr.split('-').map(Number);
  let hours, minutes;
  const match12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    hours = Number(match12[1]);
    minutes = Number(match12[2]);
    const ampm = match12[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
  } else {
    const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match24) return false;
    hours = Number(match24[1]);
    minutes = Number(match24[2]);
  }
  
  const apptDate = new Date(year, month - 1, day, hours, minutes);
  const now = new Date();
  
  // Meeting is active starting exactly at the scheduled time until 60 minutes after it starts.
  const apptStartTime = new Date(apptDate.getTime());
  const sixtyMinsAfter = new Date(apptDate.getTime() + 60 * 60 * 1000);
  
  return now >= apptStartTime && now <= sixtyMinsAfter;
};

// Hook to trigger a re-render every 30 seconds to evaluate time-based UI automatically
export const useTimeRefresh = (intervalMs = 30000) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);
};
