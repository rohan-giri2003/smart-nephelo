import React, { useState, useEffect } from 'react';
import { rtdb } from '../services/firebase';
import { ref, onValue } from "firebase/database";
import { QRCodeSVG } from 'qrcode.react';
import { Activity, Share2, TrendingUp, Users, Database } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [liveData, setLiveData] = useState({ current_ntu: 0, status: 'IDLE' });
  const [history, setHistory] = useState([
    { time: '10:00', ntu: 2.5 },
    { time: '11:00', ntu: 3.8 },
    { time: '12:00', ntu: 4.2 },
    { time: '13:00', ntu: liveData.current_ntu || 5.0 },
  ]);

  const appUrl = window.location.href;

  useEffect(() => {
    const liveRef = ref(rtdb, 'live_telemetry');
    onValue(liveRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLiveData(data);
        // Live data ko graph mein update karne ke liye
        setHistory(prev => [...prev.slice(-5), { time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), ntu: parseFloat(data.current_ntu) }]);
      }
    });
  }, []);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Activity size={24}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Reading</p>
            <h3 className="text-2xl font-black text-slate-800">{liveData.current_ntu} NTU</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><Users size={24}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Device Status</p>
            <h3 className="text-lg font-black text-slate-800 uppercase">{liveData.status}</h3>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
             <Share2 size={20} className="text-blue-400"/>
             <span className="text-xs font-bold uppercase tracking-widest">Cloud Sync Active</span>
          </div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* PURANA GRAPH (Area Chart) */}
        <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-black uppercase italic tracking-tight text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600"/> Analysis Trends
            </h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorNtu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                <Tooltip contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="ntu" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorNtu)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* INTEGRATED SCANNER (Invigilator Access) */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Invigilator Access</h3>
            <div className="p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 inline-block">
              <QRCodeSVG value={appUrl} size={120} level="H" />
            </div>
          </div>
          <p className="text-[9px] font-bold text-slate-400 px-2 leading-relaxed">
            Scan to synchronize this dashboard with your mobile device for remote monitoring.
          </p>
          <div className="mt-6 w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest">
            Protocol v2.0
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;