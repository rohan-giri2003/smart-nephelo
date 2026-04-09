import React, { useState, useEffect } from 'react';
import { rtdb } from '../services/firebase';
import { ref, onValue } from "firebase/database";
import { QRCodeSVG } from 'qrcode.react';
import { Activity, Share2, TrendingUp, Users, ShieldAlert, Database } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [liveData, setLiveData] = useState({ current_ntu: 0, status: 'IDLE' });
  const [history, setHistory] = useState([
    { time: '09:00', ntu: 1.2 }, { time: '10:00', ntu: 4.5 }, { time: '11:00', ntu: 3.8 }
  ]);

  const appUrl = window.location.href;

  useEffect(() => {
    const liveRef = ref(rtdb, 'live_telemetry');
    onValue(liveRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLiveData(data);
        setHistory(prev => [...prev.slice(-6), { 
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
          ntu: parseFloat(data.current_ntu) 
        }]);
      }
    });
  }, []);

  const gaugePercentage = Math.min((liveData.current_ntu / 15) * 100, 100);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Activity size={24}/></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live NTU</p>
          <h3 className="text-xl font-black text-slate-800">{liveData.current_ntu}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><ShieldAlert size={24}/></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Condition</p>
          <h3 className={`text-xs font-black uppercase ${liveData.current_ntu > 5 ? 'text-red-500' : 'text-emerald-500'}`}>{liveData.status}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl"><Users size={24}/></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync Status</p>
          <h3 className="text-xs font-black text-slate-800">CONNECTED</h3></div>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Cloud Live</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. LIVE GAUGE METER */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center">
            <div className="relative w-48 h-24 overflow-hidden mb-4">
              <div className="absolute top-0 left-0 w-48 h-48 border-[15px] border-slate-50 rounded-full"></div>
              <div className="absolute top-0 left-0 w-48 h-48 border-[15px] rounded-full transition-all duration-1000"
                   style={{ borderColor: liveData.current_ntu > 5 ? '#ef4444' : '#2563eb', clipPath: `inset(0 0 50% 0)`, transform: `rotate(${gaugePercentage * 1.8}deg)` }}></div>
              <div className="absolute bottom-0 w-full text-center font-black text-2xl text-slate-900">{liveData.current_ntu}</div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Intensity</p>
        </div>

        {/* 3. TRENDING GRAPH */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="font-black uppercase italic tracking-tight text-slate-800 mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-blue-600"/> Analysis Trends</h2>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs><linearGradient id="col" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 20]} />
                <Tooltip contentStyle={{borderRadius: '15px', border: 'none'}} />
                <Area type="monotone" dataKey="ntu" stroke="#2563eb" strokeWidth={3} fill="url(#col)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. INVIGILATOR & SYSTEM INFO */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-center gap-6 lg:col-span-3">
              <div className="flex-1">
                  <h4 className="font-black text-slate-800 uppercase italic">System Normalization Active</h4>
                  <p className="text-xs text-slate-400 font-medium">The diagnostic engine is currently using Min-Max scaling to ensure cross-device camera accuracy.</p>
              </div>
              <div className="h-12 w-px bg-slate-100"></div>
              <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-300 uppercase">Version</span>
                  <span className="text-sm font-black text-slate-900 italic underline decoration-blue-500">v2.4.0-Stable</span>
              </div>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-[2rem] flex items-center gap-4 text-white shadow-xl shadow-slate-200">
              <div className="bg-white p-2 rounded-xl"><QRCodeSVG value={appUrl} size={60} /></div>
              <div><p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Access</p>
              <h4 className="text-[10px] font-bold leading-tight uppercase">Scan to Sync Dashboard</h4></div>
          </div>
      </div>

    </div>
  );
};

export default Dashboard;