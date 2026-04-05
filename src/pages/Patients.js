import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc } from "firebase/firestore";
import { UserPlus, Save, RefreshCw } from 'lucide-react';

const Patients = () => {
  // 1. Saare fields ko state mein add kiya
  const [formData, setFormData] = useState({ 
    name: '', 
    contact: '', 
    age: '', 
    gender: 'Male' 
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 2. Firestore mein pura data bhej rahe hain
      await addDoc(collection(db, "patients"), {
        name: formData.name,
        contact: formData.contact,
        age: formData.age,
        gender: formData.gender,
        timestamp: new Date().toISOString()
      });
      
      alert("Patient Registered Successfully! 🚀");
      // Form ko reset karna
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
            <h2 className="text-2xl font-black tracking-tight uppercase">Patient Registry</h2>
          </div>
          <p className="text-slate-400 text-sm">Enroll new subjects for nephelometric screening</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FULL NAME */}
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

            {/* CONTACT */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Contact Number</label>
              <input 
                type="tel" required
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500"
                placeholder="+91"
                value={formData.contact}
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
              />
            </div>

            {/* AGE */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Age</label>
              <input 
                type="number" required
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500"
                placeholder="Years"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </div>

            {/* GENDER */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Gender</label>
              <select 
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-200 uppercase tracking-tighter"
          >
            {loading ? <RefreshCw className="animate-spin" /> : <Save />}
            {loading ? 'Syncing with Cloud...' : 'Enroll Subject'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Patients;