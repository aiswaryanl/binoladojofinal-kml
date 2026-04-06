// src/api/attendanceApi.ts
import axios from 'axios';

export interface AttendanceLog {
  device_name: string; // New field from backend
  employee_code: string;
  datetime: string;
}

// Allow filtering by Device ID and Date
export const getAttendanceLogs = async (deviceId?: number, date?: string): Promise<AttendanceLog[]> => {
  let url = 'http://192.168.2.51:8000/api/attendance-logs/';

  const params = new URLSearchParams();
  if (deviceId) params.append('device_id', deviceId.toString());
  if (date) params.append('date', date);

  const res = await axios.get(`${url}?${params.toString()}`);
  return res.data.logs;
};

// //attendanceApi.ts
// import axios from 'axios';

// export interface AttendanceLog {
//   employee_code: string;
//   datetime: string;
// }

// export const getAttendanceLogs = async (): Promise<AttendanceLog[]> => {
//   // const res = await axios.get('http://192.168.2.51:8000/api/attendance-logs/');
//   const res = await axios.get('http://192.168.2.51:8000/api/attendance-logs/');
//   return res.data.logs; // This is an array of logs
// };

