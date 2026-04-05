import React, { useState, useEffect, useRef } from 'react';
import { getAllPatients } from '../services/patientService';
import { calculateTurbidity } from '../services/analysisService';
import { db } from '../services/firebase';
import { collection, addDoc } from "firebase/firestore";
import { Activity, Save, Target, User, RefreshCw, Camera } from 'lucide-react';

const Analysis = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [result, setResult] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchPatients = async () => {
      const data = await getAllPatients();
      setPatients(data);
    };
    fetchPatients();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      videoRef.current.srcObject = stream;
      setIsCameraOpen(true);
    } catch (err) {
      alert("Camera Access Denied. Check permissions.");
    }
  };

  const captureAndAnalyze = () => {
    if (!selectedPatient) return alert("Please select a patient record first.");
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Core Logic: Pixel Intensity from Green Channel
    const pixelData = ctx.getImageData(canvas.width/2 - 25, canvas.height/2 - 25, 50, 50).data;
    let totalGreen = 0;
    for (let i = 0; i < pixelData.length; i += 4) {
      totalGreen += pixelData[i + 1]; // Index 1 is Green
    }
    
    const avgIntensity = totalGreen / (pixelData.length / 4);
    const ntuValue = calculateTurbidity(avgIntensity);
    setResult(ntuValue);
  };

  const saveToCloud = async () => {
    if (!result || !selectedPatient) return;
    setIsSaving(true);
    try {
      const patientName = patients.find(p => p.id === selectedPatient)?.name;
      await addDoc(collection(db, "analysis_results"), {
        patientId: selectedPatient,
        patientName: patientName,
        turbidity: result,
        timestamp: new Date().toISOString(),
        unit: "NTU"
      });
      alert("Success: Result linked to " + patientName + "'s profile.");
      setResult(null); // Reset for next test
    } catch (e) {
      alert("Cloud Sync Error.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8 border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Nephelometric Analysis</h1>
        <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mt-1">Optical Scattering Quantification</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Input & Camera Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
              <User size={14}/> Target Subject
            </label>
            <select 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
            >
              <option value="">-- Select Patient from Cloud --</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden mb-6 border-4 border-white shadow-inner">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            {isCameraOpen && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Target size={100} className="text-blue-400 opacity-30 animate-pulse" />
                <div className="absolute border border-blue-400 w-32 h-32 rounded-full opacity-20"></div>
              </div>
            )}
          </div>

          {!isCameraOpen ? (
            <button onClick={startCamera} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
              <Camera size={20}/> INITIALIZE SENSOR
            </button>
          ) : (
            <button onClick={captureAndAnalyze} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-200 hover:bg-blue-700 transition-transform active:scale-95 tracking-tight">
              <Activity size={24}/> PERFORM QUANTIFICATION
            </button>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[450px]">
          {result ? (
            <div className="text-center w-full animate-in zoom-in-95">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Activity size={40} />
              </div>
              <span className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Analysis Outcome</span>
              <div className="text-8xl font-black text-slate-900 mt-4 mb-10 tracking-tighter">
                {result} <span className="text-2xl text-slate-300 font-medium tracking-normal">NTU</span>
              </div>
              <button 
                onClick={saveToCloud} 
                disabled={isSaving}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="animate-spin" /> : <Save size={22}/>} 
                SAVE TO PATIENT HISTORY
              </button>
            </div>
          ) : (
            <div className="text-slate-300 flex flex-col items-center italic">
              <div className="p-8 bg-slate-50 rounded-full mb-6">
                <Target size={60} className="opacity-10" />
              </div>
              <p className="font-semibold text-slate-400 not-italic uppercase text-[10px] tracking-[0.2em]">Optical Alignment Required</p>
              <p className="text-sm mt-2">Align sealed cartridge with camera focal point</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis;