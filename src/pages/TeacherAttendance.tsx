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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Absensi Mandiri Guru</h1>
        <p className="text-slate-500 font-medium">
          Silakan lakukan absensi kehadiran Anda untuk hari ini, {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}
        </p>
      </div>

      {attendance ? (
        <div className="bg-white rounded-[40px] p-12 border border-emerald-100 shadow-2xl shadow-emerald-100 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 blur-2xl" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Absensi Berhasil!</h2>
            <p className="text-slate-500 font-medium mb-8">
              Terima kasih, Anda telah tercatat hadir pada pukul <b>{format(new Date(attendance.timestamp), 'HH:mm')} WIB</b>.
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-bold uppercase tracking-wider text-sm">
              <CalendarCheck size={18} />
              Status: {attendance.status}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Attendance Form */}
          <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-8">Pilih Status Kehadiran</h3>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={() => handleAttendance('hadir')}
                disabled={loading}
                className="w-full group bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-3xl font-bold text-xl flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-100 disabled:opacity-70"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <span>Hadir Sekarang</span>
                </div>
                {loading ? <Loader2 className="animate-spin" /> : <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">→</div>}
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAttendance('izin')}
                  disabled={loading}
                  className="bg-slate-100 text-slate-700 p-6 rounded-3xl font-bold hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-70"
                >
                  Izin
                </button>
                <button
                  onClick={() => handleAttendance('sakit')}
                  disabled={loading}
                  className="bg-slate-100 text-slate-700 p-6 rounded-3xl font-bold hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-70"
                >
                  Sakit
                </button>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-[40px] p-10 text-white shadow-2xl shadow-blue-200">
            <h3 className="text-2xl font-black mb-6">Informasi Penting</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-sky-300" />
                </div>
                <div>
                  <p className="font-bold text-lg">Batas Waktu</p>
                  <p className="text-blue-100 text-sm">Absensi kehadiran dibuka mulai pukul 06:00 hingga 08:00 WIB.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-sky-300" />
                </div>
                <div>
                  <p className="font-bold text-lg">Lokasi Sekolah</p>
                  <p className="text-blue-100 text-sm">Pastikan Anda berada di lingkungan sekolah saat melakukan absensi.</p>
                </div>
              </div>
            </div>
            <div className="mt-10 p-6 bg-white/10 rounded-3xl border border-white/10">
              <p className="text-xs font-bold text-sky-300 uppercase tracking-widest mb-2">Catatan</p>
              <p className="text-sm text-blue-500 italic">"Kedisiplinan adalah kunci kesuksesan dalam mendidik generasi bangsa."</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
