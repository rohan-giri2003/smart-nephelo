import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Analysis from './pages/Analysis';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="flex flex-col lg:flex-row bg-slate-50 min-h-screen font-sans overflow-x-hidden">
        <Sidebar />
        {/* Main Content Area: Padding adjust for mobile header and desktop sidebar */}
        <main className="flex-1 w-full lg:ml-64 pt-20 lg:pt-0 min-h-screen transition-all duration-300">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;