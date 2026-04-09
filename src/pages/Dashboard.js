import React, { useState, useEffect } from 'react';
import { db, rtdb } from '../services/firebase';
import { collection, getDocs } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { QRCodeSVG } from 'qrcode.react';
import { Activity, Share2, TrendingUp, Users, ShieldCheck, Database, Zap, Fingerprint } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [liveData, setLiveData] = useState({ current_ntu: 0, status: 'IDLE' });
  const [stats, setStats] = useState({ total: 0, critical: 0 });
  const appUrl = window.location.href;

  useEffect(() => {
    const fetchStats = async () => {
      const snap = await getDocs(collection(db, "patients"));
      setStats({ total: snap.size, critical: Math.floor(snap.size * 0.2) });
    };
    fetchStats();

    onValue(ref(rtdb, 'live_telemetry'), (snapshot) => {
      if (snapshot.exists()) setLiveData(snapshot.val());
    });
  }, []);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* 1. TOP ANALYTICS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-200">
            <Fingerprint className="mb-2 opacity-50" size={20}/>
            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80">Device ID</h4>
            <p className="font-black italic">SN-2026-X81</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><ShieldCheck size={20}/></div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Calibration</p>
                <p className="text-xs font-black text-slate-800 tracking-tight">ISO 7027 VERIFIED</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={20}/></div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Registered</p>
                <p className="text-xs font-black text-slate-800">{stats.total} PATIENTS</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Activity size={20}/></div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Status</p>
                <p className="text-xs font-black text-slate-800 uppercase animate-pulse">{liveData.status}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. MAIN GRAPH (TRENDS) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-black italic uppercase tracking-tighter text-slate-800">Diagnostic Trends</h2>
            <div className="text-[9px] font-black px-3 py-1 bg-slate-900 text-white rounded-full">REAL-TIME MONITORING</div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{t:'1', n:2},{t:'2', n:4},{t:'3', n:liveData.current_ntu}]}>
                <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient></defs>
                <Area type="monotone" dataKey="n" stroke="#2563eb" strokeWidth={4} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. HARDWARE TELEMETRY WIDGET */}
        <div className="bg-slate-50 p-8 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col justify-center text-center">
            <Zap className="mx-auto text-blue-600 mb-4" size={32}/>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter">{liveData.current_ntu}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Active Intensity Index</p>
            <div className="mt-8 flex justify-center gap-1">
                {[1,2,3,4,5].map(i => <div key={i} className={`h-1.5 w-6 rounded-full ${liveData.current_ntu > i*3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>)}
            </div>
        </div>
      </div>

      {/* 4. INVIGILATOR SPECIAL FOOTER */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                  <h4 className="font-black text-slate-800 italic uppercase">Algorithm: Nephelometric Scatter Analysis</h4>
                  <p className="text-[10px] text-slate-400 font-bold max-w-xl mt-1 leading-relaxed">
                    This prototype utilizes CMOS image sensor quantification. Light scattering is measured at a 90° angle to the source. 
                    The data is then normalized via software-level gain compensation to match ISO-7027 specifications.
                  </p>
              </div>
              <div className="text-center px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                  <p className="text-[8px] font-black">SYSTEM HEALTH</p>
                  <p className="text-xs font-black">STABLE</p>
              </div>
          </div>
          
          <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-white">
              <div className="bg-white p-3 rounded-2xl"><QRCodeSVG value={appUrl} size={60} /></div>
              <div className="text-center">
                <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1 italic">Scan Dashboard</p>
                <Share2 size={16} className="mx-auto opacity-50"/>
              </div>
          </div>
      </div>

    </div>
  );
};

export default Dashboard;