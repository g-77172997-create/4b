
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
  Trash2,
  CheckCheck
} from 'lucide-react';
import { STUDENTS, CLASS_NAME } from './constants';
import { AttendanceStatus, DailyAttendance, AttendanceRecord, AttendanceSummary } from './types';
import StatsCard from './components/StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie } from 'recharts';

const STORAGE_KEY = 'attendance_data_4b_v2';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [allAttendance, setAllAttendance] = useState<DailyAttendance[]>([]);
  const [currentRecords, setCurrentRecords] = useState<AttendanceRecord[]>([]);
  const [view, setView] = useState<'daily' | 'history' | 'stats'>('daily');

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData) as DailyAttendance[];
      setAllAttendance(parsed);
      
      const recordForDate = parsed.find(a => a.date === currentDate);
      if (recordForDate) {
        setCurrentRecords(recordForDate.records);
      } else {
        setCurrentRecords(STUDENTS.map(s => ({ studentId: s.id, status: 'present' })));
      }
    } else {
      setCurrentRecords(STUDENTS.map(s => ({ studentId: s.id, status: 'present' })));
    }
  }, []);

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

  const markAllPresent = () => {
    setCurrentRecords(STUDENTS.map(s => ({ studentId: s.id, status: 'present' })));
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
    alert(`Rekod kehadiran ${currentDate} telah disimpan!`);
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
    { name: 'Hadir', value: summary.present, color: '#10b981' },
    { name: 'Lewat', value: summary.late, color: '#f59e0b' },
    { name: 'Tidak Hadir', value: summary.absent, color: '#ef4444' },
  ], [summary]);

  const changeDate = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const exportToCSV = () => {
    if (allAttendance.length === 0) return alert("Tiada data untuk dieksport.");
    
    let csv = "\uFEFFTarikh,Nama Murid,Jantina,Status\n";
    allAttendance.sort((a,b) => a.date.localeCompare(b.date)).forEach(day => {
      day.records.forEach(rec => {
        const student = STUDENTS.find(s => s.id === rec.studentId);
        csv += `${day.date},"${student?.name}",${student?.gender},${rec.status}\n`;
      });
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Kehadiran_4B.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Users size={32} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
                  Kehadiran {CLASS_NAME}
                </h1>
                <p className="text-blue-100 text-xs font-medium opacity-80 uppercase tracking-widest">Sistem Pengurusan Murid</p>
              </div>
            </div>
            
            <nav className="flex items-center bg-black/10 backdrop-blur-sm rounded-xl p-1 border border-white/10">
              {[
                { id: 'daily', label: 'Harian', icon: <CalendarIcon size={14}/> },
                { id: 'stats', label: 'Statistik', icon: <PieChart size={14}/> },
                { id: 'history', label: 'Arkib', icon: <FileText size={14}/> }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setView(item.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === item.id ? 'bg-white text-blue-700 shadow-lg' : 'hover:bg-white/10 text-white'}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full p-4 md:p-6 space-y-6">
        {view === 'daily' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CalendarIcon size={18} className="text-blue-500" />
                  Kawalan Kehadiran
                </h2>
                <div className="flex items-center gap-2 mb-6">
                  <button onClick={() => changeDate(-1)} className="p-3 hover:bg-blue-50 hover:text-blue-600 rounded-xl border border-slate-200 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <input 
                    type="date" 
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                    className="flex-grow p-3 border border-slate-200 rounded-xl text-center font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  />
                  <button onClick={() => changeDate(1)} className="p-3 hover:bg-blue-50 hover:text-blue-600 rounded-xl border border-slate-200 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <StatsCard label="Hadir" value={summary.present} colorClass="bg-emerald-500 text-emerald-600" icon={<CheckCircle size={20} />} />
                  <StatsCard label="Tiada" value={summary.absent} colorClass="bg-rose-500 text-rose-600" icon={<XCircle size={20} />} />
                  <StatsCard label="Lewat" value={summary.late} colorClass="bg-amber-500 text-amber-600" icon={<Clock size={20} />} />
                  <StatsCard label="Peratus" value={`${summary.percentage}%`} colorClass="bg-blue-500 text-blue-600" icon={<PieChart size={20} />} />
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={markAllPresent}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <CheckCheck size={20} />
                    Tandakan Semua Hadir
                  </button>
                  <button 
                    onClick={handleSave}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-blue-200 shadow-xl transition-all active:scale-95"
                  >
                    <Save size={20} />
                    Simpan Kehadiran
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800">Senarai Nama Murid</h3>
                  <p className="text-xs text-slate-500 font-medium">Sila tandakan status bagi setiap murid</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {STUDENTS.length} MURID BERDAFTAR
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-5 py-4 w-12 text-center">Bil.</th>
                      <th className="px-5 py-4">Nama Penuh</th>
                      <th className="px-5 py-4 w-16 text-center">Jnt.</th>
                      <th className="px-5 py-4 text-center">Tindakan Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {STUDENTS.map((student, idx) => {
                      const record = currentRecords.find(r => r.studentId === student.id);
                      return (
                        <tr key={student.id} className="group hover:bg-blue-50/30 transition-colors">
                          <td className="px-5 py-4 text-sm text-slate-400 font-mono text-center">{idx + 1}</td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-slate-700 uppercase group-hover:text-blue-700 transition-colors">{student.name}</p>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-black ${student.gender === 'L' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                              {student.gender}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => handleStatusChange(student.id, 'present')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${record?.status === 'present' ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100' : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-200 hover:text-emerald-500'}`}
                              >
                                <CheckCircle size={14} /> Hadir
                              </button>
                              <button 
                                onClick={() => handleStatusChange(student.id, 'late')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${record?.status === 'late' ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-100' : 'bg-white text-slate-400 border-slate-200 hover:border-amber-200 hover:text-amber-500'}`}
                              >
                                <Clock size={14} /> Lewat
                              </button>
                              <button 
                                onClick={() => handleStatusChange(student.id, 'absent')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${record?.status === 'absent' ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-100' : 'bg-white text-slate-400 border-slate-200 hover:border-rose-200 hover:text-rose-500'}`}
                              >
                                <XCircle size={14} /> Tiada
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
        )}

        {view === 'stats' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-extrabold text-slate-800">Analisis Kehadiran</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 mb-6 uppercase tracking-widest">Pecahan Status ({currentDate})</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                <h3 className="text-xs font-black text-slate-400 mb-6 uppercase tracking-widest self-start">Peratus Kehadiran Keseluruhan</h3>
                <div className="relative w-full h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1500}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-5xl font-black text-slate-800 tracking-tighter">{summary.percentage}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hadir Hari Ini</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="text-xs font-black text-slate-400 mb-6 uppercase tracking-widest">Trend 7 Hari Terakhir</h3>
               <div className="h-72">
                {allAttendance.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={allAttendance.slice(-7).sort((a,b) => a.date.localeCompare(b.date)).map(a => ({
                      date: new Date(a.date).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short' }),
                      hadir: a.records.filter(r => r.status === 'present').length
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600}} />
                      <YAxis domain={[0, STUDENTS.length]} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#f1f5f9'}} />
                      <Bar dataKey="hadir" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <PieChart size={48} className="mb-4 opacity-20" />
                    <p className="italic font-medium text-sm">Belum ada data sejarah untuk dipaparkan.</p>
                  </div>
                )}
               </div>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800">Arkib Rekod</h2>
                <p className="text-sm text-slate-500 font-medium">Pengurusan data kehadiran yang telah disimpan</p>
              </div>
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-100 active:scale-95"
              >
                <Download size={18} />
                Muat Turun Laporan (CSV)
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5">Tarikh Sesi</th>
                    <th className="px-8 py-5 text-center">Hadir</th>
                    <th className="px-8 py-5 text-center">Lewat</th>
                    <th className="px-8 py-5 text-center">Tiada</th>
                    <th className="px-8 py-5">Masa Simpanan</th>
                    <th className="px-8 py-5 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allAttendance.length > 0 ? (
                    allAttendance.sort((a,b) => b.date.localeCompare(a.date)).map((day) => {
                      const present = day.records.filter(r => r.status === 'present').length;
                      const absent = day.records.filter(r => r.status === 'absent').length;
                      const late = day.records.filter(r => r.status === 'late').length;
                      return (
                        <tr key={day.date} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5 font-bold text-slate-700">{day.date}</td>
                          <td className="px-8 py-5 text-center text-emerald-600 font-black">{present}</td>
                          <td className="px-8 py-5 text-center text-amber-600 font-black">{late}</td>
                          <td className="px-8 py-5 text-center text-rose-600 font-black">{absent}</td>
                          <td className="px-8 py-5 text-xs text-slate-400 font-medium">
                            {day.submittedAt ? new Date(day.submittedAt).toLocaleString('ms-MY') : '-'}
                          </td>
                          <td className="px-8 py-5 text-center">
                            <button 
                              onClick={() => {
                                if(confirm(`Padam rekod untuk ${day.date}?`)) {
                                  const updated = allAttendance.filter(a => a.date !== day.date);
                                  setAllAttendance(updated);
                                  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                                }
                              }}
                              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center text-slate-300 italic">
                        <FileText size={64} className="mx-auto mb-4 opacity-10" />
                        <p className="text-lg">Tiada rekod tersimpan lagi.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-10 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h4 className="font-bold text-slate-800">Sistem Kehadiran Digital 4B</h4>
              <p className="text-slate-400 text-xs mt-1">Dibangunkan khas untuk pengurusan kelas 4 Bestari.</p>
            </div>
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} Hak Cipta Terpelihara
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
