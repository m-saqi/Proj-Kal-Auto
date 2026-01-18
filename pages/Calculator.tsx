import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { calculateCGPA, getSemesterOrderKey } from '../utils/gpa';
import { CgpaDial } from '../components/calculator/CgpaDial';
import { SemesterList } from '../components/calculator/SemesterList';
import { Button } from '../components/ui/Button';
import { 
  Download, LineChart, Search, Loader2, Sparkles, RefreshCcw, Lock
} from 'lucide-react';
import { fetchResults } from '../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Profile, Course } from '../types';

// Password Map for Restricted Access
const RESTRICTED_MAP: Record<string, string> = {
    '2020-ag-9423': 'am9rZXI5MTE=', // Base64 for 'joker911'
    '2019-ag-8136': 'bWlzczkxMQ=='
};

export const Calculator = () => {
  const { activeProfile, saveProfile, setActiveProfile, isLoading, setIsLoading } = useApp();
  const [regNum, setRegNum] = useState('');
  const [passKey, setPassKey] = useState('');
  const [showPassModal, setShowPassModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'normal' | 'bed'>('normal');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceCourses, setAttendanceCourses] = useState<any[]>([]);

  // B.Ed Courses Set
  const BED_COURSES = new Set(['EDU-501', 'EDU-502', 'EDU-601']); 

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      const id = regNum.toLowerCase().trim();
      if(RESTRICTED_MAP[id]) {
          setShowPassModal(true);
      } else {
          performFetch(regNum);
      }
  };

  const verifyPassKey = () => {
      const id = regNum.toLowerCase().trim();
      if(btoa(passKey) === RESTRICTED_MAP[id]) {
          setShowPassModal(false);
          performFetch(regNum);
      } else {
          alert("Invalid Pass Key");
      }
  };

  const performFetch = async (id: string) => {
    setIsLoading(true);
    try {
        const profile = await fetchResults(id);
        if(profile) {
            // Check for B.Ed courses
            const hasBed = Object.values(profile.semesters).some(s => 
                s.courses.some(c => BED_COURSES.has(c.code))
            );
            if(hasBed && confirm("B.Ed courses detected. Separate B.Ed result?")) {
                profile.bedMode = true;
                setActiveTab('bed');
            }
            saveProfile(profile);
        } else {
            alert("No result found");
        }
    } catch(e) {
        alert("Connection Failed");
    } finally {
        setIsLoading(false);
    }
  };

  const fetchAttendance = async () => {
    if(!activeProfile) return;
    setIsLoading(true);
    try {
        const res = await fetch(`/api/result-scraper?action=scrape_attendance&registrationNumber=${activeProfile.studentInfo.registration}`);
        const data = await res.json();
        if(data.success) {
            // Deduplicate against existing LMS courses
            const existingCodes = new Set<string>();
            Object.values(activeProfile.semesters).forEach(s => 
                s.courses.forEach(c => existingCodes.add(c.code))
            );
            
            const newCourses = data.resultData.filter((c: any) => !existingCodes.has(c.CourseCode));
            setAttendanceCourses(newCourses);
            setShowAttendanceModal(true);
        } else {
            alert("No attendance records found.");
        }
    } catch {
        alert("Failed to fetch attendance.");
    } finally {
        setIsLoading(false);
    }
  };

  const importAttendance = (selectedCourses: any[]) => {
     if(!activeProfile) return;
     const updated = { ...activeProfile };
     
     selectedCourses.forEach(att => {
         // Create or find semester
         const semName = att.Semester;
         if(!updated.semesters[semName]) {
             updated.semesters[semName] = {
                 originalName: semName,
                 sortKey: getSemesterOrderKey(semName),
                 courses: [],
                 // ... init zeros
                 gpa:0, percentage:0, totalCreditHours:0, totalMarksObtained:0, totalMaxMarks:0, totalQualityPoints:0
             };
         }
         
         const newCourse: Course = {
             code: att.CourseCode,
             title: att.CourseName,
             creditHours: 3, // Default, user can edit later
             marks: parseFloat(att.Totalmark),
             grade: att.Grade,
             qualityPoints: 0, // Recalculated by saveProfile
             isCustom: true,
             source: 'attendance',
             isDeleted: false, isExtraEnrolled: false, isRepeated: false,
             creditHoursDisplay: '3'
         };
         updated.semesters[semName].courses.push(newCourse);
     });
     
     saveProfile(updated);
     setShowAttendanceModal(false);
  };

  const handleDownloadPDF = () => {
     if(!activeProfile) return;
     // Trigger the Python download handler for Android compatibility
     const form = document.createElement('form');
     form.method = 'POST';
     form.action = '/api/download'; // Matches our python script
     form.style.display = 'none';

     // Generate PDF Blob using jsPDF
     const doc = new jsPDF();
     doc.text(`Transcript: ${activeProfile.studentInfo.name}`, 10, 10);
     
     // ... (Your PDF generation logic here) ...
     const pdfBlob = doc.output('blob');
     
     const reader = new FileReader();
     reader.readAsDataURL(pdfBlob);
     reader.onloadend = () => {
         const inputName = document.createElement('input');
         inputName.name = 'filename';
         inputName.value = `Transcript_${activeProfile.studentInfo.registration}.pdf`;
         
         const inputData = document.createElement('input');
         inputData.name = 'fileData';
         inputData.value = reader.result as string;

         form.appendChild(inputName);
         form.appendChild(inputData);
         document.body.appendChild(form);
         form.submit();
         document.body.removeChild(form);
     };
  };

  if (!activeProfile) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
             {/* RESTRICTED ACCESS MODAL */}
             {showPassModal && (
                 <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                     <div className="bg-white p-6 rounded-xl w-full max-w-sm">
                         <h3 className="text-xl font-bold mb-4 flex items-center"><Lock className="mr-2"/> Restricted Access</h3>
                         <input type="password" value={passKey} onChange={e => setPassKey(e.target.value)} 
                                className="w-full border p-2 rounded mb-4" placeholder="Enter Pass Key" />
                         <Button onClick={verifyPassKey} className="w-full">Unlock</Button>
                     </div>
                 </div>
             )}

             <div className="w-full max-w-md space-y-4">
                 <h1 className="text-3xl font-black text-center text-slate-800">UAF Calculator</h1>
                 <form onSubmit={handleSearch} className="relative">
                     <input value={regNum} onChange={e => setRegNum(e.target.value)} 
                            className="w-full p-4 rounded-full border-2 border-slate-200 text-xl font-bold text-center"
                            placeholder="2020-ag-1234" />
                     <Button type="submit" className="absolute right-2 top-2 bottom-2 rounded-full px-6" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin"/> : 'Fetch'}
                     </Button>
                 </form>
             </div>
        </div>
     );
  }

  // Filter Logic for B.Ed Tabs
  const filteredSemesters = activeProfile.bedMode 
     ? Object.values(activeProfile.semesters).map(s => ({
         ...s,
         courses: s.courses.filter(c => 
             activeTab === 'bed' ? BED_COURSES.has(c.code) : !BED_COURSES.has(c.code)
         )
     })).filter(s => s.courses.length > 0)
     : Object.values(activeProfile.semesters);

  // Re-calculate summary just for the filtered view
  const displayProfile = { ...activeProfile, semesters: {} as any };
  filteredSemesters.forEach(s => displayProfile.semesters[s.originalName] = s);
  const summary = calculateCGPA(displayProfile);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* HEADER & TABS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border">
             <div>
                 <h1 className="text-2xl font-black">{activeProfile.studentInfo.name}</h1>
                 <div className="text-sm font-mono text-slate-500">{activeProfile.studentInfo.registration}</div>
             </div>
             <div className="flex gap-2">
                 <Button variant="secondary" onClick={fetchAttendance}><Sparkles className="w-4 h-4 mr-2"/> Attendance</Button>
                 <Button variant="primary" onClick={handleDownloadPDF}><Download className="w-4 h-4 mr-2"/> PDF</Button>
                 <Button variant="outline" onClick={() => setActiveProfile(null)}><RefreshCcw className="w-4 h-4"/></Button>
             </div>
        </div>

        {activeProfile.bedMode && (
            <div className="flex gap-4 border-b">
                <button onClick={() => setActiveTab('normal')} className={`pb-2 font-bold ${activeTab==='normal' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-slate-400'}`}>BS/MSc</button>
                <button onClick={() => setActiveTab('bed')} className={`pb-2 font-bold ${activeTab==='bed' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-slate-400'}`}>B.Ed</button>
            </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <CgpaDial summary={summary} />
            </div>
            <div className="lg:col-span-2">
                <SemesterList 
                    profile={{...activeProfile, semesters: displayProfile.semesters}} 
                    onUpdate={(p) => {
                        // Merge updates back into main profile
                        const merged = { ...activeProfile };
                        Object.assign(merged.semesters, p.semesters);
                        saveProfile(merged);
                    }} 
                />
            </div>
        </div>

        {/* ATTENDANCE MODAL */}
        {showAttendanceModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">Import Attendance Courses</h2>
                    {attendanceCourses.length === 0 ? (
                        <p>No new courses found.</p>
                    ) : (
                        <div className="space-y-2">
                            {attendanceCourses.map((c, i) => (
                                <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                    <div>
                                        <div className="font-bold">{c.CourseCode}</div>
                                        <div className="text-xs text-slate-500">{c.CourseName}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-mono bg-slate-100 px-2 rounded">
                                            {c.Totalmark} | {c.Grade}
                                        </span>
                                        <Button size="sm" onClick={() => importAttendance([c])}>Import</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-6 text-right">
                        <Button variant="secondary" onClick={() => setShowAttendanceModal(false)}>Close</Button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
