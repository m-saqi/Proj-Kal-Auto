export interface StudentInfo {
  name: string;
  registration: string;
}

export interface Course {
  code: string;
  title: string;
  creditHours: number;
  creditHoursDisplay?: string;
  marks: number;
  qualityPoints: number;
  grade: string;
  teacher?: string;
  mid?: string;
  assignment?: string;
  final?: string;
  practical?: string;
  isExtraEnrolled: boolean;
  isRepeated: boolean;
  isDeleted: boolean;
  isCustom: boolean;
  originalSemester?: string;
  source?: 'lms' | 'attendance';
}

export interface Semester {
  originalName: string;
  sortKey: string;
  courses: Course[];
  gpa: number;
  percentage: number;
  totalQualityPoints: number;
  totalCreditHours: number;
  totalMarksObtained: number;
  totalMaxMarks: number;
  isForecast?: boolean;
}

export interface Profile {
  id: string;
  displayName: string;
  studentInfo: StudentInfo;
  semesters: Record<string, Semester>;
  courseHistory: Record<string, any>; // Simplified for internal logic
  bedMode: boolean;
  createdAt: string;
  lastModified: string;
}

export interface ScrapeResult {
  success: boolean;
  message: string;
  resultData?: any[];
}

export interface CgpaSummary {
  cgpa: number;
  percentage: number;
  totalQualityPoints: number;
  totalCreditHours: number;
  totalMarksObtained: number;
  totalMaxMarks: number;
}