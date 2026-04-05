import React, { useState, useEffect } from 'react';
import { getAllPatients } from '../services/patientService';
import { db } from '../services/firebase';
import { collection, getDocs } from "firebase/firestore";
import { Users, Activity, Droplets, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [patientCount, setPatientCount] = useState(0);
  const [testCount, setTestCount] = useState(0);

  const trendData = [
    { time: '09:00', ntu: 12.1 },
    { time: '11:00', ntu: 14.5 },
    { time: '13:00', ntu: 13.2 },
    { time: '15:00', ntu: 15.8 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const patients = await getAllPatients();
        setPatientCount(patients.length);
        const querySnapshot = await getDocs(collection(db, "analysis_results"));
        setTestCount(querySnapshot.size);
      } catch (e) { console.log(e); }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black mb-10 tracking-tight">SMART-NEPHELO DASHBOARD</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Patients', val: patientCount, icon: <Users/>, color: 'bg-blue-600' },
          { label: 'Tests', val: testCount, icon: <Activity/>, color: 'bg-emerald-600' },
          { label: 'Avg NTU', val: '14.8', icon: <Droplets/>, color: 'bg-orange-500' },
          { label: 'Status', val: 'Online', icon: <ShieldCheck/>, color: 'bg-slate-800' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className={`w-10 h-10 ${s.color} text-white rounded-xl flex items-center justify-center mb-4`}>{s.icon}</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            <h3 className="text-2xl font-black text-slate-900">{s.val}</h3>
          </div>
        ))}
      </div>
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip />
            <Area type="monotone" dataKey="ntu" stroke="#2563eb" fill="#dbeafe" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;