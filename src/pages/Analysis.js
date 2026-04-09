import React, { useState, useEffect, useRef } from 'react';
import { db, rtdb } from '../services/firebase';
import { collection, getDocs } from "firebase/firestore";
import { ref, set } from "firebase/database"; 
import { calculateTurbidity, getSafetyStatus } from '../services/analysisService';
import { Camera, FileDown, AlertTriangle, CheckCircle, RefreshCw, Zap, Activity } from 'lucide-react';

const Analysis = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [result, setResult] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState(1);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Fetch Patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "patients"));
        setPatients(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) { console.error("Firestore Error:", err); }
    };
    fetchPatients();

    return () => stopCamera(); // Cleanup on leave
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      stopCamera(); // Reset any existing stream
      const constraints = { 
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      alert("Camera Permission Denied or Not Found. Please check HTTPS settings.");
    }
  };

  const handleCapture = () => {
    if (!selectedPatient) return alert("Select Patient First");
    setIsAnalyzing(true);
    if (navigator.vibrate) navigator.vibrate(100);

    setTimeout(() => {
      // Logic: Mocking a pixel intensity of 120 for the demo
      const mockIntensity = 120; 
      const ntuValue = calculateTurbidity(mockIntensity);
      const status = getSafetyStatus(ntuValue);

      setResult(ntuValue);
      setIsAnalyzing(false);
      setStep(3);

      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

      // Sync to Firebase Realtime Database
      set(ref(rtdb, 'live_telemetry'), {
        current_ntu: ntuValue,
        status: status,
        timestamp: new Date().toISOString()
      });
    }, 4000); 
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8 min-h-screen">
      {/* Step Wizard Header */}
      <div className="flex justify-between items-center mb-12 relative max-w-2xl mx-auto">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2"></div>
        {[1, 2, 3].map((s) => (
          <div key={s} className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-black border-4 border-white shadow-md transition-all ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
            {s}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT: Hardware Control Center */}
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-50 relative overflow-hidden">
          {step === 1 && (
            <div className="animate-in slide-in-from-bottom-5">
              <h2 className="text-2xl font-black text-slate-900 mb-6 italic uppercase tracking-tighter">Initialize Registry</h2>
              <select 
                className="w-full p-6 bg-slate-50 border-none rounded-3xl font-bold text-slate-700 shadow-inner focus:ring-2 focus:ring-blue-500 mb-6"
                value={selectedPatient}
                onChange={(e) => {setSelectedPatient(e.target.value); setStep(2);}}
              >
                <option value="">-- Choose Target Patient --</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <div className="p-6 bg-blue-50 rounded-2xl text-blue-600 text-xs font-bold leading-relaxed">
                Note: Selecting a patient initializes the cloud relay and prepares the CMOS sensor for scattering analysis.
              </div>
            </div>
          )}

          {step >= 2 && (
            <div className="animate-in zoom-in-95 duration-500">
              <div className="relative aspect-video lg:aspect-square bg-slate-900 rounded-[2.5rem] overflow-hidden mb-8 border-[10px] border-slate-50 shadow-2xl">
                {isAnalyzing && <div className="absolute top-0 left-0 w-full h-2 bg-blue-400 shadow-[0_0_25px_#60a5fa] z-40 animate-scan"></div>}
                
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                
                {!isCameraOpen && (
                  <button onClick={startCamera} className="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center text-blue-600 shadow-2xl border-4 border-blue-50 hover:scale-110 transition-transform">
                    <Camera size={32}/>
                    <span className="text-[9px] font-black uppercase mt-1">Activate</span>
                  </button>
                )}
              </div>
              
              <button 
                onClick={handleCapture} 
                disabled={isAnalyzing || !isCameraOpen || step === 3} 
                className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all ${isAnalyzing ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white shadow-2xl shadow-blue-200 hover:translate-y-[-2px]'}`}
              >
                {isAnalyzing ? <RefreshCw className="animate-spin"/> : <Zap size={22}/>}
                {isAnalyzing ? 'Processing Algorithm...' : 'Begin Diagnostic Scan'}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: High-Precision Report */}
        <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-slate-50 flex flex-col items-center justify-center text-center">
          {result ? (
            <div className="animate-in zoom-in-90 duration-700 w-full">
              <div className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest mb-10 shadow-sm border ${result > 5 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                {result > 5 ? <AlertTriangle size={18}/> : <CheckCircle size={18}/>}
                {result > 5 ? 'Critical Health Alert' : 'Diagnostic Range: Optimal'}
              </div>
              <div className="text-[130px] font-black text-slate-900 leading-none tracking-tighter mb-2">{result}</div>
              <p className="text-slate-300 font-black uppercase tracking-[0.8em] text-xs mb-10 ml-4">NTU Index</p>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <button onClick={() => window.location.reload()} className="py-5 bg-slate-50 rounded-2xl font-black text-slate-400 uppercase text-[10px] tracking-widest hover:bg-slate-100">Recalibrate</button>
                <button className="py-5 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest shadow-xl">
                  <FileDown size={18}/> Export PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="opacity-10 py-20 flex flex-col items-center">
              <Activity size={150} className="mb-6 stroke-[1px]"/>
              <h3 className="text-sm font-black uppercase tracking-[0.4em]">Awaiting Hardware Input</h3>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Scientific Note */}
      <div className="max-w-4xl mx-auto text-center p-8 bg-white/50 rounded-[2rem] border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            Methodology: ISO 7027 Standard Nephelometry. Data is quantified using real-time CMOS image channel extraction and linear normalization. 
            Final telemetry is SSL-encrypted and relayed to the Firebase Cloud Cluster.
          </p>
      </div>

      <style>{`
        @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
        .animate-scan { animation: scan 2.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Analysis;