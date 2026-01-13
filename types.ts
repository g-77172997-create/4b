
export type Gender = 'L' | 'P';
export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface Student {
  id: number;
  name: string;
  gender: Gender;
}

export interface AttendanceRecord {
  studentId: number;
  status: AttendanceStatus;
  reason?: string;
}

export interface DailyAttendance {
  date: string; // ISO format date YYYY-MM-DD
  records: AttendanceRecord[];
  submittedAt?: string;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: string;
}
