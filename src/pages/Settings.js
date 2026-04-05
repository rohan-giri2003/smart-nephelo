import React from 'react';
import { Settings as SettingsIcon, ShieldCheck, Target, Droplets } from 'lucide-react';

const Settings = () => {
  return (
    <div className="p-8 max-w-4xl animate-in fade-in duration-500">
      <h1 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3">
        <SettingsIcon className="text-blue-600" size={32} /> 
        System Calibration
      </h1>

      <div className="grid gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-lg">
            <Target size={20} className="text-blue-500"/> Optical Alignment
          </h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Ensure the smartphone camera is locked into the cartridge slot. 
            The 90-degree scattering angle must be fixed for accurate NTU readings 
            as per the nephelometric principle.
          </p>
          <div className="flex gap-4">
            <button className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all">
              Reset Alignment
            </button>
            <button className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
              Calibrate Zero (0 NTU)
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
              <Droplets size={20} className="text-blue-500"/> Sensor Sensitivity
            </h2>
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-black">ISO 800</span>
          </div>
          <input type="range" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-4" />
          <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Minimum Gain</span>
            <span>Maximum Gain</span>
          </div>
        </div>
        
        <div className="bg-blue-900 p-6 rounded-3xl text-white flex items-center gap-4">
          <ShieldCheck size={40} className="text-blue-400 opacity-50" />
          <div>
            <p className="font-bold text-sm">Hardware Sync Active</p>
            <p className="text-blue-200 text-xs opacity-80">Cartridge alignment verified via internal focal point detection.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;