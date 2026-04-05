import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, addDoc } from "firebase/firestore";
import { calculateTurbidity } from '../services/analysisService';
import { Activity, Save, RefreshCw, Camera, User } from 'lucide-react';

const Analysis = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [result, setResult] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // --- DATABASE SE DATA LENE WALA LOGIC ---
  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const querySnapshot = await getDocs(collection(db, "patients"));
      const patientList = [];
      querySnapshot.forEach((doc) => {
        // Har ek patient ki ID aur Data list mein daal rahe hain
        patientList.push({ id: doc.id, ...doc.data() });
      });
      setPatients(patientList);
      console.log("Total Patients Loaded:", patientList.length);
    } catch (e) {
      console.error("Firebase Error:", e);
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraOpen(true);
    } catch (err) {
      alert("Camera Error: Please check permissions.");
    }
  };

  const captureAndAnalyze = () => {
    if (!selectedPatient) return alert("Pehle patient select karo!");
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Simple logic for turbidity (ntu)
    const pixelData = ctx.getImageData(canvas.width/2 - 25, canvas.height/2 - 25, 50, 50).data;
    let totalGreen = 0;
    for (let i = 0; i < pixelData.length; i += 4) totalGreen += pixelData[i + 1];
    
    const avgIntensity = totalGreen / (pixelData.length / 4);
    const ntuValue = calculateTurbidity(avgIntensity);
    setResult(ntuValue);
  };

  const saveToCloud = async () => {
    if (!result || !selectedPatient) return;
    setIsSaving(true);
    try {
      const selectedPatientData = patients.find(p => p.id === selectedPatient);
      await addDoc(collection(db, "analysis_results"), {
        patientId: selectedPatient,
        patientName: selectedPatientData?.name || "Unknown",
        turbidity: result,
        timestamp: new Date().toISOString()
      });
      alert("Analysis Saved to Cloud! ✅");
      setResult(null);
    } catch (e) {
      alert("Save failed: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl lg:text-3xl font-black mb-8 text-slate-800 uppercase tracking-tight italic">Optical Sensor Analysis</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Registry Selection</label>
          <div className="relative mb-6">
            <select 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold appearance-none focus:ring-2 focus:ring-blue-500"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              disabled={loadingPatients}
            >
              <option value="">{loadingPatients ? 'Loading Database...' : '-- Select Patient --'}</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Age: {p.age})</option>
              ))}
            </select>
            <div className="absolute right-4 top-4 text-slate-400"><User size={20}/></div>
          </div>

          <div className="relative aspect-video bg-slate-900 rounded-[2rem] overflow-hidden mb-6 border-4 border-slate-100 shadow-inner">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {!isCameraOpen ? (
            <button onClick={startCamera} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 uppercase tracking-tight">
              <Camera size={20}/> Start Sensor
            </button>
          ) : (
            <button onClick={captureAndAnalyze} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-blue-200 uppercase tracking-tight">
              <Activity size={20}/> Analyze Sample
            </button>
          )}
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
          {result ? (
            <div className="w-full">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2">Quantified Value</p>
              <div className="text-8xl lg:text-9xl font-black text-slate-900 mb-4 tracking-tighter">
                {result}<span className="text-2xl text-slate-400 ml-2">NTU</span>
              </div>
              <button 
                onClick={saveToCloud} 
                disabled={isSaving}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 uppercase"
              >
                {isSaving ? <RefreshCw className="animate-spin"/> : <Save size={20}/>}
                {isSaving ? 'Saving...' : 'Sync to Records'}
              </button>
            </div>
          ) : (
            <div className="opacity-30">
              <Activity size={80} className="mx-auto mb-4 text-slate-300"/>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">Waiting for analysis...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis;