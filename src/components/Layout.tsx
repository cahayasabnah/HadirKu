import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  FileText, 
  UserPlus, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  ChevronRight,
  School
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  profile: Profile | null;
}

export default function Layout({ children, profile }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRecapOpen, setIsRecapOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { name: 'Absensi Guru', path: '/app/absensi-guru', icon: UserCheck },
    { name: 'Absensi Siswa', path: '/app/absensi-siswa', icon: Users },
    { 
      name: 'Rekap Absensi', 
      path: '#', 
      icon: FileText,
      submenu: [
        ...(profile?.role === 'admin' ? [{ name: 'Rekap Guru', path: '/app/rekap/guru' }] : []),
        { name: 'Rekap Siswa', path: '/app/rekap/siswa' }
      ]
    },
    ...(profile?.role === 'admin' ? [{ name: 'Data Siswa', path: '/app/data-siswa', icon: UserPlus }] : [])
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-gradient-to-b from-blue-900 to-blue-700 text-white transition-all duration-300 ease-in-out fixed h-full z-50",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-blue-400/30">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <School className="w-8 h-8 text-sky-300" />
              <span>HadirKu</span>
            </div>
          ) : (
            <School className="w-10 h-10 text-sky-300 mx-auto" />
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-blue-600 rounded-lg transition-colors hidden md:block"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-6 px-2 space-y-1">
          {menuItems.map((item) => (
            <div key={item.name}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => setIsRecapOpen(!isRecapOpen)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                      location.pathname.startsWith('/app/rekap') ? "bg-sky-400/20 text-sky-300" : "hover:bg-blue-600/50"
                    )}
                  >
                    <item.icon size={22} className={cn(isSidebarOpen ? "" : "mx-auto")} />
                    {isSidebarOpen && (
                      <>
                        <span className="flex-1 text-left font-medium">{item.name}</span>
                        {isRecapOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </>
                    )}
                  </button>
                  {isRecapOpen && isSidebarOpen && (
                    <div className="ml-9 mt-1 space-y-1">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          className={cn(
                            "block px-4 py-2 text-sm rounded-lg transition-colors",
                            location.pathname === sub.path ? "text-sky-300 font-semibold" : "text-blue-100 hover:text-white hover:bg-blue-600/30"
                          )}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    location.pathname === item.path ? "bg-sky-400/20 text-sky-300 shadow-sm" : "hover:bg-blue-600/50"
                  )}
                >
                  <item.icon size={22} className={cn(isSidebarOpen ? "" : "mx-auto")} />
                  {isSidebarOpen && <span className="font-medium">{item.name}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "ml-64" : "ml-20"
      )}>
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Selamat datang,</span>
            <span className="text-blue-900 font-bold">{profile?.full_name || 'User'}</span>
            <span className="bg-sky-100 text-sky-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-2">
              {profile?.role}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-medium transition-colors group"
          >
            <span className="hidden sm:inline">Keluar</span>
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
