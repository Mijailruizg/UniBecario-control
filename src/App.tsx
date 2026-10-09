import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/useAuthStore';
import { Login } from './pages/auth/Login';
import { RegisterRequest } from './pages/auth/RegisterRequest';
import { PendingApproval } from './pages/auth/PendingApproval';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Student pages
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentHistory } from './pages/student/History';
import { StudentProfile } from './pages/student/Profile';

// Admin pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminUsers } from './pages/admin/Users';
import { AdminScholarships } from './pages/admin/Scholarships';
import { AdminReports } from './pages/admin/Reports';

function App() {
  const { user, setUser, setSession, isLoading, setLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setUser]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('usuarios').select('*').eq('id', userId).single();
    if (data) {
      setUser(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterRequest />} />
        <Route path="/pending" element={<PendingApproval />} />

        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute allowedRoles={['becario']}><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="history" element={<StudentHistory />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="scholarships" element={<AdminScholarships />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
        
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
