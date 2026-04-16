import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Activity,
  CalendarDays,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile, TeacherAttendance } from '../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  profile: Profile | null;
}

export default function Dashboard({ profile }: DashboardProps) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    todayAttendance: 0,
    attendanceRate: 0
  });
  const [teacherAttendance, setTeacherAttendance] = useState<TeacherAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStats() {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const [
          { count: studentCount },
          { count: teacherCount },
          { count: attendanceCount },
          { data: teacherAtt }
        ] = await Promise.all([
          supabase.from('students').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('student_attendance')
            .select('*', { count: 'exact', head: true })
            .eq('date', today)
            .eq('status', 'hadir'),
          supabase.from('teacher_attendance')
            .select('*')
            .eq('teacher_id', profile?.id)
            .eq('date', today)
            .maybeSingle()
        ]);

        const rate = studentCount ? ((attendanceCount || 0) / studentCount) * 100 : 0;

        setStats({
          totalStudents: studentCount || 0,
          totalTeachers: teacherCount || 0,
          todayAttendance: attendanceCount || 0,
          attendanceRate: Math.round(rate)
        });

        if (teacherAtt) setTeacherAttendance(teacherAtt);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    }

    if (profile) fetchStats();
  }, [profile]);

  const handleTeacherAttendance = async (status: 'hadir' | 'izin' | 'sakit') => {
    if (!profile) return;
    setAttendanceLoading(true);

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('teacher_attendance')
        .insert({
          teacher_id: profile.id,
          date: today,
          status: status,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          alert('Anda sudah melakukan absensi hari ini.');
        } else {
          throw error;
        }
      }

      if (data) setTeacherAttendance(data);
    } catch (err: any) {
      console.error('Error marking attendance:', err);
      alert(err.message || 'Gagal melakukan absensi.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const cards = [
    { 
      title: 'Total Siswa', 
      value: stats.totalStudents, 
      icon: Users, 
      color: 'text-blue-600 bg-blue-50',
      trend: '+2.5%',
      trendUp: true
    },
    { 
      title: 'Total Guru', 
      value: stats.totalTeachers, 
      icon: UserCheck, 
      color: 'text-sky-600 bg-sky-50',
      trend: '+1.2%',
      trendUp: true
    },
    { 
      title: 'Hadir Hari Ini', 
      value: stats.todayAttendance, 
      icon: Calendar, 
      color: 'text-emerald-600 bg-emerald-50',
      trend: '-0.5%',
      trendUp: false
    },
    { 
      title: 'Tingkat Kehadiran', 
      value: `${stats.attendanceRate}%`, 
      icon: TrendingUp, 
      color: 'text-amber-600 bg-amber-50',
      trend: '+4.3%',
      trendUp: true
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-display font-black text-slate-900 leading-tight">Overview Dashboard</h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2 uppercase tracking-widest text-[10px] font-black">
            <CalendarDays size={14} className="text-sky-500" />
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
            <Clock size={22} />
          </div>
          <div className="pr-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Server Time</p>
            <p className="text-lg font-display font-bold text-slate-900">{format(new Date(), 'HH:mm')} WIB</p>
          </div>
        </div>
      </div>

      {/* Stats Grid - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group">
            <div className="flex items-start justify-between mb-8">
              <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                <card.icon size={28} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${card.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {card.trend}
                {card.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              </div>
            </div>
            <p className="text-slate-400 font-black text-[10px] mb-2 uppercase tracking-[0.2em]">{card.title}</p>
            <h3 className="text-4xl font-display font-black text-slate-900">{loading ? '...' : card.value}</h3>
          </div>
        ))}
      </div>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Teacher Quick Attendance */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-display font-black text-slate-900">Presensi Mandiri</h3>
            <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Guru</span>
          </div>
          
          {teacherAttendance ? (
            <div className="flex items-center gap-6 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Sudah Absen</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">
                  Pukul {format(new Date(teacherAttendance.timestamp), 'HH:mm')} WIB • {teacherAttendance.status}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => handleTeacherAttendance('hadir')}
                disabled={attendanceLoading}
                className="w-full bg-blue-900 text-white p-6 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-800 transition-all active:scale-95 disabled:opacity-70"
              >
                {attendanceLoading ? <Loader2 className="animate-spin" size={20} /> : <UserCheck size={20} />}
                Hadir Sekarang
              </button>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleTeacherAttendance('izin')}
                  disabled={attendanceLoading}
                  className="bg-slate-50 text-slate-600 p-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-70"
                >
                  Izin
                </button>
                <button
                  onClick={() => handleTeacherAttendance('sakit')}
                  disabled={attendanceLoading}
                  className="bg-slate-50 text-slate-600 p-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-70"
                >
                  Sakit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Student Quick Access */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-display font-black text-slate-900">Absensi Siswa</h3>
              <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Cepat</span>
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
              Mulai mengabsen siswa di kelas Anda hari ini. Pastikan semua data terisi dengan benar.
            </p>
          </div>
          <button
            onClick={() => navigate('/app/absensi-siswa')}
            className="w-full bg-sky-500 text-white p-6 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-sky-600 transition-all active:scale-95 shadow-lg shadow-sky-500/20"
          >
            <Users size={20} />
            Buka Absensi Siswa
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Feature Card */}
        <div className="lg:col-span-8 bg-brand-primary rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20 group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-sky-500/20 transition-all duration-1000" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-white/10">
              <Activity size={14} className="text-sky-400" />
              <span>Sistem Aktif</span>
            </div>
            <h2 className="text-5xl font-display font-black mb-6 leading-tight">Selamat Datang, <br /> <span className="text-sky-400">{profile?.full_name}!</span></h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-xl mb-12 font-medium">
              Dashboard <b>HadirKu</b> memberikan Anda kendali penuh atas data kehadiran sekolah. Pantau setiap pergerakan secara real-time.
            </p>
            <div className="flex flex-wrap gap-6">
              <button className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-sm hover:bg-sky-50 transition-all active:scale-95 flex items-center gap-2 group">
                Lihat Panduan
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white/5 backdrop-blur-md text-white border border-white/10 px-10 py-4 rounded-2xl font-black text-sm hover:bg-white/10 transition-all active:scale-95">
                Log Aktivitas
              </button>
            </div>
          </div>
        </div>

        {/* Side Activity Card */}
        <div className="lg:col-span-4 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-display font-black text-slate-900">Aktivitas</h3>
            <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Terbaru</span>
          </div>
          
          <div className="space-y-8 flex-1">
            {[
              { title: 'Absensi X-A', time: '15m ago', type: 'Siswa' },
              { title: 'Input Data Baru', time: '1h ago', type: 'Admin' },
              { title: 'Rekap Mingguan', time: '3h ago', type: 'System' }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-5 items-start group cursor-pointer">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-500 transition-all duration-300">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 group-hover:text-sky-600 transition-colors">{item.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{item.time} • {item.type}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-10 py-5 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:border-sky-400 hover:text-sky-500 transition-all duration-300">
            Lihat Semua Aktivitas
          </button>
        </div>
      </div>
    </div>
  );
}
