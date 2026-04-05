import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc } from "firebase/firestore";
import { UserPlus, Save, RefreshCw } from 'lucide-react';

const Patients = () => {
  const [formData, setFormData] = useState({ name: '', contact: '', age: '', gender: 'Male' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Firebase mein "patients" collection mein data dalna
      await addDoc(collection(db, "patients"), {
        ...formData,
        timestamp: new Date().toISOString()
      });
      alert("Patient Registered Successfully! 🚀");
      setFormData({ name: '', contact: '', age: '', gender: 'Male' });
    } catch (error) {
      console.error("Error: ", error);
      alert("Error saving data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-600 rounded-2xl"><UserPlus /></div>
            <h2 className="text-2xl font-black tracking-tight">New Patient Enrollment</h2>
          </div>
          <p className="text-slate-400 text-sm">Enroll new subjects for nephelometric screening</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
              <input 
                type="text" required
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Rohan"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Contact</label>
              <input 
                type="tel" required
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500"
                placeholder="+91..."
                value={formData.contact}
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-200"
          >
            {loading ? <RefreshCw className="animate-spin" /> : <Save />}
            {loading ? 'SYNCING...' : 'ENROLL SUBJECT'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Patients;