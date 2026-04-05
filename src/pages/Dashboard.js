import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from "firebase/firestore";
import { Users, Activity, Droplets, ShieldCheck, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [patientCount, setPatientCount] = useState(0);
  const [testCount, setTestCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const trendData = [
    { time: '09:00', ntu: 12.1 },
    { time: '11:00', ntu: 14.5 },
    { time: '13:00', ntu: 13.2 },
    { time: '15:00', ntu: 15.8 },
    { time: '17:00', ntu: 14.2 },
  ];

  // Data fetch karne ka function
  const fetchStats = async () => {
    setLoading(true);
    try {
      // 1. Patients count fetch karna
      const patientSnap = await getDocs(collection(db, "patients"));
      setPatientCount(patientSnap.size);

      // 2. Analysis results count fetch karna
      const analysisSnap = await getDocs(collection(db, "analysis_results"));
      setTestCount(analysisSnap.size);
    } catch (e) {
      console.error("Error fetching dashboard stats: ", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-4 lg:p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight uppercase">Dashboard</h1>
        <button 
          onClick={fetchStats}
          className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all"
        >
          {loading ? <RefreshCw className="animate-spin text-blue-600" size={20}/> : <RefreshCw size={20} className="text-slate-600"/>}
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
        {[
          { label: 'Total Patients', val: patientCount, icon: <Users/>, color: 'bg-blue-600' },
          { label: 'Tests Conducted', val: testCount, icon: <Activity/>, color: 'bg-emerald-600' },
          { label: 'Avg Turbidity', val: '14.8 NTU', icon: <Droplets/>, color: 'bg-orange-500' },
          { label: 'System Status', val: 'Online', icon: <ShieldCheck/>, color: 'bg-slate-800' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 lg:p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className={`w-10 h-10 ${s.color} text-white rounded-xl flex items-center justify-center mb-4`}>{s.icon}</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className="text-xl lg:text-2xl font-black text-slate-900">{loading ? '...' : s.val}</h3>
          </div>
        ))}
      </div>

      {/* CHART SECTION */}
      <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="mb-6">
          <h2 className="font-black text-slate-800 uppercase tracking-tight">Turbidity Trends (NTU)</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Live hardware telemetry</p>
        </div>
        <div className="h-64 lg:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorNtu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} dy={10} />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
              />
              <Area 
                type="monotone" 
                dataKey="ntu" 
                stroke="#2563eb" 
                fillOpacity={1} 
                fill="url(#colorNtu)" 
                strokeWidth={4}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;