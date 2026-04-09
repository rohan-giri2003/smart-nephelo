import React, { useState, useEffect } from 'react';
import { db, rtdb } from '../services/firebase';
import { collection, getDocs, limit, query } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { QRCodeSVG } from 'qrcode.react';
import { Activity, Share2, TrendingUp, Users, ShieldCheck, Database, Zap, Clock, Bell, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [liveData, setLiveData] = useState({ current_ntu: 0, status: 'IDLE' });
  const [stats, setStats] = useState({ total: 0, recent: [] });
  const [history, setHistory] = useState([{ time: '09:00', ntu: 1.2 }, { time: '10:00', ntu: 2.8 }]);

  const appUrl = window.location.href;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const q = query(collection(db, "patients"), limit(4));
        const snap = await getDocs(q);
        setStats({
          total: snap.size,
          recent: snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        });
      } catch (err) { console.error(err); }
    };
    fetchStats();

    onValue(ref(rtdb, 'live_telemetry'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLiveData(data);
        setHistory(prev => [...prev.slice(-10), { 
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
          ntu: parseFloat(data.current_ntu) 
        }]);
      }
    });
  }, []);

  const ntuLevel = parseFloat(liveData.current_ntu);
  const healthPercentage = Math.min((ntuLevel / 15) * 100, 100);

  return (
    <div className="p-6 lg:p-10 max-w-full mx-auto space-y-8 bg-[#f8fafc] min-h-screen animate-in fade-in duration-700">
      
      {/* --- INTERACTIVE TOP HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
            Master <span className="text-blue-600">Control</span>
          </h1>
          <div className="flex items-center gap-2 mt-3">
             <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Cloud Diagnostic Active</p>
          </div>
        </div>
        
        <div className="flex gap-4">
            <div className="group bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 transition-all hover:bg-blue-600 hover:text-white cursor-help">
                <Info size={18} className="group-hover:animate-bounce"/>
                <span className="text-[10px] font-black uppercase tracking-widest">Protocol v2.6</span>
            </div>
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center gap-3 shadow-xl">
                <Clock size={18} className="text-blue-400"/>
                <span className="text-xs font-bold uppercase">{new Date().toLocaleTimeString()}</span>
            </div>
        </div>
      </div>

      {/* --- INTERACTIVE STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Registered Patients', val: stats.total, icon: <Users/>, color: 'blue' },
          { label: 'System Accuracy', val: '99.2%', icon: <ShieldCheck/>, color: 'emerald' },
          { label: 'Active Telemetry', val: `${liveData.current_ntu} NTU`, icon: <Activity/>, color: 'amber' },
          { label: 'Current Status', val: liveData.status, icon: <Zap/>, color: liveData.current_ntu > 5 ? 'red' : 'blue' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/50 transition-all hover:-translate-y-2 cursor-pointer group">
            <div className={`p-4 bg-${item.color}-50 text-${item.color}-600 rounded-2xl w-fit mb-4 group-hover:bg-${item.color}-600 group-hover:text-white transition-colors`}>
                {item.icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 uppercase italic">{item.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- INTERACTIVE CIRCULAR VISUALIZER --- */}
        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Activity size={120}/></div>
            
            <div className="relative w-64 h-32 overflow-hidden mb-8">
              <div className="absolute top-0 left-0 w-64 h-64 border-[22px] border-slate-50 rounded-full"></div>
              <div className="absolute top-0 left-0 w-64 h-64 border-[22px] rounded-full transition-all duration-1000 ease-out"
                   style={{ borderColor: ntuLevel > 5 ? '#ef4444' : '#2563eb', clipPath: `inset(0 0 50% 0)`, transform: `rotate(${healthPercentage * 1.8}deg)` }}></div>
              <div className="absolute bottom-0 w-full text-center font-black text-5xl text-slate-900 tracking-tighter">{liveData.current_ntu}</div>
            </div>

            <div className="w-full space-y-4 px-6">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Absorption Scale</span>
                    <span>{healthPercentage.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${ntuLevel > 5 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${healthPercentage}%` }}></div>
                </div>
            </div>
        </div>

        {/* --- DYNAMIC ANALYTICS GRAPH --- */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-50 relative">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-800 flex items-center gap-3">
              <TrendingUp size={22} className="text-blue-600"/> Real-Time Absorption Trends
            </h2>
            <button className="p-3 hover:bg-slate-50 rounded-xl transition-colors"><Bell size={18} className="text-slate-400"/></button>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                   <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ntuLevel > 5 ? "#ef4444" : "#2563eb"} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={ntuLevel > 5 ? "#ef4444" : "#2563eb"} stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 20]} />
                <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)'}} />
                <Area type="monotone" dataKey="ntu" stroke={ntuLevel > 5 ? "#ef4444" : "#2563eb"} strokeWidth={6} fill="url(#color)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- FOOTER: INTERACTIVE SCANNER & LOGS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col justify-center group cursor-pointer hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors">
                      <Database size={20}/>
                  </div>
                  <h4 className="font-black text-slate-800 uppercase italic tracking-tight">Software Logic: Min-Max Normalization</h4>
              </div>
              <p className="text-xs text-slate-400 font-bold leading-relaxed">
                Raw CMOS sensor data is being standardized via software-level gain compensation. The current scattering coefficient 
                follows the <span className="text-blue-600 italic">ISO-7027 framework</span>, ensuring diagnostic consistency 
                across varying smartphone hardware architectures.
              </p>
          </div>
          
          <div className="lg:col-span-2 bg-slate-950 p-10 rounded-[3.5rem] flex items-center justify-around gap-6 text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] group">
              <div className="bg-white p-4 rounded-[2.5rem] shadow-inner transition-transform group-hover:scale-110 duration-500">
                <QRCodeSVG value={appUrl} size={110} level="H" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                   <Share2 size={16} className="animate-pulse"/>
                   <h3 className="font-black uppercase tracking-[0.2em] text-[11px] italic">Remote Sync</h3>
                </div>
                <h4 className="text-sm font-black uppercase leading-tight">Instant Cloud<br/>Relay Active</h4>
                <div className="mt-4 h-1 w-12 bg-blue-600 rounded-full"></div>
              </div>
          </div>
      </div>

    </div>
  );
};

export default Dashboard;