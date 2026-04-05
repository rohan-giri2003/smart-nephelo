import React, { useState, useEffect, useRef } from 'react';
import { getAllPatients } from '../services/patientService';
import { calculateTurbidity } from '../services/analysisService';
import { db } from '../services/firebase';
import { collection, addDoc } from "firebase/firestore"; // Vercel safe import
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraOpen(true);
    } catch (err) {
      alert("Camera Access Denied.");
    }
  };

  const captureAndAnalyze = () => {
    if (!selectedPatient) return alert("Select a patient first.");
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
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
      const patientName = patients.find(p => p.id === selectedPatient)?.name;
      await addDoc(collection(db, "analysis_results"), {
        patientId: selectedPatient,
        patientName: patientName,
        turbidity: result,
        timestamp: new Date().toISOString()
      });
      alert("Result Saved!");
      setResult(null);
    } catch (e) {
      alert("Sync Error.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black mb-8 text-slate-800 uppercase tracking-tighter">Diagnostic Lab</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <select className="w-full p-4 bg-slate-50 border rounded-2xl mb-6 font-bold" value={selectedPatient} onChange={(e)=>setSelectedPatient(e.target.value)}>
            <option value="">-- Choose Patient --</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden mb-6">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          {!isCameraOpen ? (
            <button onClick={startCamera} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">START SENSOR</button>
          ) : (
            <button onClick={captureAndAnalyze} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold">ANALYZE SAMPLE</button>
          )}
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
          {result ? (
            <div className="text-center w-full">
              <div className="text-8xl font-black text-slate-900 mb-6">{result} <span className="text-xl">NTU</span></div>
              <button onClick={saveToCloud} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                {isSaving ? <RefreshCw className="animate-spin"/> : <Save/>} SAVE TO CLOUD
              </button>
            </div>
          ) : <p className="text-slate-400 italic">Waiting for analysis...</p>}
        </div>
      </div>
    </div>
  );
};

export default Analysis;