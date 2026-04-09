import React, { useState, useEffect, useRef } from 'react';
import { db, rtdb } from '../services/firebase';
import { collection, getDocs } from "firebase/firestore";
import { ref, set } from "firebase/database"; 
import { Camera, FileDown, AlertTriangle, CheckCircle, RefreshCw, Zap, Activity } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Analysis = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [result, setResult] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState(1);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchPatients = async () => {
      const querySnapshot = await getDocs(collection(db, "patients"));
      setPatients(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchPatients();
  }, []);

  const handleCapture = () => {
    setIsAnalyzing(true);
    if (navigator.vibrate) navigator.vibrate(100);

    setTimeout(() => {
      const ntuValue = (Math.random() * 10 + 1).toFixed(2); 
      setResult(ntuValue);
      setIsAnalyzing(false);
      setStep(3);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

      set(ref(rtdb, 'live_telemetry'), {
        current_ntu: ntuValue,
        status: ntuValue > 5 ? "CRITICAL" : "NORMAL",
        timestamp: new Date().toISOString()
      });
    }, 3000); 
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Progress Steps */}
      <div className="flex justify-between mb-12 relative px-10">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
        {[1, 2, 3].map((s) => (
          <div key={s} className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-black border-4 border-white shadow-sm transition-all ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
            {s}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl">
          {step === 1 && (
            <div className="animate-in slide-in-from-bottom-4">
              <h2 className="text-xl font-black mb-6 uppercase italic tracking-tighter">1. Select Patient</h2>
              <select className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold mb-6" 
                      value={selectedPatient} onChange={(e) => {setSelectedPatient(e.target.value); setStep(2);}}>
                <option value="">-- Choose Patient --</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          {step >= 2 && (
            <div className="animate-in zoom-in-95">
              <div className="relative aspect-square bg-slate-900 rounded-[2.5rem] overflow-hidden mb-8 border-8 border-slate-50">
                {isAnalyzing && <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-400 shadow-[0_0_20px_#60a5fa] z-30 animate-scan"></div>}
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60" />
                {!isCameraOpen && (
                  <button onClick={() => setIsCameraOpen(true)} className="absolute inset-0 m-auto w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-2xl">
                    <Camera size={28}/>
                  </button>
                )}
              </div>
              <button onClick={handleCapture} disabled={isAnalyzing || step === 3} 
                      className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 ${isAnalyzing ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white shadow-xl shadow-blue-200'}`}>
                {isAnalyzing ? <RefreshCw className="animate-spin"/> : <Zap size={20}/>}
                {isAnalyzing ? 'Scanning...' : 'Start Test'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl flex flex-col items-center justify-center min-h-[450px]">
          {result ? (
            <div className="text-center w-full animate-in zoom-in-90 duration-500">
              <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest mb-8 ${result > 5 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {result > 5 ? <AlertTriangle size={16}/> : <CheckCircle size={16}/>}
                {result > 5 ? 'High Turbidity' : 'Safe Grade'}
              </div>
              <div className="text-[110px] font-black text-slate-900 tracking-tighter leading-none">{result}<span className="text-2xl text-slate-300 ml-2">NTU</span></div>
            </div>
          ) : (
            <div className="opacity-10 text-center">
              <Activity size={120} className="mx-auto"/>
              <p className="mt-4 font-black uppercase tracking-[0.5em]">Standby</p>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
        .animate-scan { animation: scan 2s linear infinite; }
      `}</style>
    </div>
  );
};

export default Analysis;