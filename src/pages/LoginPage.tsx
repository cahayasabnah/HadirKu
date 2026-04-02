import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  School, 
  Mail, 
  Lock, 
  Loader2, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (signUpError) throw signUpError;
        alert('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi atau langsung login jika auto-confirm aktif.');
        setIsSignUp(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        navigate('/app');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Left Side - Visual */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-sky-600 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 border-4 border-white rounded-full" />
          <div className="absolute bottom-20 right-20 w-96 h-96 border-8 border-white rounded-full" />
        </div>
        
        <Link to="/" className="flex items-center gap-2 font-bold text-2xl relative z-10 hover:text-sky-300 transition-colors">
          <School size={32} className="text-sky-400" />
          <span>HadirKu</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-5xl font-black mb-6 leading-tight">
            Satu Langkah Menuju <br />
            <span className="text-sky-300">Sekolah Digital.</span>
          </h2>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed">
            Kelola kehadiran guru dan siswa dengan dashboard yang intuitif dan data yang akurat.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-blue-200">
          <span>© 2026 HadirKu</span>
          <span className="w-1 h-1 bg-blue-400 rounded-full" />
          <span>Sistem Absensi Terpadu</span>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <Link to="/" className="md:hidden flex items-center gap-2 text-blue-900 font-bold text-xl mb-8">
              <School size={24} className="text-sky-500" />
              <span>HadirKu</span>
            </Link>
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              {isSignUp ? 'Buat Akun Baru' : 'Selamat Datang Kembali'}
            </h1>
            <p className="text-slate-500 font-medium">
              {isSignUp 
                ? 'Daftar sebagai guru untuk mulai mengelola absensi.' 
                : 'Masuk untuk mengakses dashboard absensi Anda.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm animate-shake">
              <AlertCircle size={18} className="shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nama Lengkap</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Sekolah</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                  placeholder="nama@sekolah.sch.id"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-slate-700">Kata Sandi</label>
                {!isSignUp && (
                  <a href="#" className="text-xs font-bold text-sky-600 hover:text-sky-700">Lupa sandi?</a>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                isSignUp ? 'Daftar Sekarang' : 'Masuk ke Dashboard'
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 font-medium">
              {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-sky-600 font-bold hover:text-sky-700 underline-offset-4 hover:underline"
              >
                {isSignUp ? 'Masuk di sini' : 'Daftar di sini'}
              </button>
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
