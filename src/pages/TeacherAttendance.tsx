import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, TeacherAttendance } from '../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertCircle, 
  Loader2,
  CalendarCheck
} from 'lucide-react';

interface TeacherAttendanceProps {
  profile: Profile | null;
}

export default function TeacherAttendancePage({ profile }: TeacherAttendanceProps) {
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState<TeacherAttendance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchTodayAttendance();
    }
  }, [profile]);

  async function fetchTodayAttendance() {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('teacher_attendance')
        .select('*')
        .eq('teacher_id', profile?.id)
        .eq('date', today)
        .single();

      if (data) setAttendance(data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  }

  const handleAttendance = async (status: 'hadir' | 'izin' | 'sakit') => {
    if (!profile) return;
    setLoading(true);
    setError(null);

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { error: insertError } = await supabase
        .from('teacher_attendance')
        .insert({
          teacher_id: profile.id,
          date: today,
          status: status,
        });

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('Anda sudah melakukan absensi hari ini.');
        }
        throw insertError;
      }

      setSuccess(true);
      fetchTodayAttendance();
    } catch (err: any) {
      setError(err.message || 'Gagal melakukan absensi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-display font-black text-slate-900 tracking-tight">Absensi Mandiri Guru</h1>
        <p className="text-slate-500 font-medium flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] font-black">
          <CalendarCheck size={14} className="text-sky-500" />
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}
        </p>
      </div>

      {attendance ? (
        <div className="bg-white rounded-[3rem] p-16 border border-emerald-100 shadow-2xl shadow-emerald-500/5 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-emerald-100 transition-all duration-1000" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-28 h-28 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner border border-emerald-100/50">
              <CheckCircle2 size={56} />
            </div>
            <h2 className="text-4xl font-display font-black text-slate-900 mb-4 tracking-tight">Absensi Berhasil!</h2>
            <p className="text-slate-500 font-medium mb-10 text-lg">
              Terima kasih, Anda telah tercatat hadir pada pukul <b className="text-emerald-600">{format(new Date(attendance.timestamp), 'HH:mm')} WIB</b>.
            </p>
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-emerald-600/20">
              <CalendarCheck size={18} />
              Status: {attendance.status}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-10">
          {/* Attendance Form */}
          <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-display font-black text-slate-900 mb-10">Pilih Status</h3>
            
            {error && (
              <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 text-sm font-bold">
                <AlertCircle size={20} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <button
                onClick={() => handleAttendance('hadir')}
                disabled={loading}
                className="w-full group bg-brand-primary text-white p-8 rounded-[2rem] font-black text-xl flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-slate-900/10 disabled:opacity-70"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                    <CheckCircle2 size={28} />
                  </div>
                  <span className="tracking-tight">Hadir Sekarang</span>
                </div>
                {loading ? <Loader2 className="animate-spin" /> : <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">→</div>}
              </button>

              <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={() => handleAttendance('izin')}
                  disabled={loading}
                  className="bg-slate-50 text-slate-600 p-8 rounded-[2rem] font-black text-sm uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-70"
                >
                  Izin
                </button>
                <button
                  onClick={() => handleAttendance('sakit')}
                  disabled={loading}
                  className="bg-slate-50 text-slate-600 p-8 rounded-[2rem] font-black text-sm uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-70"
                >
                  Sakit
                </button>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-brand-primary rounded-[3rem] p-12 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-sky-500/20 transition-all duration-1000" />
            <div className="relative z-10">
              <h3 className="text-2xl font-display font-black mb-10">Informasi Penting</h3>
              <div className="space-y-10">
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                    <Clock size={22} className="text-sky-400" />
                  </div>
                  <div>
                    <p className="font-black text-lg tracking-tight">Batas Waktu</p>
                    <p className="text-slate-400 text-sm mt-1 leading-relaxed font-medium">Absensi kehadiran dibuka mulai pukul 06:00 hingga 08:00 WIB.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                    <MapPin size={22} className="text-sky-400" />
                  </div>
                  <div>
                    <p className="font-black text-lg tracking-tight">Lokasi Sekolah</p>
                    <p className="text-slate-400 text-sm mt-1 leading-relaxed font-medium">Pastikan Anda berada di lingkungan sekolah saat melakukan absensi.</p>
                  </div>
                </div>
              </div>
              <div className="mt-12 p-8 bg-white/5 rounded-[2rem] border border-white/5">
                <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em] mb-3">Catatan</p>
                <p className="text-sm text-slate-300 italic font-medium leading-relaxed">"Kedisiplinan adalah kunci kesuksesan dalam mendidik generasi bangsa."</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
