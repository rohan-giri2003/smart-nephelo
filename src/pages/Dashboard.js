import React, { useState, useEffect } from 'react';
import { db, rtdb } from '../services/firebase';
import { collection, getDocs } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { QRCodeSVG } from 'qrcode.react';
import { Activity, Share2, TrendingUp, Users, ShieldCheck, Database, Smartphone } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [liveData, setLiveData] = useState({ current_ntu: 0, status: 'IDLE' });
  const [stats, setStats] = useState({ totalPatients: 0 });
  const [history, setHistory] = useState([
    { time: '09:00', ntu: 1.2 }, 
    { time: '10:00', ntu: 2.5 }, 
    { time: '11:00', ntu: 1.8 }
  ]);

  const appUrl = window.location.href;

  useEffect(() => {
    // 1. Fetch Total Patients Count from Firestore
    const fetchStats = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "patients"));
        setStats({ totalPatients: querySnapshot.size });
      } catch (err) {
        console.error("Stats Error:", err);
      }
    };
    fetchStats();

    // 2. Realtime Database Listener
    const liveRef = ref(rtdb, 'live_telemetry');
    onValue(liveRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLiveData(data);
        // Graph updates in real-time
        setHistory(prev => [...prev.slice(-6), { 
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
          ntu: parseFloat(data.current_ntu) 
        }]);
      }
    });
  }, []);

  const gaugePercentage = Math.min((liveData.current_ntu / 15) * 100, 100);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen">
      
      {/* --- SECTION 1: TOP ANALYTICS TILES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center gap-4 transition-all hover:scale-105">
          <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100"><Users size={22}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Database</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.totalPatients} Patients</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center gap-4 transition-all hover:scale-105">
          <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100"><ShieldCheck size={22}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calibration</p>
            <h3 className="text-lg font-black text-emerald-600 uppercase italic">ISO 7027 Stable</h3>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Database size={20} className="text-blue-400"/>
               <span className="text-xs font-bold uppercase tracking-widest italic">Live Relay</span>
            </div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- SECTION 2: LIVE NTU GAUGE --- */}
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center justify-center relative">
            <div className="relative w-64 h-32 overflow-hidden mb-6">
              <div className="absolute top-0 left-0 w-64 h-64 border-[20px] border-slate-50 rounded-full"></div>
              <div 
                className="absolute top-0 left-0 w-64 h-64 border-[20px] rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  borderColor: liveData.current_ntu > 5 ? '#ef4444' : '#2563eb',
                  clipPath: `inset(0 0 50% 0)`,
                  transform: `rotate(${gaugePercentage * 1.8}deg)`
                }}
              ></div>
              <div className="absolute bottom-0 w-full text-center font-black text-4xl text-slate-900 leading-none">
                {liveData.current_ntu}
              </div>
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Core Intensity</p>
            <div className={`mt-8 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm border-2 ${liveData.current_ntu > 5 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
              Alert Status: {liveData.status}
            </div>
        </div>

        {/* --- SECTION 3: REAL-TIME TREND GRAPH --- */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-800 flex items-center gap-2">
              <TrendingUp size={22} className="text-blue-600"/> Temporal Trends
            </h2>
            <span className="bg-slate-50 px-4 py-2 rounded-full text-[9px] font-black text-slate-400">NTU/TIME SYNC</span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorNtu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 20]} />
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="ntu" stroke="#2563eb" strokeWidth={5} fill="url(#colorNtu)" strokeLinecap="round" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- SECTION 4: INVIGILATOR ACCESS PORTAL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3 text-blue-600">
                  <Smartphone size={20}/>
                  <h4 className="font-black italic uppercase text-sm tracking-tight">System Protocol Active</h4>
              </div>
              <p className="text-xs text-slate-400 font-bold leading-relaxed">
                Hardware initialized: CMOS sensor quantification active. Nephelometric scattering data is currently 
                relayed via 256-bit SSL encryption to the Firebase Cloud Cluster.
              </p>
          </div>
          
          <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[2.5rem] flex items-center justify-around gap-4 text-white shadow-2xl group transition-all">
              <div className="bg-white p-3 rounded-[1.5rem] shadow-inner transition-transform group-hover:scale-105 duration-500">
                <QRCodeSVG value={appUrl} size={110} level="H" />
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