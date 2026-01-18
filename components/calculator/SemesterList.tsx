import React from 'react';
import { Semester, Course } from '../../types';

interface SemesterListProps {
  profile: any;
  onUpdate: (profile: any) => void;
  filterBed?: boolean | null; // null = show all, true = only B.Ed, false = only Normal
}

export const SemesterList: React.FC<SemesterListProps> = ({ profile, onUpdate, filterBed = null }) => {
  const { BED_COURSES } = require('../../utils/gpa'); // Import helper

  // Helper to filter courses for display
  const getVisibleCourses = (courses: Course[]) => {
    if (filterBed === null) return courses;
    return courses.filter(c => {
      const isBed = BED_COURSES.has(c.code.trim().toUpperCase());
      return filterBed ? isBed : !isBed;
    });
  };

  const semesters = Object.values(profile.semesters as Record<string, Semester>)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  return (
    <div className="space-y-6">
      {semesters.map((sem) => {
        const visibleCourses = getVisibleCourses(sem.courses);
        if (visibleCourses.length === 0 && !sem.isForecast) return null; // Skip empty semesters unless forecast

        return (
          <div key={sem.originalName} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-brand-500 rounded-full"></span>
                {sem.originalName}
              </h3>
              <div className="text-right text-sm">
                <div className="font-mono font-bold text-brand-600 dark:text-brand-400">GPA: {sem.gpa.toFixed(2)}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Course</th>
                    <th className="px-4 py-3">CH</th>
                    <th className="px-4 py-3">Marks</th>
                    <th className="px-4 py-3 rounded-r-lg">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {visibleCourses.map((course, idx) => (
                    <tr key={`${sem.originalName}-${course.code}-${idx}`} className={`
                      ${course.isExtraEnrolled ? 'opacity-50 bg-yellow-50/50 dark:bg-yellow-900/10' : ''}
                      ${course.isCustom ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                    `}>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {course.code}
                        {course.isExtraEnrolled && <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">Rep</span>}
                        {course.isCustom && <span className="ml-2 text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Custom</span>}
                      </td>
                      <td className="px-4 py-3">{course.creditHours}</td>
                      <td className="px-4 py-3">{course.marks}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold 
                          ${course.grade === 'A' ? 'bg-green-100 text-green-700' : 
                            course.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}
                        `}>
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
      })}
    </div>
  );
};
