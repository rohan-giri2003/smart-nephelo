import React, { useState, useEffect, useRef } from 'react';
import { db, rtdb } from '../services/firebase';
import { collection, getDocs, addDoc } from "firebase/firestore";
import { ref, set } from "firebase/database"; 
import { calculateTurbidity } from '../services/analysisService';
import { Activity, Save, Camera, User, FileDown, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Analysis = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [result, setResult] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Fetch all patients from Firestore
  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true);
      try {
        const querySnapshot = await getDocs(collection(db, "patients"));
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPatients(list);
      } catch (e) {
        console.error("Error fetching patients:", e);
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraOpen(true);
    } catch (err) {
      alert("Camera access denied!");
    }
  };

  const captureAndAnalyze = () => {
    if (!selectedPatient) return alert("Please select a patient first!");
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Core Analysis Logic
    const pixelData = ctx.getImageData(canvas.width/2 - 25, canvas.height/2 - 25, 50, 50).data;
    let totalGreen = 0;
    for (let i = 0; i < pixelData.length; i += 4) totalGreen += pixelData[i + 1];
    const avgIntensity = totalGreen / (pixelData.length / 4);
    
    // Calculate NTU
    const ntuValue = calculateTurbidity(avgIntensity);
    setResult(ntuValue);

    // 🚀 WIRELESS BRIDGE: Update Realtime Database for Hardware/IoT
    set(ref(rtdb, 'live_telemetry'), {
      current_ntu: ntuValue,
      status: ntuValue > 5 ? "CRITICAL" : "NORMAL",
      last_updated: new Date().toISOString()
    });
  };

  const generatePDF = () => {
    const patient = patients.find(p => p.id === selectedPatient);
    const doc = new jsPDF();
    
    // PDF Styling
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("SMART-NEPHELO LAB REPORT", 105, 25, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Report ID: SN-${Math.floor(Math.random()*10000)}`, 15, 50);
    doc.text(`Date: ${new Date().toLocaleString()}`, 150, 50);

    doc.autoTable({
      startY: 60,
      head: [['Parameter', 'Patient Information']],
      body: [
        ['Name', patient?.name || 'N/A'],
        ['Age', patient?.age || 'N/A'],
        ['Gender', patient?.gender || 'N/A'],
        ['Contact', patient?.contact || 'N/A'],
        ['Turbidity Reading', `${result} NTU`],
        ['Safety Status', result > 5 ? 'ABNORMAL / UNSAFE' : 'NORMAL / SAFE']
      ],
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Note: This is a smartphone-based nephelometric screening result.", 15, doc.lastAutoTable.finalY + 20);
    doc.save(`${patient?.name || 'Patient'}_Analysis_Report.pdf`);
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl lg:text-3xl font-black mb-8 text-slate-800 uppercase tracking-tight italic">Optical Sensor Analysis</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Input & Camera */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Registry Selection</label>
          <select 
            className="w-full p-4 mb-6 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500"
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
          >
            <option value="">{loadingPatients ? 'Loading Database...' : '-- Select Patient --'}</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.age}Y)</option>)}
          </select>

          <div className="relative aspect-video bg-slate-900 rounded-[2rem] overflow-hidden mb-6 border-4 border-slate-100 shadow-inner">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {!isCameraOpen ? (
            <button onClick={startCamera} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 uppercase">
              <Camera size={20}/> Initialize Sensor
            </button>
          ) : (
            <button onClick={captureAndAnalyze} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-blue-200 uppercase">
              <Activity size={20}/> Capture & Quantify
            </button>
          )}
        </div>

        {/* Right: Smart Result & PDF */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center flex flex-col justify-center min-h-[450px]">
          {result ? (
            <div className="animate-in zoom-in duration-300">
              {/* SMART ALERT BOX */}
              <div className={`p-4 mb-6 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm ${result > 5 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                {result > 5 ? <AlertTriangle className="animate-bounce" size={20}/> : <CheckCircle size={20}/>}
                {result > 5 ? 'High Turbidity / Critical' : 'Safe / Within Range'}
              </div>

              <div className="text-9xl font-black text-slate-900 mb-2 tracking-tighter">
                {result}<span className="text-2xl text-slate-400 ml-2">NTU</span>
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-10">Nephelometric Turbidity Units</p>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={generatePDF} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all">
                  <FileDown size={22}/> GET REPORT
                </button>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
                  <Save size={22}/> SYNC CLOUD
                </button>
              </div>
            </div>
          ) : (
            <div className="opacity-20">
              <Activity size={100} className="mx-auto mb-4"/>
              <p className="font-black uppercase tracking-[0.3em]">Hardware Ready</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis;