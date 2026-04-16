import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Student, Profile } from '../types';
import { 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Filter
} from 'lucide-react';

interface StudentDataProps {
  profile: Profile | null;
}

export default function StudentDataPage({ profile }: StudentDataProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ nisn: '', name: '', class: '' });
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [classes, setClasses] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('students').select('*').order('name');
      if (data) {
        setStudents(data);
        const uniqueClasses = Array.from(new Set(data.map(s => s.class)));
        setClasses(['Semua', ...uniqueClasses]);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      if (editingStudent) {
        const { error } = await supabase
          .from('students')
          .update(formData)
          .eq('id', editingStudent.id);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Data siswa berhasil diperbarui!' });
      } else {
        const { error } = await supabase
          .from('students')
          .insert(formData);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Siswa baru berhasil ditambahkan!' });
      }
      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({ nisn: '', name: '', class: '' });
      fetchStudents();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) return;
    
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Data siswa berhasil dihapus!' });
      fetchStudents();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menghapus data.' });
    }
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({ nisn: student.nisn, name: student.name, class: student.class });
    setIsModalOpen(true);
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
          <h1 className="text-5xl font-display font-black text-slate-900 tracking-tight">Data Siswa</h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2 uppercase tracking-widest text-[10px] font-black">
            <Users size={14} className="text-sky-500" />
            Manajemen Data Induk Siswa
          </p>
        </div>
        <button
          onClick={() => {
            setEditingStudent(null);
            setFormData({ nisn: '', name: '', class: '' });
            setIsModalOpen(true);
          }}
          className="bg-brand-primary text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/10 active:scale-95 group"
        >
          <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
          Tambah Siswa
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

      {/* Student Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Siswa</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">NISN</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kelas</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-sky-500" size={48} />
                    <p className="mt-6 text-slate-400 font-black uppercase tracking-widest text-xs">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center">
                    <Users className="mx-auto text-slate-100 mb-6" size={64} />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Tidak ada data siswa.</p>
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
                        <p className="font-black text-slate-900 text-lg tracking-tight group-hover:text-sky-600 transition-colors">{student.name}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8 font-mono text-sm font-bold text-slate-400 group-hover:text-slate-600 transition-colors">{student.nisn}</td>
                    <td className="px-10 py-8">
                      <span className="bg-sky-50 text-sky-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-sky-100/50">
                        {student.class}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button 
                          onClick={() => openEdit(student)}
                          className="p-3 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-2xl transition-all"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-slate-900 shadow-sm"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">NISN Siswa</label>
                <input
                  type="text"
                  required
                  value={formData.nisn}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-sm"
                  placeholder="Masukkan 10 digit NISN"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-sm"
                  placeholder="Masukkan nama lengkap siswa"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kelas</label>
                <input
                  type="text"
                  required
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-sm"
                  placeholder="Contoh: X-A, XI-IPA-1"
                />
              </div>
              <div className="pt-6 flex gap-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-5 bg-brand-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/10 flex items-center justify-center gap-3 disabled:opacity-70 active:scale-95"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
