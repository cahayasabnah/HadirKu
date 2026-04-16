import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Camera
} from 'lucide-react';

interface ProfilePageProps {
  profile: Profile | null;
}

export default function ProfilePage({ profile }: ProfilePageProps) {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', profile.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memperbarui profil.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Profil Saya</h1>
        <p className="text-slate-500 font-medium mt-1">Kelola informasi akun dan preferensi Anda.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold animate-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <p>{message.text}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left - Avatar & Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-sky-400" />
            <div className="relative z-10">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-white rounded-3xl p-1 shadow-xl">
                  <div className="w-full h-full bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black">
                    {profile?.full_name.charAt(0)}
                  </div>
                </div>
                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-slate-600 rounded-xl shadow-lg flex items-center justify-center hover:text-blue-600 transition-colors border border-slate-100">
                  <Camera size={18} />
                </button>
              </div>
              <h3 className="text-xl font-black text-slate-900">{profile?.full_name}</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{profile?.role}</p>
            </div>
          </div>

          <div className="bg-blue-900 rounded-[32px] p-6 text-white shadow-xl shadow-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-sky-300" />
              <p className="font-bold">Status Akun</p>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              Akun Anda telah terverifikasi sebagai <b>{profile?.role}</b> di sistem HadirKu.
            </p>
          </div>
        </div>

        {/* Right - Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Nama Lengkap</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2 opacity-60">
                  <label className="text-sm font-bold text-slate-700 ml-1">Role / Jabatan</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Shield size={18} />
                    </div>
                    <input
                      type="text"
                      disabled
                      value={profile?.role.toUpperCase()}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-bold cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Tanggal Bergabung</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <input
                    type="text"
                    disabled
                    value={profile ? new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-blue-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
