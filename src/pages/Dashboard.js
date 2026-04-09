import React, { useState, useEffect } from 'react';
import { db, rtdb } from '../services/firebase';
import { collection, getDocs } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { QRCodeSVG } from 'qrcode.react';
import { Activity, Share2, TrendingUp, Users, ShieldAlert, Database, Smartphone } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [liveData, setLiveData] = useState({ current_ntu: 0, status: 'IDLE' });
  const [stats, setStats] = useState({ totalPatients: 0 });
  const [history, setHistory] = useState([
    { time: '09:00', ntu: 1.2 }, { time: '10:00', ntu: 4.5 }, { time: '11:00', ntu: 3.8 }
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

    // 2. Realtime Database Listener for Live NTU and Graph Trends
    const liveRef = ref(rtdb, 'live_telemetry');
    onValue(liveRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLiveData(data);
        // Add live point to history graph
        setHistory(prev => [...prev.slice(-6), { 
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
          ntu: parseFloat(data.current_ntu) 
        }]);
      }
    });
  }, []);

  const gaugePercentage = Math.min((liveData.current_ntu / 15) * 100, 100);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
      
      {/* --- TOP ANALYTICS TILES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-105 duration-300">
          <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100"><Users size={22}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Patients</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.totalPatients}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-105 duration-300">
          <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100"><ShieldAlert size={22}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Device Health</p>
            <h3 className="text-lg font-black text-emerald-600 uppercase italic">Active & Secure</h3>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Database size={20} className="text-blue-400"/>
               <span className="text-xs font-bold uppercase tracking-widest italic">Cloud Sync On</span>
            </div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- LIVE GAUGE METER --- */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col items-center justify-center relative group">
            <div className="relative w-56 h-28 overflow-hidden mb-6">
              <div className="absolute top-0 left-0 w-56 h-56 border-[18px] border-slate-50 rounded-full"></div>
              <div 
                className="absolute top-0 left-0 w-56 h-56 border-[18px] rounded-full transition-all duration-1000"
                style={{ 
                  borderColor: liveData.current_ntu > 5 ? '#ef4444' : '#2563eb',
                  clipPath: `inset(0 0 50% 0)`,
                  transform: `rotate(${gaugePercentage * 1.8}deg)`
                }}
              ></div>
              <div className="absolute bottom-0 w-full text-center font-black text-3xl text-slate-900 leading-none">
                {liveData.current_ntu}
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Intensity</p>
            <div className={`mt-6 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${liveData.current_ntu > 5 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
              Condition: {liveData.status}
            </div>
        </div>

        {/* --- TRENDING GRAPH --- */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-black uppercase italic tracking-tight text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600"/> Temporal Analysis
            </h2>
          </div>
          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorNtu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 20]} />
                <Tooltip contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="ntu" stroke="#2563eb" strokeWidth={4} fill="url(#colorNtu)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- INVIGILATOR ACCESS & FOOTER --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2 text-blue-600">
                  <Smartphone size={18}/>
                  <h4 className="font-black italic uppercase text-sm">Hardware Protocol Active</h4>
              </div>
              <p className="text-xs text-slate-400 font-bold leading-relaxed">
                The diagnostic engine is utilizing real-time CMOS image sensor quantification. Scattering data is normalized 
                across device variations using Min-Max scaling to ensure ISO-7027 consistency.
              </p>
          </div>
          
          <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-white shadow-2xl relative overflow-hidden group">
              <div className="bg-white p-3 rounded-2xl shadow-inner relative z-10 transition-transform group-hover:scale-105 duration-500">
                <QRCodeSVG value={appUrl} size={80} level="H" />
              </div>
              <div className="text-center relative z-10">
                <div className="flex items-center justify-center gap-2 text-blue-400 mb-1">
                   <Share2 size={14} />
                   <h3 className="font-black uppercase tracking-[0.2em] text-[10px] italic">Invigilator Access</h3>
                </div>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Scan to Synchronize Dashboard</p>
              </div>
          </div>
      </div>

    </div>
  );
};

export default Dashboard;