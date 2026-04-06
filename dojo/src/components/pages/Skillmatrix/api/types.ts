export interface Operation {
  id: number;
  name: string;
  minimum_skill_required: number;
  section: number;
  section_name: string;
  number: number;
  matrix: number;
  department: number;
}

export interface Section {
  id: number;
  name: string;
  department: number;
}

export interface SkillMatrix {
  id: number;
  department: string;
  updated_on: string;
  next_review: string;
  doc_no: string;
  prepared_by: string;
  uploaded_by: string;
}

export interface MonthlySkill {
  id: number;
  employee_code: string;
  full_name: string;
  date_of_join: string;
  designation: string;
  department: string;
  section: string | null;
  operation: string | null;
  operation_number: number | null;
  skill_level: string;
  date: string;
  remarks: string;
  status: string;
  level: string;
}

export interface OperatorLevel {
  employee: {
    id: number;
    employee_code: string;
    full_name: string;
    date_of_join: string;
    designation: string;
    department: string;
  };
  skill_matrix: {
    id: number;
    department: string;
    updated_on: string;
    next_review: string;
    doc_no: string;
    prepared_by: string;
    uploaded_by: string;
  };
  operation: {
    id: number;
    matrix: number;
    department: string;
    section: number;
    section_name: string;
    number: number;
    name: string;
    minimum_skill_required: number;
  };
  level: number;
}

// -------------------------------
// GET FISCAL START YEAR (APRIL)
// -------------------------------
export const getCurrentFiscalStartYear = (): number => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0 = Jan, 3 = Apr

  // Jan–Feb–Mar → Fiscal year started last April
  if (month <= 2) {
    return year - 1;
  }

  // Apr–Dec → Fiscal year of current year
  return year;
};

// -------------------------------
// MONTH TYPE
// -------------------------------
export type Month = {
  id: number;          // MUST MATCH BACKEND
  name: string;
  displayName: string; // Apr-25
  year: number;        // 2025
};

// -------------------------------
// GENERATE FISCAL MONTHS
// -------------------------------
export const generateFiscalMonths = (
  startMonthIndex: number,  // 3 = April
  startYear: number
): Month[] => {

  const months = [
    { id: 1, name: "January", short: "Jan" },
    { id: 2, name: "February", short: "Feb" },
    { id: 3, name: "March", short: "Mar" },
    { id: 4, name: "April", short: "Apr" },
    { id: 5, name: "May", short: "May" },
    { id: 6, name: "June", short: "Jun" },
    { id: 7, name: "July", short: "Jul" },
    { id: 8, name: "August", short: "Aug" },
    { id: 9, name: "September", short: "Sep" },
    { id: 10, name: "October", short: "Oct" },
    { id: 11, name: "November", short: "Nov" },
    { id: 12, name: "December", short: "Dec" },
  ];

  const result: Month[] = [];
  let monthIndex = startMonthIndex; // 3 = April
  let year = startYear;

  for (let i = 0; i < 12; i++) {
    const m = months[monthIndex];

    result.push({
      id: m.id, // 🌟 IMPORTANT — backend expects April=4, May=5, ...
      name: m.name,
      displayName: `${m.short}-${String(year).slice(2)}`,
      year: year
    });

    // Move to next month
    monthIndex++;

    // Restart at January
    if (monthIndex === 12) {
      monthIndex = 0;
      year++;
    }
  }

  return result;
};

// -------------------------------
// EXPORT FINAL MONTH LIST
// -------------------------------
export const months: Month[] = generateFiscalMonths(
  3,                          // Start at April (index 3)
  getCurrentFiscalStartYear() // Auto fiscal year start
);


export interface DepartmentOperationColors {
  [department: string]: {
    [operationNumber: number]: string;
  };
}

export const operationColors: DepartmentOperationColors = {
  'Assembly': {
    1: '#FFF200', 2: '#F8B87A', 3: '#006B76', 4: '#708238', 5: '#B1C4CC',
    6: '#4D3E6C', 7: '#475A93', 8: '#854B07', 9: '#FFD300', 10: '#D01F1F',
    11: '#00A651', 12: '#662D91', 13: '#002663', 14: '#00CFFF', 15: '#A3D55C',
    16: '#3A3A3A', 17: '#C6BDD6', 18: '#902734', 19: '#98C4D4', 20: '#D2DFAA'
  },
  'Quality': { 1: '#00A94E', 2: '#00B7F1', 3: '#782D91', 4: '#FFC100' },
  'Moulding': { 1: '#F47C26', 2: '#A8A8A8', 3: '#FFC400', 4: '#4A79C9', 5: '#4CAF50' },
  'Surface Treatment': { 1: '#4682B4', 2: '#5F9EA0', 3: '#B0C4DE', 4: '#ADD8E6', 5: '#87CEEB' },
};

export const defaultOperationColor = '#E5E7EB';

export interface StationRequirement {
  id: number;
  station_id: number;
  station_name: string;
  department_id: number | null;
  department_name: string;
  minimum_operators: number | null;
  minimum_level_required: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | null;
  minimum_level_name: number;
}