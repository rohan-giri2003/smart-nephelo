import React, { useState } from 'react';
import { UserPlus, User, Phone, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { addPatient } from '../services/patientService';

const Patients = () => {
  const [formData, setFormData] = useState({ name: '', age: '', gender: 'Male', contact: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addPatient(formData);
      alert("Success! Patient record synced to Cloud.");
      setFormData({ name: '', age: '', gender: 'Male', contact: '' });
    } catch (error) {
      alert("Error: Cloud sync failed. Check Firebase config.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Patient Registry</h1>
        <p className="text-slate-500 text-sm">Enroll new subjects for nephelometric screening</p>
      </header>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-6 text-white flex items-center gap-3">
          <UserPlus size={24} className="text-blue-400" />
          <h2 className="text-lg font-semibold tracking-tight">New Subject Enrollment</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><User size={14}/> Full Name</label>
            <input 
              type="text" required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:bg-white"
              placeholder="e.g. Rohan"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Phone size={14}/> Contact Number</label>
            <input 
              type="tel" required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none focus:bg-white"
              placeholder="+91"
              value={formData.contact}
              onChange={(e) => setFormData({...formData, contact: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Calendar size={14}/> Age</label>
            <input 
              type="number" required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none focus:bg-white"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gender Orientation</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="md:col-span-2 mt-4 bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Sync to Cloud Registry"} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Patients;