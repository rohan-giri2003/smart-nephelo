import React, { useState, useEffect } from 'react';
import { rtdb } from '../services/firebase';
import { ref, onValue } from "firebase/database";
import { QRCodeSVG } from 'qrcode.react';
import { Activity, Share2, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [liveData, setLiveData] = useState({ current_ntu: 0, status: 'IDLE' });
  const appUrl = window.location.href; 

  useEffect(() => {
    const liveRef = ref(rtdb, 'live_telemetry');
    onValue(liveRef, (snapshot) => {
      if (snapshot.exists()) setLiveData(snapshot.val());
    });
  }, []);

  const percentage = Math.min((liveData.current_ntu / 15) * 100, 100);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LIVE SENSOR WIDGET */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-50 relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-lg"><Activity size={28}/></div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-800">Live Telemetry</h2>
            </div>
            <div className="text-[10px] font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-full border">REALTIME SYNC</div>
          </div>
          
          <div className="flex flex-col items-center py-6">
            <div className="relative w-72 h-36 overflow-hidden mb-8">
              <div className="absolute top-0 left-0 w-72 h-72 border-[25px] border-slate-50 rounded-full"></div>
              <div 
                className={`absolute top-0 left-0 w-72 h-72 border-[25px] rounded-full transition-all duration-1000`}
                style={{ 
                  borderColor: liveData.current_ntu > 5 ? '#ef4444' : '#2563eb',
                  clipPath: `inset(0 0 50% 0)`,
                  transform: `rotate(${percentage * 1.8}deg)`
                }}
              ></div>
              <div className="absolute bottom-0 left-0 w-full text-center">
                <span className="text-6xl font-black text-slate-900 tracking-tighter">{liveData.current_ntu}</span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">NTU Level</p>
              </div>
            </div>
            <div className={`px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border ${liveData.current_ntu > 5 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
               Condition: {liveData.status}
            </div>
          </div>
        </div>

        {/* INVIGILATOR QR ACCESS */}
        <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl text-center text-white flex flex-col items-center justify-center">
          <div className="bg-white p-5 rounded-[2.5rem] mb-8 shadow-2xl">
            <QRCodeSVG value={appUrl} size={150} level="H" />
          </div>
          <div className="flex items-center gap-2 mb-4 text-blue-400">
             <Share2 size={18} />
             <h3 className="font-black uppercase tracking-[0.2em] text-xs">Invigilator Access</h3>
          </div>
          <p className="text-[10px] text-slate-500 font-bold px-6 leading-relaxed mb-8">
            Scan this QR code to view the live synchronized dashboard on your personal device.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;