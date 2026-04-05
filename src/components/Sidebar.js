import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Activity, FileText, Settings as SettingsIcon, Menu, X } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Patients', path: '/patients', icon: <Users size={20} /> },
    { name: 'Analysis', path: '/analysis', icon: <Activity size={20} /> },
    { name: 'Reports', path: '/reports', icon: <FileText size={20} /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> }
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header (Only visible on small screens) */}
      <div className="lg:hidden bg-slate-900 text-white p-4 flex justify-between items-center fixed top-0 w-full z-[60]">
        <h1 className="text-lg font-black text-blue-400 tracking-tighter">SMART-NEPHELO</h1>
        <button onClick={toggleMenu} className="p-2 bg-slate-800 rounded-lg">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[50] lg:hidden" 
          onClick={toggleMenu}
        />
      )}

      {/* Sidebar Content */}
      <div className={`
        fixed left-0 top-0 h-screen bg-slate-900 text-white p-6 shadow-2xl z-[55] transition-all duration-300
        w-64 lg:translate-x-0 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="mb-10 border-b border-slate-700 pb-4 hidden lg:block">
          <h1 className="text-xl font-black text-blue-400 tracking-tighter">SMART-NEPHELO</h1>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Diagnostic System</p>
        </div>
        
        {/* Gap for mobile header */}
        <div className="h-16 lg:hidden"></div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)} // Close menu on click
              className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${
                location.pathname === item.path ? 'bg-blue-600 shadow-lg shadow-blue-900/50 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span className="font-bold text-sm tracking-wide">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;