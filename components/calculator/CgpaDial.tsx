import React from 'react';
import { CgpaSummary } from '../../types';

interface CgpaDialProps {
  summary: CgpaSummary;
}

export const CgpaDial: React.FC<CgpaDialProps> = ({ summary }) => {
  // SVG Circle Calc
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - ((summary.percentage / 100) * circumference);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90 w-full h-full drop-shadow-lg"
        >
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-slate-100 dark:text-slate-700"
          />
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-brand-500 dark:text-brand-400"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-bold text-slate-900 dark:text-white">
            {summary.cgpa.toFixed(4)}
          </span>
          <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mt-1">
            CGPA
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-8 w-full text-center divide-x divide-slate-200 dark:divide-slate-700">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-xs uppercase mb-1">Percentage</p>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{summary.percentage.toFixed(2)}%</p>
        </div>
        <div>
           <p className="text-slate-500 dark:text-slate-400 text-xs uppercase mb-1">Credits</p>
           <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{summary.totalCreditHours}</p>
        </div>
        <div>
           <p className="text-slate-500 dark:text-slate-400 text-xs uppercase mb-1">Marks</p>
           <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{summary.totalMarksObtained.toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
};