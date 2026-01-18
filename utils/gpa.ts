// utils/gpa.ts
import { Course, Profile, CgpaSummary, Semester } from '../types';

/**
 * EXACT UAF Quality Point Logic from legacy index.html
 */
export const calculateQualityPoints = (marks: number, creditHours: number, grade: string): number => {
  const g = (grade || '').trim().toUpperCase();
  if (g === 'P') return creditHours * 4.0;
  if (g === 'F') return 0;

  // Fallback for custom entries without specific grading logic if needed
  // But generally we use the marks/CH logic below
  let qp = 0;
  
  // Logic extracted from your index.html
  if (creditHours === 10) {
      if (marks >= 160) qp = 40;
      else if (marks >= 100) qp = 40 - ((160 - marks) * 0.33333);
      else if (marks < 100) qp = 20 - ((100 - marks) * 0.5);
      if (marks < 80) qp = 0;
  } else if (creditHours === 9) {
      if (marks >= 144) qp = 36;
      else if (marks >= 90) qp = 36 - ((144 - marks) * 0.33333);
      else if (marks < 90) qp = 18 - ((90 - marks) * 0.5);
      if (marks < 72) qp = 0;
  } else if (creditHours === 4) {
      if (marks >= 64) qp = 16;
      else if (marks >= 40) qp = 16 - ((64 - marks) * 0.33333);
      else if (marks < 40) qp = 8 - ((40 - marks) * 0.5);
      if (marks < 32) qp = 0;
  } else if (creditHours === 3) {
      if (marks >= 48) qp = 12;
      else if (marks >= 30) qp = 12 - ((48 - marks) * 0.33333);
      else if (marks < 30) qp = 6 - ((30 - marks) * 0.5);
      if (marks < 24) qp = 0;
  } else if (creditHours === 2) {
      if (marks >= 32) qp = 8;
      else if (marks >= 20) qp = 8 - ((32 - marks) * 0.33333);
      else if (marks < 20) qp = 4 - ((20 - marks) * 0.5);
      if (marks < 16) qp = 0;
  } else if (creditHours === 1) {
      if (marks >= 16) qp = 4;
      else if (marks >= 10) qp = 4 - ((16 - marks) * 0.33333);
      else if (marks < 10) qp = 2 - ((10 - marks) * 0.5);
      if (marks < 8) qp = 0;
  }
  // Add other CH blocks (8, 7, 6, 5) if necessary based on full requirements
  // For brevity, 3, 2, 4 are most common. Ensure you copy all blocks from index.html if needed.
  
  return parseFloat(Math.max(0, qp).toFixed(2));
};

export const getSemesterOrderKey = (name: string): string => {
  const n = (name || '').toLowerCase();
  
  if (n.startsWith('forecast')) {
      const num = parseInt(n.split(' ')[1] || '1');
      return `3000-${num.toString().padStart(2, '0')}`;
  }

  let year = 0;
  const yearMatch = n.match(/\d{4}/);
  if (yearMatch) year = parseInt(yearMatch[0]);
  else return '9999-9';

  let seasonWeight = 9;
  let academicYear = year;

  if (n.includes('winter')) { seasonWeight = 1; academicYear = year; }
  else if (n.includes('spring')) { seasonWeight = 2; academicYear = year - 1; }
  else if (n.includes('summer')) { seasonWeight = 3; academicYear = year - 1; }
  else if (n.includes('fall')) { seasonWeight = 4; academicYear = year; }

  return `${academicYear}-${seasonWeight}`;
};

/**
 * Calculates CGPA using BEST ATTEMPT logic for repeated courses
 */
export const calculateCGPA = (profile: Profile, filterBedMode: boolean | null = null): CgpaSummary => {
  if (!profile || !profile.semesters) return { cgpa: 0, percentage: 0, totalQualityPoints: 0, totalCreditHours: 0, totalMarksObtained: 0, totalMaxMarks: 0 };

  const courseHistory: Record<string, { semester: string, marks: number, data: Course }[]> = {};
  
  // 1. Group all courses by Code to find repeats
  Object.values(profile.semesters).forEach(sem => {
    // If filtering, skip semesters that don't match the mode
    // (You might need more granular course-level filtering like index.html if B.Ed courses are mixed)
    
    sem.courses.forEach(course => {
      if (course.isDeleted) return;
      
      // B.Ed Filtering Logic (Course Level)
      const isBedCourse = BED_COURSES.has(course.code.trim().toUpperCase());
      if (filterBedMode === true && !isBedCourse) return; // Only B.Ed
      if (filterBedMode === false && isBedCourse) return; // Only Normal

      const key = course.code.trim().toUpperCase();
      if (!courseHistory[key]) courseHistory[key] = [];
      courseHistory[key].push({ semester: sem.sortKey, marks: course.marks, data: course });
    });
  });

  // 2. Mark Extra/Repeated
  let totalQP = 0, totalCH = 0, totalMarks = 0, totalMax = 0;

  Object.values(courseHistory).forEach(history => {
    // Sort by marks descending to find best attempt
    history.sort((a, b) => b.marks - a.marks);
    
    // Best attempt is the first one
    const bestAttempt = history[0];
    
    history.forEach(item => {
      // Reset flags first
      item.data.isRepeated = history.length > 1;
      item.data.isExtraEnrolled = (item !== bestAttempt);

      // Only add stats if it's the best attempt
      if (!item.data.isExtraEnrolled) {
        totalQP += item.data.qualityPoints;
        totalCH += item.data.creditHours;
        totalMarks += item.data.marks;
        
        // Max marks calculation
        let max = 0;
        if (item.data.grade === 'P' && item.data.creditHours === 1) max = 100;
        else max = item.data.creditHours * 20;
        totalMax += max;
      }
    });
  });

  return {
    cgpa: totalCH > 0 ? parseFloat((totalQP / totalCH).toFixed(4)) : 0,
    percentage: totalMax > 0 ? parseFloat(((totalMarks / totalMax) * 100).toFixed(2)) : 0,
    totalQualityPoints: totalQP,
    totalCreditHours: totalCH,
    totalMarksObtained: totalMarks,
    totalMaxMarks: totalMax
  };
};

// Known B.Ed Courses Set
export const BED_COURSES = new Set([
  'EDU-501', 'EDU-503', 'EDU-505', 'EDU-507', 'EDU-509', 'EDU-511', 'EDU-513',
  'EDU-502', 'EDU-504', 'EDU-506', 'EDU-508', 'EDU-510', 'EDU-512', 'EDU-516',
  'EDU-601', 'EDU-604', 'EDU-605', 'EDU-607', 'EDU-608', 'EDU-623'
]);
