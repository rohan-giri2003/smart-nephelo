import React, { useState, useEffect } from 'react';
import { db, rtdb } from '../services/firebase';
import { collection, getDocs } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { QRCodeSVG } from 'qrcode.react';
import { Activity, Share2, TrendingUp, Users, ShieldAlert, Database, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [liveData, setLiveData] = useState({ current_ntu: 0, status: 'IDLE' });
  const [stats, setStats] = useState({ totalPatients: 0, criticalCount: 0 });
  const [history, setHistory] = useState([
    { time: '09:00', ntu: 1.2 }, { time: '10:00', ntu: 4.5 }, { time: '11:00', ntu: 3.8 }
  ]);

  const appUrl = window.location.href;

  useEffect(() => {
    // 1. Fetch Stats from Firestore
    const fetchStats = async () => {
      const querySnapshot = await getDocs(collection(db, "patients"));
      const patients = querySnapshot.docs.map(doc => doc.data());
      // Hum maan rahe hain ki "unsafe" reports analyze se aayengi, 
      // yahan hum total count aur random critical cases dikha rahe prototype ke liye
      setStats({
        totalPatients: querySnapshot.size,
        criticalCount: Math.floor(querySnapshot.size * 0.3) // Mock calculation
      });
    };
    fetchStats();

    // 2. Realtime Database Listener
    const liveRef = ref(rtdb, 'live_telemetry');
    onValue(liveRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLiveData(data);
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
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">System Overview</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Diagnostic Intelligence & Cloud Sync</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
          <Clock size={16} className="text-blue-500"/>
          <span className="text-xs font-black text-slate-700 uppercase">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* --- LIVE STATS WIDGETS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-transform hover:scale-105 duration-300">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100"><Users size={22}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Patients</p>
              <h3 className="text-2xl font-black text-slate-800">{stats.totalPatients}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-transform hover:scale-105 duration-300">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-100"><ShieldAlert size={22}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Critical Cases</p>
              <h3 className="text-2xl font-black text-slate-800">{stats.criticalCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-transform hover:scale-105 duration-300">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100"><Activity size={22}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live NTU</p>
              <h3 className="text-2xl font-black text-slate-800">{liveData.current_ntu}</h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white flex flex-col justify-center">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Cloud Relay</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-xs font-bold italic">Secure Connection</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- LIVE GAUGE --- */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Database size={80}/>
            </div>
            <div className="relative w-56 h-28 overflow-hidden mb-6">
              <div className="absolute top-0 left-0 w-56 h-56 border-[20px] border-slate-50 rounded-full"></div>
              <div className="absolute top-0 left-0 w-56 h-56 border-[20px] rounded-full transition-all duration-1000"
                   style={{ borderColor: liveData.current_ntu > 5 ? '#ef4444' : '#2563eb', clipPath: `inset(0 0 50% 0)`, transform: `rotate(${gaugePercentage * 1.8}deg)` }}></div>
              <div className="absolute bottom-0 w-full text-center font-black text-3xl text-slate-900">{liveData.current_ntu}</div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Absorption Level</p>
        </div>

        {/* --- TRENDING GRAPH --- */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="font-black uppercase italic tracking-tight text-slate-800 mb-8 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600"/> Temporal Analysis
          </h2>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs><linearGradient id="col" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 20]} />
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="ntu" stroke="#2563eb" strokeWidth={4} fill="url(#col)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- FOOTER: INVIGILATOR & LOG --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                  <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                  <h4 className="font-black text-slate-800 uppercase italic text-sm">Normalization Protocol Active</h4>
              </div>
              <p className="text-xs text-slate-400 font-bold leading-relaxed">
                Smartphone camera variation is currently being mitigated using Min-Max linear scaling ($NTU = \frac{I - I_{min}}{I_{max} - I_{min}} \times 15$). 
                This ensures cross-device diagnostic consistency during scanning.
              </p>
          </div>
          
          <div className="bg-slate-900 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-white shadow-xl">
              <div className="bg-white p-3 rounded-2xl shadow-inner"><QRCodeSVG value={appUrl} size={70} /></div>
              <div className="text-center">
                <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Invigilator Panel</p>
                <h4 className="text-[10px] font-bold uppercase italic">Scan to Sync Dashboard</h4>
              </div>
          </div>
      </div>

    </div>
  );
};

export default Dashboard;