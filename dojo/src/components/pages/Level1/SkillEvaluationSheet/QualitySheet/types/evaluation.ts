export interface EmployeeInfo {
  name: string;
  code: string;
  designation: string;
  department: string;        // This will now contain the department NAME
  line: string;              // This will now contain the line NAME
  station: string; 
  dateOfJoining: string;
  dojoTrainingStart: string;
  dojoTrainingFinish: string;
  maxMarks: number;
  obtainedMarks: number;
  result: string;
  trainerName: string;
  trainerSign: string;
}

export interface Sequence {
  id: string;
  description: string;
  methodTime: number;
  e1: number;
  e2: number;
  e3: number;
}

export interface Module {
  id: string;
  title: string;
  focusPoint: string;
  sequences: Sequence[];
  cycleTime: number;
  actualTime: number;
  marksObtained: number;
  maxMarks: number;
  remarks: string;
}