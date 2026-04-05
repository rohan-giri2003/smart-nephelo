import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { FileText, Download, Calendar, Activity } from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const q = query(collection(db, "analysis_results"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchReports();
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Diagnostic Reports</h1>
        <p className="text-slate-500 text-sm font-medium">Historical nephelometric analysis records</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white text-xs uppercase tracking-widest">
            <tr>
              <th className="p-4 font-bold">Patient Name</th>
              <th className="p-4 font-bold text-center">Result (NTU)</th>
              <th className="p-4 font-bold">Timestamp</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-semibold text-slate-700">{r.patientName || "Unknown"}</td>
                <td className="p-4 text-center font-black text-blue-600">{r.turbidity}</td>
                <td className="p-4 text-sm text-slate-500 flex items-center gap-2">
                  <Calendar size={14}/> {new Date(r.timestamp).toLocaleString()}
                </td>
                <td className="p-4">
                  <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Verified</span>
                </td>
                <td className="p-4">
                  <button className="text-slate-400 hover:text-blue-600 transition-colors"><Download size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && !loading && <div className="p-10 text-center text-slate-400 italic">No reports found in cloud.</div>}
      </div>
    </div>
  );
};

export default Reports;