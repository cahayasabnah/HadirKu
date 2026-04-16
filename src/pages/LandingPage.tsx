import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  School, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Smartphone
} from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-sky-200">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-2xl text-blue-900">
            <School className="w-10 h-10 text-sky-500" />
            <span>HadirKu</span>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-800 transition-all hover:shadow-lg hover:shadow-blue-200 active:scale-95 cursor-pointer"
          >
            Masuk ke Aplikasi
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-sky-100 text-sky-700 rounded-full text-sm font-bold uppercase tracking-wider mb-6">
              Revolusi Absensi Sekolah
            </span>
            <h1 className="text-6xl md:text-7xl font-black text-blue-950 leading-[1.1] mb-8">
              Absensi Digital <br />
              <span className="text-sky-500">Lebih Akurat,</span> <br />
              Lebih Cepat.
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-lg">
              <b>HadirKu</b> adalah platform manajemen kehadiran modern yang dirancang untuk menyederhanakan proses absensi guru dan siswa. Tinggalkan cara lama, beralih ke efisiensi digital.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="bg-sky-500 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-sky-600 transition-all flex items-center gap-2 group cursor-pointer"
              >
                Mulai Sekarang
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="#fitur" 
                className="bg-slate-100 text-slate-700 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all"
              >
                Pelajari Fitur
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-sky-200 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-pulse delay-700" />
            <div className="relative bg-gradient-to-br from-blue-900 to-blue-700 p-8 rounded-[40px] shadow-2xl border border-white/20">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl border border-white/10 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-sky-400 rounded-full flex items-center justify-center text-white font-bold">JD</div>
                    <div>
                      <p className="text-white font-bold">John Doe</p>
                      <p className="text-sky-200 text-xs uppercase font-bold">Guru Matematika</p>
                    </div>
                  </div>
                  <span className="bg-emerald-400 text-emerald-950 text-[10px] font-black px-2 py-1 rounded-full">HADIR</span>
                </div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-sky-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-sky-300 text-xs font-bold mb-1">TOTAL SISWA</p>
                  <p className="text-white text-3xl font-black">1,240</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-emerald-300 text-xs font-bold mb-1">KEHADIRAN</p>
                  <p className="text-white text-3xl font-black">98.2%</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-32 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-blue-950 mb-4">Mengapa Memilih HadirKu?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Kami menghadirkan solusi absensi yang tidak hanya mencatat kehadiran, tapi juga memberikan wawasan data untuk kemajuan institusi pendidikan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Zap, 
                title: 'Proses Instan', 
                desc: 'Lakukan absensi hanya dengan satu klik. Hemat waktu berharga guru untuk fokus mengajar.',
                color: 'bg-amber-100 text-amber-600'
              },
              { 
                icon: BarChart3, 
                title: 'Rekapitulasi Otomatis', 
                desc: 'Laporan harian, mingguan, hingga bulanan tersedia secara real-time tanpa perlu input manual.',
                color: 'bg-sky-100 text-sky-600'
              },
              { 
                icon: ShieldCheck, 
                title: 'Keamanan Data', 
                desc: 'Data tersimpan aman di cloud dengan enkripsi tingkat lanjut, menjamin integritas data sekolah.',
                color: 'bg-emerald-100 text-emerald-600'
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-100 transition-all"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-8`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-blue-950 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-blue-950 text-white px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2 font-bold text-2xl">
            <School className="w-10 h-10 text-sky-400" />
            <span>HadirKu</span>
          </div>
          <p className="text-blue-300 text-sm">
            © 2026 HadirKu Digital Attendance System. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-sky-400 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-sky-400 transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
