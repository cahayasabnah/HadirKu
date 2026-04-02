import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Student, Profile, StudentAttendance } from '../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Loader2,
  Save
} from 'lucide-react';

interface StudentAttendanceProps {
  profile: Profile | null;
}

export default function StudentAttendancePage({ profile }: StudentAttendanceProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<Record<string, 'hadir' | 'izin' | 'sakit' | 'alfa'>>({});
  const [existingAttendances, setExistingAttendances] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [classes, setClasses] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const [studentsRes, attendancesRes] = await Promise.all([
        supabase.from('students').select('*').order('name'),
        supabase.from('student_attendance').select('*').eq('date', today)
      ]);

      if (studentsRes.data) {
        setStudents(studentsRes.data);
        const uniqueClasses = Array.from(new Set(studentsRes.data.map(s => s.class)));
        setClasses(['Semua', ...uniqueClasses]);
      }

      if (attendancesRes.data) {
        const attMap: Record<string, any> = {};
        const existingMap: Record<string, string> = {};
        attendancesRes.data.forEach((att: any) => {
          attMap[att.student_id] = att.status;
          existingMap[att.student_id] = att.id;
        });
        setAttendances(attMap);
        setExistingAttendances(existingMap);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = (studentId: string, status: 'hadir' | 'izin' | 'sakit' | 'alfa') => {
    setAttendances(prev => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage(null);

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const attendanceData = Object.entries(attendances).map(([studentId, status]) => ({
        student_id: studentId,
        teacher_id: profile.id,
        date: today,
        status: status,
      }));

      // Filter out those that already exist to avoid unique constraint errors
      // In a real app, we might want to update existing ones too
      const newAttendances = attendanceData.filter(att => !existingAttendances[att.student_id]);

      if (newAttendances.length > 0) {
        const { error } = await supabase.from('student_attendance').insert(newAttendances);
        if (error) throw error;
      }

      // Update existing ones (optional but good for UX)
      for (const att of attendanceData) {
        if (existingAttendances[att.student_id]) {
          await supabase
            .from('student_attendance')
            .update({ status: att.status })
            .eq('id', existingAttendances[att.student_id]);
        }
      }

      setMessage({ type: 'success', text: 'Absensi siswa berhasil disimpan!' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan absensi.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.nisn.includes(search);
    const matchesClass = selectedClass === 'Semua' || s.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Absensi Siswa</h1>
          <p className="text-slate-500 font-medium mt-1">
            Lakukan absensi untuk siswa hari ini, {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}
          </p>
        </div>
        <button
          onClick={saveAttendance}
          disabled={saving || Object.keys(attendances).length === 0}
          className="bg-blue-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 active:scale-95"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Simpan Absensi
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold animate-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <p>{message.text}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Cari nama atau NISN siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
          />
        </div>
        <div className="w-full md:w-64 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
            <Filter size={18} />
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium appearance-none"
          >
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Siswa</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={2} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-900" size={32} />
                    <p className="mt-4 text-slate-500 font-bold">Memuat data siswa...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-8 py-20 text-center">
                    <Users className="mx-auto text-slate-200 mb-4" size={48} />
                    <p className="text-slate-500 font-bold">Tidak ada siswa ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{student.name}</p>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            NISN: {student.nisn} • Kelas: {student.class}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        {[
                          { id: 'hadir', label: 'Hadir', color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' },
                          { id: 'izin', label: 'Izin', color: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100' },
                          { id: 'sakit', label: 'Sakit', color: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' },
                          { id: 'alfa', label: 'Alfa', color: 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' }
                        ].map((status) => (
                          <button
                            key={status.id}
                            onClick={() => handleStatusChange(student.id, status.id as any)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                              attendances[student.id] === status.id 
                                ? status.color.replace('bg-', 'bg-').replace('hover:', '') + ' ring-2 ring-offset-2 ring-slate-100 scale-105'
                                : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                            }`}
                          >
                            {status.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
