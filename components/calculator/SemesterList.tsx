import React from 'react';
import { Profile, Semester } from '../../types';
import { ChevronDown, Trash2, Plus, Info } from 'lucide-react';
import { Button } from '../ui/Button';

interface SemesterListProps {
  profile: Profile;
  onUpdate: (profile: Profile) => void;
}

export const SemesterList: React.FC<SemesterListProps> = ({ profile, onUpdate }) => {
  const sortedSemesters = (Object.values(profile.semesters) as Semester[]).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  const handleDeleteSemester = (name: string) => {
    const updated = { ...profile };
    delete updated.semesters[name];
    onUpdate(updated);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
      {sortedSemesters.map((sem) => (
        <SemesterCard key={sem.originalName} semester={sem} onDelete={() => handleDeleteSemester(sem.originalName)} />
      ))}
    </div>
  );
};

const SemesterCard: React.FC<{ semester: Semester; onDelete: () => void }> = ({ semester, onDelete }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md">
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                {semester.originalName}
                {semester.isForecast && <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">Forecast</span>}
            </h3>
            <div className="text-xs text-slate-500 mt-1 flex gap-3">
                <span>GPA: <strong className="text-brand-600 dark:text-brand-400">{semester.gpa.toFixed(4)}</strong></span>
                <span>CH: {semester.totalCreditHours}</span>
            </div>
        </div>
        <button onClick={onDelete} className="text-slate-400 hover:text-red-500 transition-colors p-2">
            <Trash2 size={18} />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/30 text-slate-500 dark:text-slate-400 uppercase text-xs">
                <tr>
                    <th className="px-4 py-2">Course</th>
                    <th className="px-4 py-2 text-center">CH</th>
                    <th className="px-4 py-2 text-center">Marks</th>
                    <th className="px-4 py-2 text-center">Grade</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {semester.courses.map((course, idx) => (
                    <tr key={idx} className={`group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${course.isRepeated && !course.isExtraEnrolled ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}>
                        <td className="px-4 py-3">
                            <div className="font-medium text-slate-900 dark:text-slate-200">{course.code}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[150px]">{course.title || 'Custom Course'}</div>
                            {course.isExtraEnrolled && <span className="text-[10px] text-amber-600 bg-amber-100 px-1 rounded ml-1">Repeat</span>}
                        </td>
                        <td className="px-4 py-3 text-center">{course.creditHours}</td>
                        <td className="px-4 py-3 text-center font-mono">{course.marks}</td>
                        <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                course.grade === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                course.grade === 'F' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}>
                                {course.grade}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};