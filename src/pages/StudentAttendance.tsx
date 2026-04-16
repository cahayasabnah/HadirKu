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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-5xl font-display font-black text-slate-900 tracking-tight">Absensi Siswa</h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2 uppercase tracking-widest text-[10px] font-black">
            <Users size={14} className="text-sky-500" />
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}
          </p>
        </div>
        <button
          onClick={saveAttendance}
          disabled={saving || Object.keys(attendances).length === 0}
          className="bg-brand-primary text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/10 disabled:opacity-50 active:scale-95 group"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
          Simpan Absensi
        </button>
      </div>

      {message && (
        <div className={`p-6 rounded-[2rem] border flex items-center gap-4 text-sm font-black uppercase tracking-widest animate-in slide-in-from-top-4 duration-500 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p>{message.text}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Cari nama atau NISN siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-sm"
          />
        </div>
        <div className="w-full md:w-72 relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
            <Filter size={20} />
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-sm appearance-none cursor-pointer"
          >
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Siswa</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={2} className="px-10 py-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-sky-500" size={48} />
                    <p className="mt-6 text-slate-400 font-black uppercase tracking-widest text-xs">Memuat data siswa...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-10 py-32 text-center">
                    <Users className="mx-auto text-slate-100 mb-6" size={64} />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Tidak ada siswa ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-display font-black text-xl group-hover:bg-sky-50 group-hover:text-sky-500 transition-all duration-300">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg tracking-tight group-hover:text-sky-600 transition-colors">{student.name}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                            NISN: {student.nisn} • Kelas: {student.class}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-center gap-3">
                        {[
                          { id: 'hadir', label: 'Hadir', color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' },
                          { id: 'izin', label: 'Izin', color: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100' },
                          { id: 'sakit', label: 'Sakit', color: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' },
                          { id: 'alfa', label: 'Alfa', color: 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' }
                        ].map((status) => (
                          <button
                            key={status.id}
                            onClick={() => handleStatusChange(student.id, status.id as any)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                              attendances[student.id] === status.id 
                                ? status.color.replace('bg-', 'bg-').replace('hover:', '') + ' ring-4 ring-sky-500/5 scale-105 shadow-lg'
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
