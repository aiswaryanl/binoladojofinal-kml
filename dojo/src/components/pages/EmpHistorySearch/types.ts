//This file will hold all your TypeScript interfaces.
// src/components/pages/EmployeeHistorySearch/types.ts

export interface MasterEmployee {
	emp_id: string;
	first_name: string | null;
	last_name: string | null;
	// department_name: string;
	date_of_joining: string;
	birth_date: string | null;
	sex: string | null;
	email: string;
	phone: string;
	// Fields from old 'Employee' interface needed for the info card
	pay_code: string;
	card_no: string; // Same as emp_id
	name: string; // Constructed from first_name/last_name
	guardian_name: string;
	department: string;
	sub_department:string;           // or better: { id: number; line_name: string } | null
    sub_department_name?: string;            // ← you can add this (from property)
    station:string;                  // or { id: number; station_name: string } | null
    line_name?: string | null;
    station_name?: string | null;
	section: string;
	desig_category: string;
}

export interface OperatorSkill {
	id: number;
	employee_name: string;
	station_name: string;
	level_name: string;
	sequence: number | null;
}

export interface Attendance {
	id: number;
	batch: string;
	day_number: number;
	status: 'present' | 'absent';
	attendance_date: string;
}

export interface Score {
	id: number;
	test_name: string;
	marks: number;
	created_at: string;
	percentage: number;
	passed: string; // Kept as string per original code
	test_date?: string;
}

export interface HanchouResult {
	id: number;
	exam_name: string;
	score: number;
	total_questions: number;
	percentage: number;
	passed: boolean;
	submitted_at: string;
}

export interface ShokuchouResult {
	id: number;
	exam_name: string;
	score: number;
	total_questions: number;
	percentage: number;
	passed: boolean;
	submitted_at: string;
}

export interface ScheduledTraining {
	id: number;
	topic: string;
	category_name: string;
	trainer_name: string | null;
	venue_name: string | null;
	status: string;
	date: string;
}

export interface ProductivityEvaluation {
	id: number;
	evaluation_date: string;
	obtained_marks: number;
	max_marks: number;
	percentage: number;
	status: string;
	trainer_name?: string;
	remarks?: string;
}

export interface QualityEvaluation {
	id: number;
	evaluation_date: string;
	obtained_marks: number;
	max_marks: number;
	percentage: number;
	status: string;
	trainer_name?: string;
	remarks?: string;
}

export interface OJTRecord {
	id: number;
	trainee_name: string;
	station_name: string;
	line: string;
	subline: string;
	process_name: string;
	level_name: string;
	doj: string;
	revision_date: string;
	trainer_name: string;
	status: string;
}

export interface EmployeeCardDetails {
	employee: MasterEmployee;
	operator_skills: OperatorSkill[];
	scores: Score[];
	attendance: Attendance[];
	rescheduled_sessions: any[]; // Added to fix type error
	scheduled_trainings: ScheduledTraining[];
	hanchou_results: HanchouResult[];

	shokuchou_results: ShokuchouResult[];
	productivity_evaluations: ProductivityEvaluation[];
	quality_evaluations: QualityEvaluation[];
	ojt_evaluations: OJTRecord[];
}

export interface LocationState {
	fromReport?: boolean;
}

// Combined type for the ExamResultsCard
export type ExamResult = (HanchouResult & { type: 'hanchou' }) | (ShokuchouResult & { type: 'shokuchou' });