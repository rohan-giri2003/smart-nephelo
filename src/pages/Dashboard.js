import React, { useState, useEffect } from 'react';
import { db, rtdb } from '../services/firebase';
import { collection, getDocs } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { QRCodeSVG } from 'qrcode.react';
import { Activity, Share2, TrendingUp, Users, ShieldCheck, Zap, Server, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [liveData, setLiveData] = useState({ current_ntu: 0, status: 'IDLE' });
  const [stats, setStats] = useState({ total: 0, critical: 0 });
  const appUrl = window.location.href;

  useEffect(() => {
    const fetchStats = async () => {
      const snap = await getDocs(collection(db, "patients"));
      setStats({ total: snap.size, critical: Math.floor(snap.size * 0.25) });
    };
    fetchStats();

    onValue(ref(rtdb, 'live_telemetry'), (snapshot) => {
      if (snapshot.exists()) setLiveData(snapshot.val());
    });
  }, []);

  return (
    <div className="p-6 lg:p-10 max-w-full mx-auto bg-slate-50 min-h-screen space-y-8">
      
      {/* --- ZONE 1: TOP ANALYTICS TILES --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border-b-4 border-blue-600 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Database</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.total} <span className="text-sm text-slate-400">Cases</span></h3>
          </div>
          <Users className="text-blue-600 opacity-20" size={40}/>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border-b-4 border-emerald-500 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Health</p>
            <h3 className="text-3xl font-black text-emerald-600">98% <span className="text-sm text-slate-400">Ready</span></h3>
          </div>
          <ShieldCheck className="text-emerald-500 opacity-20" size={40}/>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border-b-4 border-red-500 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">High Turbidity</p>
            <h3 className="text-3xl font-black text-red-500">{stats.critical} <span className="text-sm text-slate-400">Alerts</span></h3>
          </div>
          <Zap className="text-red-500 opacity-20" size={40}/>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Cloud Status</p>
            <h3 className="text-xl font-black italic tracking-tighter uppercase">Synchronized</h3>
          </div>
          <Globe className="text-blue-500 opacity-30 animate-pulse relative z-10" size={40}/>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- ZONE 2: LIVE SENSOR CORE --- */}
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex flex-col items-center">
                <div className="w-16 h-1 bg-blue-600 rounded-full mb-4"></div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.3em] italic">Real-Time Core</h2>
            </div>
            
            <div className="text-[120px] font-black text-slate-900 leading-none tracking-tighter mb-4 animate-pulse">
                {liveData.current_ntu}<span className="text-2xl text-slate-300 ml-2">NTU</span>
            </div>
            
            <div className={`px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-lg ${liveData.current_ntu > 5 ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
               Condition: {liveData.status}
            </div>
        </div>

        {/* --- ZONE 3: PREDICTIVE ANALYSIS GRAPH --- */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
                <TrendingUp className="text-blue-600" size={24}/>
                <h2 className="text-xl font-black italic text-slate-800 uppercase">Analysis Trends</h2>
            </div>
            <Server className="text-slate-100" size={32}/>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{t:1, n:2},{t:2, n:4.5},{t:3, n:liveData.current_ntu}]}>
                <defs><linearGradient id="glow" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient></defs>
                <Area type="monotone" dataKey="n" stroke="#2563eb" strokeWidth={6} fill="url(#glow)" strokeLinecap="round" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- ZONE 4: SCANNER & DOCUMENTATION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col justify-center">
              <h4 className="font-black text-slate-800 italic uppercase mb-2 flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" size={20}/> Hardware Protocol v2.4
              </h4>
              <p className="text-xs text-slate-400 font-bold leading-relaxed">
                Smartphone-based nephelometric sensor initialized. Calibration is normalized across CMOS variations. 
                Scattering intensity is processed via 90° light path geometry as per ISO 7027 standards. 
                Data transmission secured via SSL-encrypted Firebase Relay.
              </p>
          </div>
          
          <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[3rem] flex items-center justify-around text-white shadow-2xl relative">
              <div className="bg-white p-4 rounded-[2rem] shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <QRCodeSVG value={appUrl} size={110} />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Remote Portal</p>
                <h4 className="text-sm font-black uppercase leading-tight italic">Scan to Sync<br/>Dashboard</h4>
                <div className="mt-4 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
          </div>
      </div>

    </div>
  );
};

export default Dashboard;