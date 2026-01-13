
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar as CalendarIcon, 
  Save, 
  FileText, 
  PieChart,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2
} from 'lucide-react';
import { STUDENTS, CLASS_NAME } from './constants';
import { AttendanceStatus, DailyAttendance, AttendanceRecord, AttendanceSummary } from './types';
import StatsCard from './components/StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie } from 'recharts';

const STORAGE_KEY = 'attendance_data_4b';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [allAttendance, setAllAttendance] = useState<DailyAttendance[]>([]);
  const [currentRecords, setCurrentRecords] = useState<AttendanceRecord[]>([]);
  const [view, setView] = useState<'daily' | 'history' | 'stats'>('daily');

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData) as DailyAttendance[];
      setAllAttendance(parsed);
      
      const todayRecord = parsed.find(a => a.date === currentDate);
      if (todayRecord) {
        setCurrentRecords(todayRecord.records);
      } else {
        // Initialize with default values (present)
        setCurrentRecords(STUDENTS.map(s => ({ studentId: s.id, status: 'present' })));
      }
    } else {
      setCurrentRecords(STUDENTS.map(s => ({ studentId: s.id, status: 'present' })));
    }
  }, []);

  // Sync records when date changes
  useEffect(() => {
    const recordForDate = allAttendance.find(a => a.date === currentDate);
    if (recordForDate) {
      setCurrentRecords(recordForDate.records);
    } else {
      setCurrentRecords(STUDENTS.map(s => ({ studentId: s.id, status: 'present' })));
    }
  }, [currentDate, allAttendance]);

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setCurrentRecords(prev => 
      prev.map(r => r.studentId === studentId ? { ...r, status } : r)
    );
  };

  const handleSave = () => {
    const newEntry: DailyAttendance = {
      date: currentDate,
      records: currentRecords,
      submittedAt: new Date().toISOString()
    };

    const existingIndex = allAttendance.findIndex(a => a.date === currentDate);
    let updatedAll;
    if (existingIndex > -1) {
      updatedAll = [...allAttendance];
      updatedAll[existingIndex] = newEntry;
    } else {
      updatedAll = [...allAttendance, newEntry];
    }

    setAllAttendance(updatedAll);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAll));
    alert(`Rekod kehadiran ${currentDate} telah disimpan berjaya!`);
  };

  const summary: AttendanceSummary = useMemo(() => {
    const present = currentRecords.filter(r => r.status === 'present').length;
    const absent = currentRecords.filter(r => r.status === 'absent').length;
    const late = currentRecords.filter(r => r.status === 'late').length;
    const total = STUDENTS.length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

    return { total, present, absent, late, percentage };
  }, [currentRecords]);

  const chartData = useMemo(() => [
    { name: 'Hadir', value: summary.present, color: '#22c55e' },
    { name: 'Lewat', value: summary.late, color: '#eab308' },
    { name: 'Tidak Hadir', value: summary.absent, color: '#ef4444' },
  ], [summary]);

  const changeDate = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const exportToCSV = () => {
    if (allAttendance.length === 0) return alert("Tiada data untuk dieksport.");
    
    let csv = "Tarikh,Nama Murid,Jantina,Status\n";
    allAttendance.forEach(day => {
      day.records.forEach(rec => {
        const student = STUDENTS.find(s => s.id === rec.studentId);
        csv += `${day.date},"${student?.name}",${student?.gender},${rec.status}\n`;
      });
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `kehadiran_4b_semua.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Users size={28} />
                Sistem Kehadiran {CLASS_NAME}
              </h1>
              <p className="text-blue-100 text-sm opacity-90">Pengurusan Kehadiran Harian & Laporan</p>
            </div>
            
            <div className="flex items-center bg-blue-800 rounded-lg p-1">
              <button 
                onClick={() => setView('daily')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'daily' ? 'bg-white text-blue-700 shadow-sm' : 'hover:bg-blue-700'}`}
              >
                Harian
              </button>
              <button 
                onClick={() => setView('stats')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'stats' ? 'bg-white text-blue-700 shadow-sm' : 'hover:bg-blue-700'}`}
              >
                Statistik
              </button>
              <button 
                onClick={() => setView('history')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'history' ? 'bg-white text-blue-700 shadow-sm' : 'hover:bg-blue-700'}`}
              >
                Arkib
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full p-4 md:p-6 space-y-6">
        {view === 'daily' && (
          <>
            {/* Date & Quick Stats */}
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/3 space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                      <CalendarIcon size={18} className="text-blue-500" />
                      Pilih Tarikh
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200">
                      <ChevronLeft size={20} className="text-slate-600" />
                    </button>
                    <input 
                      type="date" 
                      value={currentDate}
                      onChange={(e) => setCurrentDate(e.target.value)}
                      className="flex-grow p-2 border border-slate-200 rounded-lg text-center font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200">
                      <ChevronRight size={20} className="text-slate-600" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatsCard 
                    label="Hadir" 
                    value={summary.present} 
                    colorClass="bg-green-500 text-green-600" 
                    icon={<CheckCircle size={20} />} 
                  />
                  <StatsCard 
                    label="Tiada" 
                    value={summary.absent} 
                    colorClass="bg-red-500 text-red-600" 
                    icon={<XCircle size={20} />} 
                  />
                  <StatsCard 
                    label="Lewat" 
                    value={summary.late} 
                    colorClass="bg-yellow-500 text-yellow-600" 
                    icon={<Clock size={20} />} 
                  />
                  <StatsCard 
                    label="Peratus" 
                    value={`${summary.percentage}%`} 
                    colorClass="bg-blue-500 text-blue-600" 
                    icon={<PieChart size={20} />} 
                  />
                </div>
                
                <button 
                  onClick={handleSave}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Save size={20} />
                  Simpan Rekod
                </button>
              </div>

              {/* Attendance Table */}
              <div className="lg:w-2/3 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700">Senarai Nama Murid</h3>
                  <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {STUDENTS.length} MURID
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-4 py-3 w-12">Bil.</th>
                        <th className="px-4 py-3">Nama</th>
                        <th className="px-4 py-3 w-16">Jnt.</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {STUDENTS.map((student, idx) => {
                        const record = currentRecords.find(r => r.studentId === student.id);
                        return (
                          <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-slate-400 font-mono">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-slate-800 uppercase leading-tight">{student.name}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${student.gender === 'L' ? 'bg-indigo-100 text-indigo-700' : 'bg-pink-100 text-pink-700'}`}>
                                {student.gender}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-1">
                                <button 
                                  onClick={() => handleStatusChange(student.id, 'present')}
                                  className={`p-1.5 rounded-lg transition-all ${record?.status === 'present' ? 'bg-green-500 text-white shadow-inner' : 'bg-slate-100 text-slate-400 hover:bg-green-100'}`}
                                  title="Hadir"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button 
                                  onClick={() => handleStatusChange(student.id, 'late')}
                                  className={`p-1.5 rounded-lg transition-all ${record?.status === 'late' ? 'bg-yellow-500 text-white shadow-inner' : 'bg-slate-100 text-slate-400 hover:bg-yellow-100'}`}
                                  title="Lewat"
                                >
                                  <Clock size={18} />
                                </button>
                                <button 
                                  onClick={() => handleStatusChange(student.id, 'absent')}
                                  className={`p-1.5 rounded-lg transition-all ${record?.status === 'absent' ? 'bg-red-500 text-white shadow-inner' : 'bg-slate-100 text-slate-400 hover:bg-red-100'}`}
                                  title="Tidak Hadir"
                                >
                                  <XCircle size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {view === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Ringkasan Statistik</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
                <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase">Status Hari Ini ({currentDate})</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80 flex flex-col">
                <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase">Peratusan Kehadiran</h3>
                <div className="flex-grow flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-slate-800">{summary.percentage}%</span>
                    <span className="text-xs text-slate-400 font-medium uppercase">Hadir</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase">Trend Kehadiran (Hari Terakhir Diisi)</h3>
               <div className="h-64">
                {allAttendance.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={allAttendance.slice(-7).map(a => ({
                      date: a.date,
                      hadir: a.records.filter(r => r.status === 'present').length
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, STUDENTS.length]} />
                      <Tooltip />
                      <Bar dataKey="hadir" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 italic">
                    Belum ada data sejarah.
                  </div>
                )}
               </div>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Arkib Rekod Kehadiran</h2>
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
              >
                <Download size={16} />
                Eksport CSV
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Tarikh</th>
                    <th className="px-6 py-4">Hadir</th>
                    <th className="px-6 py-4">Lewat</th>
                    <th className="px-6 py-4">Tiada</th>
                    <th className="px-6 py-4">Disimpan Pada</th>
                    <th className="px-6 py-4 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allAttendance.length > 0 ? (
                    allAttendance.sort((a,b) => b.date.localeCompare(a.date)).map((day) => {
                      const present = day.records.filter(r => r.status === 'present').length;
                      const absent = day.records.filter(r => r.status === 'absent').length;
                      const late = day.records.filter(r => r.status === 'late').length;
                      return (
                        <tr key={day.date} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-700">{day.date}</td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-green-600 font-bold">
                              <CheckCircle size={14} /> {present}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-yellow-600 font-bold">
                              <Clock size={14} /> {late}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-red-600 font-bold">
                              <XCircle size={14} /> {absent}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400">
                            {day.submittedAt ? new Date(day.submittedAt).toLocaleString('ms-MY') : '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => {
                                if(confirm('Adakah anda pasti mahu memadam rekod untuk tarikh ini?')) {
                                  const updated = allAttendance.filter(a => a.date !== day.date);
                                  setAllAttendance(updated);
                                  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                                }
                              }}
                              className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                        Tiada rekod tersimpan lagi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} Sistem Kehadiran Kelas - Dibuat untuk Guru Kelas 4 Bestari</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
