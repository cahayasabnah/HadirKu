import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Profile } from './types';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TeacherAttendancePage from './pages/TeacherAttendance';
import StudentAttendancePage from './pages/StudentAttendance';
import RecapAttendancePage from './pages/RecapAttendance';
import StudentDataPage from './pages/StudentData';

// Components
import Layout from './components/Layout';

function ProtectedRoute({ children, profile, loading }: { children: React.ReactNode, profile: Profile | null, loading: boolean }) {
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!profile) return <Navigate to="/login" />;
  return <>{children}</>;
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={session ? <Navigate to="/app" /> : <LoginPage />} />
        
        {/* App Routes */}
        <Route path="/app" element={
          <ProtectedRoute profile={profile} loading={loading}>
            <Layout profile={profile}>
              <Dashboard profile={profile} />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/app/absensi-guru" element={
          <ProtectedRoute profile={profile} loading={loading}>
            <Layout profile={profile}>
              <TeacherAttendancePage profile={profile} />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/app/absensi-siswa" element={
          <ProtectedRoute profile={profile} loading={loading}>
            <Layout profile={profile}>
              <StudentAttendancePage profile={profile} />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/app/rekap/guru" element={
          <ProtectedRoute profile={profile} loading={loading}>
            <Layout profile={profile}>
              {profile?.role === 'admin' ? <RecapAttendancePage type="guru" profile={profile} /> : <Navigate to="/app" />}
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/app/rekap/siswa" element={
          <ProtectedRoute profile={profile} loading={loading}>
            <Layout profile={profile}>
              <RecapAttendancePage type="siswa" profile={profile} />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/app/data-siswa" element={
          <ProtectedRoute profile={profile} loading={loading}>
            <Layout profile={profile}>
              {profile?.role === 'admin' ? <StudentDataPage profile={profile} /> : <Navigate to="/app" />}
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
