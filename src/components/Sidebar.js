import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Activity, FileText, Settings as SettingsIcon } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Patients', path: '/patients', icon: <Users size={20} /> },
    { name: 'Analysis', path: '/analysis', icon: <Activity size={20} /> },
    { name: 'Reports', path: '/reports', icon: <FileText size={20} /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> }
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white fixed left-0 top-0 p-6 shadow-2xl z-50">
      <div className="mb-10 border-b border-slate-700 pb-4">
        <h1 className="text-xl font-black text-blue-400 tracking-tighter">SMART-NEPHELO</h1>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Diagnostic System</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              location.pathname === item.path ? 'bg-blue-600 shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            {item.icon}
            <span className="font-semibold text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;