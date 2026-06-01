import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Star, Bell, Settings, LogOut, Menu, X } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/reviews', label: 'Reviews', icon: Star },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings }
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex h-screen bg-[#0a0e1a] text-slate-300">
      {/* Sidebar */}
      <aside className={`${open ? 'flex' : 'hidden'} md:flex flex-col w-64 bg-[#0d1221] border-r border-white/5 fixed md:static inset-y-0 left-0 z-50`}>
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="LocalProof" className="w-7 h-7" />
            <h1 className="text-lg font-bold text-white tracking-tight">LocalProof</h1>
          </Link>
          <p className="text-xs text-slate-500 mt-1 truncate">{user?.businessName || user?.name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === path
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 bg-[#0d1221] border-b border-white/5">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="LocalProof" className="w-6 h-6" />
            <h1 className="text-lg font-bold text-white">LocalProof</h1>
          </div>
          <button onClick={() => setOpen(!open)} className="text-slate-300">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {open && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setOpen(false)} />}
    </div>
  );
}
