export type UserRole = 'admin' | 'guru';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  class: string;
  created_at: string;
}

export interface TeacherAttendance {
  id: string;
  teacher_id: string;
  date: string;
  status: 'hadir' | 'izin' | 'sakit' | 'terlambat';
  timestamp: string;
}

export interface StudentAttendance {
  id: string;
  student_id: string;
  teacher_id: string;
  date: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alfa';
  timestamp: string;
}
