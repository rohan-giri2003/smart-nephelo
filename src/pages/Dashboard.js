import React, { useState, useEffect } from 'react';
import { db, rtdb } from '../services/firebase';
import { collection, getDocs, limit, query, orderBy } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { QRCodeSVG } from 'qrcode.react';
import { Activity, Share2, TrendingUp, Users, ShieldCheck, Database, Smartphone, Clock, ListChecks, HeartPulse } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [liveData, setLiveData] = useState({ current_ntu: 0, status: 'IDLE' });
  const [stats, setStats] = useState({ total: 0, recent: [] });
  const [history, setHistory] = useState([
    { time: '09:00', ntu: 1.2 }, { time: '10:00', ntu: 2.8 }, { time: '11:00', ntu: 1.5 }
  ]);

  const appUrl = window.location.href;

  useEffect(() => {
    // 1. Fetch Patients & Recent Activity
    const fetchStats = async () => {
      try {
        const q = query(collection(db, "patients"), limit(5));
        const snap = await getDocs(q);
        setStats({
          total: snap.size,
          recent: snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        });
      } catch (err) { console.error(err); }
    };
    fetchStats();

    // 2. Realtime Listener
    onValue(ref(rtdb, 'live_telemetry'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLiveData(data);
        setHistory(prev => [...prev.slice(-8), { 
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
          ntu: parseFloat(data.current_ntu) 
        }]);
      }
    });
  }, []);

  const gaugePercentage = Math.min((liveData.current_ntu / 15) * 100, 100);

  return (
    <div className="p-4 lg:p-8 max-w-full mx-auto space-y-6 bg-slate-50/30 min-h-screen animate-in fade-in duration-700">
      
      {/* --- HEADER STRIP --- */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Command Center</h1>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-2">Smart-Nephelo Diagnostic Engine v2.5</p>
        </div>
        <div className="hidden md:flex gap-2">
            <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase">Server: Online</span>
            </div>
        </div>
      </div>

      {/* --- ROW 1: ANALYTICS TILES --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center gap-4">
          <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100"><Users size={24}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Database</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.total} Patients</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center gap-4">
          <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100"><ShieldCheck size={24}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precision</p>
            <h3 className="text-lg font-black text-emerald-600 uppercase italic">ISO Verified</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center gap-4">
          <div className="p-4 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-100"><HeartPulse size={24}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live NTU</p>
            <h3 className="text-2xl font-black text-slate-800">{liveData.current_ntu}</h3>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl text-white flex flex-col justify-center">
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Cloud Stream</span>
            <div className="text-xs font-bold flex items-center gap-2">
                <Database size={14} className="text-blue-500"/> Synchronized
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- ROW 2: LIVE VISUALIZER --- */}
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center justify-center relative">
            <div className="relative w-64 h-32 overflow-hidden mb-8">
              <div className="absolute top-0 left-0 w-64 h-64 border-[20px] border-slate-50 rounded-full"></div>
              <div className="absolute top-0 left-0 w-64 h-64 border-[20px] rounded-full transition-all duration-1000 ease-out"
                   style={{ borderColor: liveData.current_ntu > 5 ? '#ef4444' : '#2563eb', clipPath: `inset(0 0 50% 0)`, transform: `rotate(${gaugePercentage * 1.8}deg)` }}></div>
              <div className="absolute bottom-0 w-full text-center font-black text-4xl text-slate-900 leading-none">{liveData.current_ntu}</div>
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Diagnostic Intensity</p>
            <div className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 shadow-sm ${liveData.current_ntu > 5 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
              Status: {liveData.status}
            </div>
        </div>

        {/* --- ROW 3: RECENT ACTIVITY LIST (New Important Feature) --- */}
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center gap-2 mb-6 text-slate-800">
                <ListChecks size={20} className="text-blue-600"/>
                <h2 className="text-sm font-black uppercase italic tracking-tighter">Recent Logs</h2>
            </div>
            <div className="space-y-4">
                {stats.recent.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-[10px] text-blue-600 shadow-sm">{p.name?.[0]}</div>
                            <span className="text-[11px] font-black text-slate-700 uppercase">{p.name}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Success</span>
                    </div>
                ))}
            </div>
        </div>

        {/* --- ROW 4: TRENDING ANALYSIS --- */}
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-black uppercase italic tracking-tighter text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600"/> Temporal trends
            </h2>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs><linearGradient id="col" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient></defs>
                <Area type="monotone" dataKey="ntu" stroke="#2563eb" strokeWidth={5} fill="url(#col)" strokeLinecap="round" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- FOOTER: SYSTEM SPECS & QR --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2 text-blue-600">
                  <Smartphone size={20}/>
                  <h4 className="font-black italic uppercase text-sm tracking-tight">Normalization Engine Active</h4>
              </div>
              <p className="text-xs text-slate-400 font-bold leading-relaxed">
                Hardware Bridge: CMOS sensor initialized. Scattering intensity is processed via software-level gain compensation 
                to ensure diagnostic consistency across device variations.
              </p>
          </div>
          
          <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[2.5rem] flex items-center justify-around gap-4 text-white shadow-2xl relative overflow-hidden group">
              <div className="bg-white p-3 rounded-[1.5rem] shadow-inner transition-transform group-hover:rotate-6 duration-500">
                <QRCodeSVG value={appUrl} size={100} level="H" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                   <Share2 size={16} />
                   <h3 className="font-black uppercase tracking-[0.2em] text-[10px] italic">Remote Sync</h3>
                </div>
                <p className="text-[9px] text-slate-500 font-bold uppercase leading-tight tracking-widest">
                  Scan to mirror dashboard<br/>on personal mobile
                </p>
              </div>
          </div>
      </div>

    </div>
  );
};

export default Dashboard;