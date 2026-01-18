import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateCGPA, getSemesterOrderKey } from '../utils/gpa';
import { CgpaDial } from '../components/calculator/CgpaDial';
import { SemesterList } from '../components/calculator/SemesterList';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, LineChart } from 'lucide-react';
import { LineChart as RechartsLine, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Semester } from '../types';

export const Calculator = () => {
  const { activeProfile, saveProfile } = useApp();
  const navigate = useNavigate();
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    if (!activeProfile) navigate('/');
  }, [activeProfile, navigate]);

  if (!activeProfile) return null;

  const summary = calculateCGPA(activeProfile);

  // Prepare Chart Data
  const chartData = (Object.values(activeProfile.semesters) as Semester[])
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(sem => ({
      name: sem.originalName.replace('Semester', '').trim(),
      gpa: sem.gpa
    }));

  const handleAddForecast = () => {
    const newProfile = { ...activeProfile };
    let count = 1;
    while(newProfile.semesters[`Forecast ${count}`]) count++;
    const name = `Forecast ${count}`;
    
    newProfile.semesters[name] = {
        originalName: name,
        sortKey: getSemesterOrderKey(name),
        courses: [],
        gpa: 0, percentage: 0, totalCreditHours: 0, totalMarksObtained: 0, totalMaxMarks: 0, totalQualityPoints: 0,
        isForecast: true
    };
    saveProfile(newProfile);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(124, 58, 237); // Brand color
    doc.text("UAF Academic Transcript", 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Name: ${activeProfile.studentInfo.name}`, 14, 30);
    doc.text(`Reg No: ${activeProfile.studentInfo.registration}`, 14, 36);
    doc.text(`CGPA: ${summary.cgpa.toFixed(4)}`, 14, 42);

    let finalY = 50;

    (Object.values(activeProfile.semesters) as Semester[])
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .forEach(sem => {
        if(finalY > 250) { doc.addPage(); finalY = 20; }
        
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text(sem.originalName, 14, finalY);
        
        const tableBody = sem.courses.map(c => [c.code, c.title, c.creditHours, c.marks, c.grade]);
        
        autoTable(doc, {
            startY: finalY + 2,
            head: [['Code', 'Title', 'CH', 'Marks', 'Grade']],
            body: tableBody,
            theme: 'striped',
            headStyles: { fillColor: [124, 58, 237] }
        });
        
        finalY = (doc as any).lastAutoTable.finalY + 15;
      });

    doc.save(`${activeProfile.studentInfo.registration}_Transcript.pdf`);
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{activeProfile.studentInfo.name}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-mono mt-1">{activeProfile.studentInfo.registration}</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowChart(!showChart)}>
                <LineChart className="w-4 h-4 mr-2" /> {showChart ? 'Hide' : 'Show'} Trend
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" /> PDF
            </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Summary */}
        <div className="lg:col-span-1 space-y-6">
            <CgpaDial summary={summary} />
            
            {showChart && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsLine data={chartData}>
                            <XAxis dataKey="name" hide />
                            <YAxis domain={[0, 4]} />
                            <Tooltip contentStyle={{ borderRadius: '8px' }} />
                            <Line type="monotone" dataKey="gpa" stroke="#8b5cf6" strokeWidth={2} dot={{r:4}} />
                        </RechartsLine>
                    </ResponsiveContainer>
                </div>
            )}

            <Button onClick={handleAddForecast} className="w-full justify-between group">
                Forecast Next Semester 
                <div className="bg-white/20 p-1 rounded-full"><Plus size={16} /></div>
            </Button>
        </div>

        {/* Right Column: Semesters */}
        <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Academic Record</h2>
            </div>
            <SemesterList profile={activeProfile} onUpdate={saveProfile} />
        </div>
      </div>
    </div>
  );
};