import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, TeacherAttendance, StudentAttendance, Student } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  FileText, 
  Calendar, 
  Download, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';

interface RecapAttendanceProps {
  type: 'guru' | 'siswa';
  profile: Profile | null;
}

export default function RecapAttendancePage({ type, profile }: RecapAttendanceProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [type, currentDate]);

  async function fetchData() {
    setLoading(true);
    try {
      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');

      if (type === 'guru') {
        const { data: teachers } = await supabase.from('profiles').select('*').order('full_name');
        const { data: attendance } = await supabase
          .from('teacher_attendance')
          .select('*')
          .gte('date', start)
          .lte('date', end);

        if (teachers) {
          const recap = teachers.map(t => ({
            ...t,
            attendance: attendance?.filter(a => a.teacher_id === t.id) || []
          }));
          setData(recap);
        }
      } else {
        const { data: students } = await supabase.from('students').select('*').order('name');
        const { data: attendance } = await supabase
          .from('student_attendance')
          .select('*')
          .gte('date', start)
          .lte('date', end);

        if (students) {
          const uniqueClasses = Array.from(new Set(students.map(s => s.class)));
          setClasses(['Semua', ...uniqueClasses]);
          
          const recap = students.map(s => ({
            ...s,
            attendance: attendance?.filter(a => a.student_id === s.id) || []
          }));
          setData(recap);
        }
      }
    } catch (err) {
      console.error('Error fetching recap:', err);
    } finally {
      setLoading(false);
    }
  }

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const filteredData = data.filter(item => {
    const name = type === 'guru' ? item.full_name : item.name;
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesClass = type === 'guru' || selectedClass === 'Semua' || item.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hadir': return 'bg-emerald-500';
      case 'izin': return 'bg-blue-500';
      case 'sakit': return 'bg-amber-500';
      case 'alfa': return 'bg-red-500';
      case 'terlambat': return 'bg-orange-500';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-5xl font-display font-black text-slate-900 tracking-tight">Rekap Absensi {type === 'guru' ? 'Guru' : 'Siswa'}</h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2 uppercase tracking-widest text-[10px] font-black">
            <Calendar size={14} className="text-sky-500" />
            Laporan periode {format(currentDate, 'MMMM yyyy', { locale: id })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <button 
              onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
              className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-sky-500 active:scale-90"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 font-black text-slate-900 flex items-center gap-3 border-x border-slate-100">
              <Calendar size={18} className="text-sky-500" />
              <span className="text-sm uppercase tracking-widest">{format(currentDate, 'MMMM yyyy', { locale: id })}</span>
            </div>
            <button 
              onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
              className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-sky-500 active:scale-90"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <button className="bg-brand-primary text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/10 active:scale-95 group">
            <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
            <span className="hidden sm:inline">Ekspor PDF</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder={`Cari nama ${type === 'guru' ? 'guru' : 'siswa'}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-sm"
          />
        </div>
        {type === 'siswa' && (
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
        )}
      </div>

      {/* Recap Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sticky left-0 bg-slate-50 z-10 w-72">
                  {type === 'guru' ? 'Nama Guru' : 'Nama Siswa'}
                </th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                  Summary
                </th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <div className="flex gap-1.5 justify-center">
                    {daysInMonth.map(day => (
                      <div key={day.toString()} className="w-9 text-center text-[10px] font-black text-slate-300">
                        {format(day, 'dd')}
                      </div>
                    ))}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-10 py-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-sky-500" size={48} />
                    <p className="mt-6 text-slate-400 font-black uppercase tracking-widest text-xs">Menyusun laporan...</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-10 py-32 text-center">
                    <FileText className="mx-auto text-slate-100 mb-6" size={64} />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Tidak ada data untuk periode ini.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const name = type === 'guru' ? item.full_name : item.name;
                  const hadir = item.attendance.filter((a: any) => a.status === 'hadir').length;
                  const izin = item.attendance.filter((a: any) => a.status === 'izin').length;
                  const sakit = item.attendance.filter((a: any) => a.status === 'sakit').length;
                  const alfa = item.attendance.filter((a: any) => a.status === 'alfa' || a.status === 'terlambat').length;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                      <td className="px-10 py-8 sticky left-0 bg-white z-10 shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
                        <p className="font-black text-slate-900 text-lg tracking-tight group-hover:text-sky-600 transition-colors truncate">{name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                          {type === 'guru' ? item.role : `Kelas ${item.class}`}
                        </p>
                      </td>
                      <td className="px-6 py-8">
                        <div className="flex items-center justify-center gap-4">
                          <div className="flex flex-col items-center bg-emerald-50/50 px-3 py-2 rounded-xl border border-emerald-100/50">
                            <span className="text-[10px] font-black text-emerald-600 mb-1">H</span>
                            <span className="text-sm font-black text-slate-900">{hadir}</span>
                          </div>
                          <div className="flex flex-col items-center bg-blue-50/50 px-3 py-2 rounded-xl border border-blue-100/50">
                            <span className="text-[10px] font-black text-blue-600 mb-1">I</span>
                            <span className="text-sm font-black text-slate-900">{izin}</span>
                          </div>
                          <div className="flex flex-col items-center bg-amber-50/50 px-3 py-2 rounded-xl border border-amber-100/50">
                            <span className="text-[10px] font-black text-amber-600 mb-1">S</span>
                            <span className="text-sm font-black text-slate-900">{sakit}</span>
                          </div>
                          <div className="flex flex-col items-center bg-red-50/50 px-3 py-2 rounded-xl border border-red-100/50">
                            <span className="text-[10px] font-black text-red-600 mb-1">A</span>
                            <span className="text-sm font-black text-slate-900">{alfa}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-8">
                        <div className="flex gap-1.5 justify-center">
                          {daysInMonth.map(day => {
                            const att = item.attendance.find((a: any) => isSameDay(new Date(a.date), day));
                            return (
                              <div 
                                key={day.toString()} 
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                  att ? getStatusColor(att.status) : 'bg-slate-50 border border-slate-100/50'
                                }`}
                                title={att ? `${format(day, 'dd/MM')}: ${att.status}` : format(day, 'dd/MM')}
                              >
                                {att && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-full mb-2">Keterangan Status:</p>
        {[
          { label: 'Hadir', color: 'bg-emerald-500' },
          { label: 'Izin', color: 'bg-blue-500' },
          { label: 'Sakit', color: 'bg-amber-500' },
          { label: 'Alfa / Terlambat', color: 'bg-red-500' },
          { label: 'Belum Absen', color: 'bg-slate-50' }
        ].map(item => (
          <div key={item.label} className="flex items-center gap-3">
            <div className={`w-5 h-5 ${item.color} rounded-lg shadow-sm border border-black/5`} />
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
