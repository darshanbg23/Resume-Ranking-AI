// User types
export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  phone?: string;
  avatar?: string;
  is_active?: boolean;
}

// Candidate Profile
export interface CandidateProfile {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience_years: number;
  education: string;
  location: string;
  profile_completion: number;
  resume_score: number;
  total_applications: number;
  interviews_scheduled: number;
  avatar?: string;
  bio?: string;
  linkedin?: string;
  github?: string;
  current_role?: string;
  expected_salary?: string;
}

// Resume types
export interface Resume {
  id: number;
  file: string;
  fileName: string;
  uploaded_at: string;
  match_score?: number;
  status: 'pending' | 'processing' | 'processed' | 'failed';
  file_size?: string;
  screening_result?: ScreeningResult;
}

// Screening Result
export interface ScreeningResult {
  id: number;
  resume_id: number;
  job_id?: number;
  job_title?: string;
  overall_score: number;
  skills_score: number;
  experience_score: number;
  education_score: number;
  skills_matched: string[];
  skills_missing: string[];
  recommendation: 'excellent' | 'good' | 'average' | 'poor';
  ai_summary?: string;
  screened_at: string;
}

// Job types
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
export type JobStatus = 'active' | 'closed' | 'draft';

export interface Job {
  id: number;
  job_title: string;
  job_description: string;
  required_skills: string[];
  experience_required: number;
  salary_range?: string;
  salary_min?: number;
  salary_max?: number;
  location: string;
  company: string;
  company_logo?: string;
  job_type: JobType;
  status: JobStatus;
  applicant_count: number;
  posted_at: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
  match_score?: number;
}

// Application types
export type ApplicationStatus = 'applied' | 'under_review' | 'shortlisted' | 'rejected' | 'interview_scheduled' | 'hired';

export interface Application {
  id: number;
  candidate_id: number;
  candidate_name: string;
  job_id: number;
  job_title: string;
  company: string;
  status: ApplicationStatus;
  match_score: number;
  applied_at: string;
  updated_at: string;
  resume_id?: number;
  notes?: string;
}

// Interview types
export type InterviewType = 'phone' | 'video' | 'in-person' | 'technical' | 'hr';
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface Interview {
  id: number;
  candidate_id: number;
  candidate_name: string;
  job_id: number;
  job_title: string;
  company: string;
  date: string;
  time: string;
  duration: string;
  type: InterviewType;
  status: InterviewStatus;
  meeting_link?: string;
  location?: string;
  interviewer?: string;
  notes?: string;
  feedback?: string;
}

// AI Insight types
export interface AIInsight {
  id: number;
  resume_id: number;
  overall_match_score: number;
  skill_gaps: SkillGap[];
  recommendations: string[];
  suggested_roles: SuggestedRole[];
  improvement_tips: ImprovementTip[];
  strengths: string[];
  generated_at: string;
}

export interface SkillGap {
  skill: string;
  current_level: 'none' | 'beginner' | 'intermediate' | 'advanced';
  required_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  priority: 'high' | 'medium' | 'low';
}

export interface SuggestedRole {
  title: string;
  match_percentage: number;
  reason: string;
}

export interface ImprovementTip {
  category: string;
  tip: string;
  impact: 'high' | 'medium' | 'low';
}

// Audit Log types
export type AuditAction = 'login' | 'logout' | 'register' | 'upload_resume' | 'create_job' | 'update_job' | 'delete_job' | 'screen_resume' | 'shortlist' | 'reject' | 'schedule_interview' | 'update_profile' | 'block_user' | 'approve_recruiter' | 'system_event';
export type AuditCategory = 'auth' | 'resume' | 'job' | 'user' | 'system' | 'interview';

export interface AuditLog {
  id: number;
  user_id?: number;
  user_name: string;
  user_email: string;
  action: AuditAction;
  category: AuditCategory;
  details: string;
  ip_address?: string;
  timestamp: string;
}

// Analytics types
export interface AnalyticsData {
  total_users: number;
  total_candidates: number;
  total_recruiters: number;
  total_jobs: number;
  active_jobs: number;
  average_match_score: number;
  applications_today: number;
  shortlisted_count: number;
  interviews_scheduled: number;
  user_growth_percentage: number;
  success_rate: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number;
}

// Recruiter Profile
export interface RecruiterProfile {
  id: number;
  user_id: number;
  company_name: string;
  designation: string;
  company_size: string;
  industry: string;
  jobs_posted: number;
  candidates_screened: number;
  is_verified: boolean;
}

// API Response types
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data?: T;
}

// Pagination
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}
