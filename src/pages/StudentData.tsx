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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Data Siswa</h1>
          <p className="text-slate-500 font-medium mt-1">
            Kelola data induk siswa untuk keperluan absensi harian.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingStudent(null);
            setFormData({ nisn: '', name: '', class: '' });
            setIsModalOpen(true);
          }}
          className="bg-blue-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          <UserPlus size={20} />
          Tambah Siswa
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold animate-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <p>{message.text}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Cari nama atau NISN siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
          />
        </div>
        <div className="w-full md:w-64 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
            <Filter size={18} />
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium appearance-none"
          >
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Siswa</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">NISN</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Kelas</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-900" size={32} />
                    <p className="mt-4 text-slate-500 font-bold">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Users className="mx-auto text-slate-200 mb-4" size={48} />
                    <p className="text-slate-500 font-bold">Tidak ada data siswa.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black">
                          {student.name.charAt(0)}
                        </div>
                        <p className="font-black text-slate-900">{student.name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-mono text-sm text-slate-500">{student.nisn}</td>
                    <td className="px-8 py-6">
                      <span className="bg-sky-50 text-sky-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                        {student.class}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEdit(student)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">NISN Siswa</label>
                <input
                  type="text"
                  required
                  value={formData.nisn}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                  placeholder="Masukkan 10 digit NISN"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                  placeholder="Masukkan nama lengkap siswa"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Kelas</label>
                <input
                  type="text"
                  required
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                  placeholder="Contoh: X-A, XI-IPA-1"
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-4 bg-blue-900 text-white rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
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
