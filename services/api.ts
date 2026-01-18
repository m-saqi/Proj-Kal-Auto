import { ScrapeResult, Profile, Course, Semester } from '../types';
import { getSemesterOrderKey, calculateQualityPoints } from '../utils/gpa';

export const fetchResults = async (regNum: string): Promise<Profile | null> => {
  try {
    const response = await fetch('/api/result-scraper?action=scrape_single', {
      method: 'POST',
      body: JSON.stringify({ registrationNumber: regNum }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data: ScrapeResult = await response.json();

    if (data.success && data.resultData) {
      return transformScrapedData(data.resultData);
    }
    return null;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

const transformScrapedData = (rawData: any[]): Profile => {
  const studentName = rawData[0]?.StudentName || 'Unknown Student';
  const registration = rawData[0]?.RegistrationNo || 'Unknown ID';

  const semesters: Record<string, Semester> = {};

  rawData.forEach((item) => {
    let semName = item.Semester || 'Unknown';
    // Basic normalization of semester name
    if(semName.toLowerCase().includes('spring')) semName = semName.replace(/(\d{4})-(\d{2})/, 'Spring 20$2');
    
    if (!semesters[semName]) {
      semesters[semName] = {
        originalName: semName,
        sortKey: getSemesterOrderKey(semName),
        courses: [],
        gpa: 0,
        percentage: 0,
        totalCreditHours: 0,
        totalMarksObtained: 0,
        totalMaxMarks: 0,
        totalQualityPoints: 0
      };
    }

    const chStr = item.CreditHours || '0';
    const ch = parseInt(chStr.match(/\d+/)?.[0] || '0');
    const marks = parseFloat(item.Total || '0');
    const grade = item.Grade || '';

    const course: Course = {
      code: item.CourseCode,
      title: item.CourseTitle,
      creditHours: ch,
      creditHoursDisplay: chStr,
      marks: marks,
      grade: grade,
      qualityPoints: calculateQualityPoints(marks, ch, grade),
      isDeleted: false,
      isCustom: false,
      isExtraEnrolled: false,
      isRepeated: false,
      teacher: item.TeacherName,
      mid: item.Mid,
      assignment: item.Assignment,
      final: item.Final,
      practical: item.Practical,
      source: 'lms'
    };

    semesters[semName].courses.push(course);
  });

  return {
    id: `profile_${Date.now()}`,
    displayName: `${studentName} (${registration})`,
    studentInfo: { name: studentName, registration },
    semesters,
    courseHistory: {},
    bedMode: false,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
};