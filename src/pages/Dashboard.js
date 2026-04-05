import React, { useState, useEffect } from 'react';
import { getAllPatients } from '../services/patientService';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Users, Activity, Droplets, ShieldCheck, Clock, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Dashboard = () => {
  const [patientCount, setPatientCount] = useState(0);
  const [testCount, setTestCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Demo Trend Data (Aap ise real data se bhi link kar sakte hain)
  const trendData = [
    { time: '09:00', ntu: 12.1 },
    { time: '11:00', ntu: 14.5 },
    { time: '13:00', ntu: 13.2 },
    { time: '15:00', ntu: 15.8 },
    { time: '17:00', ntu: 14.0 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const patients = await getAllPatients();
        setPatientCount(patients.length);

        const querySnapshot = await getDocs(collection(db, "analysis_results"));
        setTestCount(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { title: 'Total Patients', value: patientCount, icon: <Users size={24}/>, color: 'bg-blue-600', sub: 'Cloud Registry' },
    { title: 'Tests Performed', value: testCount, icon: <Activity size={24}/>, color: 'bg-emerald-600', sub: 'Analyzed Samples' },
    { title: 'Avg. Turbidity', value: '14.8 NTU', icon: <Droplets size={24}/>, color: 'bg-orange-500', sub: 'System Average' },
    { title: 'System Status', value: 'Online', icon: <ShieldCheck size={24}/>, color: 'bg-slate-800', sub: 'Sensor Active' },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen animate-in fade-in duration-700">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">DIAGNOSTIC OVERVIEW</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1 text-blue-600">Smart-Nephelo Control Center</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Last Sync</span>
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Real-time Active</span>
        </div>
      </header>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`w-12 h-12 ${s.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-slate-200`}>
              {s.icon}
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{s.title}</p>
            <h3 className="text-3xl font-black text-slate-900 mb-2">
              {loading ? "..." : s.value}
            </h3>
            <p className="text-slate-400 text-[10px] font-bold italic">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Chart - 2/3 Width */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20}/> Turbidity Analysis Trend
            </h2>
            <select className="bg-slate-50 border-none text-[10px] font-bold uppercase p-2 rounded-lg outline-none">
              <option>Last 24 Hours</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorNtu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="ntu" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorNtu)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Logs - 1/3 Width */}
        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Clock className="text-blue-400" size={20}/> Hardware Logs
          </h2>
          <div className="space-y-6">
            <div className="relative pl-6 border-l-2 border-emerald-500/30">
              <div className="absolute -left-[5px] top-0 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-tighter">System Pulse</p>
              <p className="text-sm text-slate-300 mt-1">Optical sensor calibrated to 0.02 NTU offset.</p>
            </div>
            <div className="relative pl-6 border-l-2 border-blue-500/30">
              <div className="absolute -left-[5px] top-0 w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-tighter">Database Sync</p>
              <p className="text-sm text-slate-300 mt-1">Found {patientCount} patient records in cloud.</p>
            </div>
            <div className="relative pl-6 border-l-2 border-slate-700">
              <div className="absolute -left-[5px] top-0 w-2 h-2 bg-slate-600 rounded-full"></div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Boot Sequence</p>
              <p className="text-sm text-slate-400 mt-1">MacBook Pro M2 Interface loaded.</p>
            </div>
          </div>
          <button className="w-full mt-10 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
            Export System Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;