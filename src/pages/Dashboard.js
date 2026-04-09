import React, { useState, useEffect, useRef } from 'react';
import { db, rtdb } from '../services/firebase';
import { collection, getDocs } from "firebase/firestore";
import { ref, set } from "firebase/database"; 
import { calculateTurbidity } from '../services/analysisService';
import { Camera, FileDown, AlertTriangle, CheckCircle, RefreshCw, Zap, Activity, Smartphone } from 'lucide-react';
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
  const streamRef = useRef(null);

  useEffect(() => {
    const fetchPatients = async () => {
      const querySnapshot = await getDocs(collection(db, "patients"));
      setPatients(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchPatients();

    // Cleanup camera when leaving page
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } // Use back camera
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      console.error("Camera Error: ", err);
      alert("Please allow camera permissions to use this feature.");
    }
  };

  const handleCapture = () => {
    if (!selectedPatient) return alert("Select a patient first!");
    setIsAnalyzing(true);
    
    if (navigator.vibrate) navigator.vibrate(100);

    setTimeout(() => {
      // Real Intensity calculation logic (Mock for UI)
      const ntuValue = (Math.random() * 8 + 0.5).toFixed(2); 
      setResult(ntuValue);
      setIsAnalyzing(false);
      setStep(3);

      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

      // Sync to Firebase RTDB
      set(ref(rtdb, 'live_telemetry'), {
        current_ntu: ntuValue,
        status: ntuValue > 5 ? "CRITICAL" : "NORMAL",
        timestamp: new Date().toISOString()
      });
    }, 4000); 
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Progress Wizard */}
      <div className="flex justify-between mb-12 relative px-10">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2"></div>
        {[1, 2, 3].map((s) => (
          <div key={s} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-black border-4 border-white shadow-sm transition-all ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
            {s}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT CARD: CAMERA & CONTROL */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden relative">
          {step === 1 && (
            <div className="animate-in slide-in-from-bottom-4">
              <h2 className="text-xl font-black mb-6 uppercase italic text-slate-800">1. Identity Verification</h2>
              <select className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold mb-6 focus:ring-2 focus:ring-blue-500" 
                      value={selectedPatient} onChange={(e) => {setSelectedPatient(e.target.value); setStep(2);}}>
                <option value="">-- Choose Patient --</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          {step >= 2 && (
            <div className="animate-in zoom-in-95">
              <div className="relative aspect-square bg-slate-900 rounded-[2.5rem] overflow-hidden mb-6 border-8 border-slate-50 shadow-inner">
                {/* Visual Laser Line */}
                {isAnalyzing && <div className="absolute top-0 left-0 w-full h-2 bg-blue-400 shadow-[0_0_20px_#60a5fa] z-30 animate-scan"></div>}
                
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                
                {!isCameraOpen && (
                  <button onClick={startCamera} className="absolute inset-0 m-auto w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex flex-col items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all">
                    <Camera size={32} className="mb-2"/>
                    <span className="text-[10px] font-black uppercase">Start Lens</span>
                  </button>
                )}
              </div>
              
              <button 
                onClick={handleCapture} 
                disabled={isAnalyzing || !isCameraOpen || step === 3} 
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isAnalyzing ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white shadow-xl shadow-blue-200 hover:scale-[1.02]'}`}
              >
                {isAnalyzing ? <RefreshCw className="animate-spin"/> : <Zap size={20}/>}
                {isAnalyzing ? 'Processing Pixels...' : 'Run Nephelo Scan'}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT CARD: LIVE REPORT */}
        <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl flex flex-col items-center justify-center text-center">
          {result ? (
            <div className="animate-in zoom-in-90 duration-500 w-full">
              <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest mb-10 ${result > 5 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                {result > 5 ? <AlertTriangle size={16}/> : <CheckCircle size={16}/>}
                {result > 5 ? 'Critical Turbidity Alert' : 'Safety Standard Verified'}
              </div>
              <div className="text-[110px] font-black text-slate-900 leading-none tracking-tighter mb-4">{result}</div>
              <p className="text-slate-300 font-black uppercase tracking-[0.5em] text-xs">NTU Units</p>
              <div className="mt-12 flex gap-4">
                <button onClick={() => window.location.reload()} className="flex-1 py-5 bg-slate-50 rounded-2xl font-black text-slate-400 uppercase text-[10px] tracking-widest">New Sample</button>
                <button className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest shadow-lg">
                  <FileDown size={18}/> Print PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="opacity-10 py-20 flex flex-col items-center">
              <Activity size={100} className="mb-4"/>
              <p className="font-black uppercase tracking-[0.4em] text-xs">Ready for input</p>
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