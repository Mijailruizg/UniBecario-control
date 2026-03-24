import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Clock, History, FileText, Users, Calendar, Moon, Sun, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { supabase } from '../lib/supabase';

export const Layout = () => {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/login');
  };

  const studentNavigation = [
    { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Historial', href: '/student/history', icon: History },
    { name: 'Perfil', href: '/student/profile', icon: UserIcon },
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Becas', href: '/admin/scholarships', icon: Calendar },
    { name: 'Reportes', href: '/admin/reports', icon: FileText },
  ];

  const navigation = user?.rol === 'admin' ? adminNavigation : studentNavigation;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-10 transition-colors duration-200">
        <div className="flex h-16 items-center flex-shrink-0 px-6 bg-primary-600 dark:bg-primary-900 text-white">
          <Clock className="w-6 h-6 mr-3" />
          <span className="font-bold text-lg tracking-wide">UniBecarios</span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5" aria-hidden="true" />
                {item.name}
              </NavLink>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-100 hover:text-red-600 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-64 w-full">
        {/* Navbar */}
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/80 backdrop-blur-md px-6 dark:border-gray-700 dark:bg-gray-800/80 transition-colors duration-200 shadow-sm">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end items-center">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Profile Dropdown / Info */}
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-700" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 overflow-hidden rounded-full bg-gray-100 border border-gray-200 dark:border-gray-700">
                  {user?.foto_perfil ? (
                    <img src={user.foto_perfil} alt="perfil" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="m-auto h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="hidden sm:flex sm:flex-col sm:items-start text-sm leading-6">
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">
                    {user?.nombre.split(' ')[0]}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.rol}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 py-8 px-6 sm:px-8 lg:px-10 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
