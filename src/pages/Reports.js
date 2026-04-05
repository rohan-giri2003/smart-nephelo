import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { FileText, Calendar, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // "analysis_results" collection se data nikalna
        const q = query(collection(db, "analysis_results"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        setReports(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const downloadReportPDF = (report) => {
    const doc = new jsPDF();
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("SMART-NEPHELO LAB REPORT", 105, 25, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.autoTable({
      startY: 50,
      head: [['Field', 'Details']],
      body: [
        ['Patient Name', report.patientName],
        ['Turbidity (NTU)', report.turbidity],
        ['Status', report.turbidity > 5 ? 'HIGH (CRITICAL)' : 'NORMAL'],
        ['Date/Time', new Date(report.timestamp).toLocaleString()]
      ],
    });
    doc.save(`${report.patientName}_Record.pdf`);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-xl">
          <FileText size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Diagnostic Reports</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Historical cloud analysis records</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Patient Name</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Result</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Status</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Timestamp</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="5" className="p-20 text-center font-bold text-slate-300">Syncing with cloud...</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan="5" className="p-20 text-center font-bold text-slate-300 italic">No reports found in cloud. Run an analysis first.</td></tr>
            ) : reports.map((report) => (
              <tr key={report.id} className="hover:bg-slate-50/50 transition-all">
                <td className="p-6 font-black text-slate-700">{report.patientName}</td>
                <td className="p-6">
                  <span className="text-xl font-black text-slate-900">{report.turbidity}</span>
                  <span className="text-[10px] font-bold text-slate-400 ml-1">NTU</span>
                </td>
                <td className="p-6">
                  {report.turbidity > 5 ? (
                    <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest bg-red-50 py-1 px-3 rounded-full w-fit">
                      <AlertCircle size={14} /> Critical
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 py-1 px-3 rounded-full w-fit">
                      <CheckCircle2 size={14} /> Normal
                    </div>
                  )}
                </td>
                <td className="p-6 text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-2"><Calendar size={14}/> {new Date(report.timestamp).toLocaleDateString()}</div>
                </td>
                <td className="p-6">
                  <button 
                    onClick={() => downloadReportPDF(report)}
                    className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all"
                  >
                    <Download size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;