import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: studentCount },
          { count: teacherCount },
          { count: attendanceCount }
        ] = await Promise.all([
          supabase.from('students').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('student_attendance')
            .select('*', { count: 'exact', head: true })
            .eq('date', format(new Date(), 'yyyy-MM-dd'))
            .eq('status', 'hadir')
        ]);

        const rate = studentCount ? ((attendanceCount || 0) / studentCount) * 100 : 0;

        setStats({
          totalStudents: studentCount || 0,
          totalTeachers: teacherCount || 0,
          todayAttendance: attendanceCount || 0,
          attendanceRate: Math.round(rate)
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const cards = [
    { 
      title: 'Total Siswa', 
      value: stats.totalStudents, 
      icon: Users, 
      color: 'bg-blue-500',
      trend: '+2.5%',
      trendUp: true
    },
    { 
      title: 'Total Guru', 
      value: stats.totalTeachers, 
      icon: UserCheck, 
      color: 'bg-sky-500',
      trend: '+1.2%',
      trendUp: true
    },
    { 
      title: 'Hadir Hari Ini', 
      value: stats.todayAttendance, 
      icon: Calendar, 
      color: 'bg-emerald-500',
      trend: '-0.5%',
      trendUp: false
    },
    { 
      title: 'Tingkat Kehadiran', 
      value: `${stats.attendanceRate}%`, 
      icon: TrendingUp, 
      color: 'bg-amber-500',
      trend: '+4.3%',
      trendUp: true
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Dashboard Utama</h1>
          <p className="text-slate-500 font-medium mt-1">
            Ringkasan data absensi sekolah untuk hari ini, {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <Clock size={20} />
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Waktu Sekarang</p>
            <p className="text-sm font-black text-slate-900">{format(new Date(), 'HH:mm')} WIB</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-100 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${card.color.split('-')[1]}-200 group-hover:scale-110 transition-transform`}>
                <card.icon size={28} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${card.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {card.trend}
                {card.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              </div>
            </div>
            <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-wider">{card.title}</p>
            <h3 className="text-3xl font-black text-slate-900">{loading ? '...' : card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Welcome Section */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-900 to-blue-700 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-4">Halo, {profile?.full_name}!</h2>
            <p className="text-blue-100 text-lg leading-relaxed max-w-xl mb-8">
              Selamat datang di sistem absensi digital <b>HadirKu</b>. Hari ini adalah kesempatan baru untuk mencatat kehadiran dengan akurat dan efisien.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-blue-900 px-8 py-3 rounded-2xl font-bold hover:bg-sky-50 transition-all active:scale-95 shadow-lg shadow-blue-950/20">
                Lihat Panduan
              </button>
              <button className="bg-blue-800/50 backdrop-blur-sm text-white border border-white/20 px-8 py-3 rounded-2xl font-bold hover:bg-blue-800/70 transition-all active:scale-95">
                Cek Notifikasi
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action / Info */}
        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6">Aktivitas Terakhir</h3>
          <div className="space-y-6">
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Absensi Siswa Kelas X-A</p>
                  <p className="text-xs text-slate-500 font-medium">15 menit yang lalu oleh Anda</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-sky-400 hover:text-sky-500 transition-all">
            Lihat Semua Aktivitas
          </button>
        </div>
      </div>
    </div>
  );
}
