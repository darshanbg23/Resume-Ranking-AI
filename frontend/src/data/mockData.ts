import type {
  Job, Application, Interview, Resume, ScreeningResult, AIInsight,
  AuditLog, AnalyticsData, ChartDataPoint, CandidateProfile, Notification
} from '../types';

// ============================================================
// CANDIDATE PROFILES
// ============================================================
export const mockCandidates: CandidateProfile[] = [
  {
    id: 1, user_id: 1, name: 'Priya Sharma', email: 'priya.sharma@gmail.com',
    phone: '+91 98765 43210', skills: ['Python', 'Django', 'REST APIs', 'PostgreSQL', 'Docker'],
    experience_years: 3, education: 'B.Tech Computer Science — IIT Delhi',
    location: 'Bangalore, India', profile_completion: 85, resume_score: 82,
    total_applications: 8, interviews_scheduled: 2, current_role: 'Backend Developer',
    expected_salary: '₹18-22 LPA', bio: 'Passionate backend developer with 3 years of experience building scalable APIs.',
    linkedin: 'linkedin.com/in/priyasharma', github: 'github.com/priyasharma',
  },
  {
    id: 2, user_id: 2, name: 'Arjun Patel', email: 'arjun.patel@outlook.com',
    phone: '+91 87654 32109', skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'AWS'],
    experience_years: 5, education: 'M.Tech Software Engineering — NIT Trichy',
    location: 'Mumbai, India', profile_completion: 92, resume_score: 88,
    total_applications: 12, interviews_scheduled: 3, current_role: 'Full Stack Developer',
    expected_salary: '₹25-30 LPA', bio: 'Full-stack developer specializing in React and Node.js applications.',
    linkedin: 'linkedin.com/in/arjunpatel', github: 'github.com/arjunpatel',
  },
  {
    id: 3, user_id: 3, name: 'Neha Gupta', email: 'neha.gupta@yahoo.com',
    phone: '+91 76543 21098', skills: ['Java', 'Spring Boot', 'Microservices', 'Kubernetes', 'CI/CD'],
    experience_years: 7, education: 'B.E. Information Technology — BITS Pilani',
    location: 'Hyderabad, India', profile_completion: 98, resume_score: 91,
    total_applications: 6, interviews_scheduled: 1, current_role: 'Senior Software Engineer',
    expected_salary: '₹35-40 LPA', bio: 'Experienced Java developer with expertise in microservices architecture.',
    linkedin: 'linkedin.com/in/nehagupta', github: 'github.com/nehagupta',
  },
  {
    id: 4, user_id: 4, name: 'Rahul Verma', email: 'rahul.verma@gmail.com',
    phone: '+91 65432 10987', skills: ['Python', 'Machine Learning', 'TensorFlow', 'NLP', 'Data Science'],
    experience_years: 4, education: 'M.Sc Data Science — ISI Kolkata',
    location: 'Pune, India', profile_completion: 78, resume_score: 76,
    total_applications: 10, interviews_scheduled: 2, current_role: 'ML Engineer',
    expected_salary: '₹22-28 LPA', bio: 'Machine learning engineer focused on NLP and deep learning solutions.',
    linkedin: 'linkedin.com/in/rahulverma', github: 'github.com/rahulverma',
  },
  {
    id: 5, user_id: 5, name: 'Ananya Krishnan', email: 'ananya.k@gmail.com',
    phone: '+91 54321 09876', skills: ['React', 'Vue.js', 'CSS', 'Figma', 'UI/UX Design'],
    experience_years: 2, education: 'B.Des — NID Ahmedabad',
    location: 'Chennai, India', profile_completion: 70, resume_score: 68,
    total_applications: 15, interviews_scheduled: 4, current_role: 'Frontend Developer',
    expected_salary: '₹12-16 LPA', bio: 'Creative frontend developer with a strong design background.',
    linkedin: 'linkedin.com/in/ananyak', github: 'github.com/ananyak',
  },
  {
    id: 6, user_id: 6, name: 'Vikram Singh', email: 'vikram.singh@hotmail.com',
    phone: '+91 43210 98765', skills: ['DevOps', 'AWS', 'Terraform', 'Docker', 'Jenkins', 'Linux'],
    experience_years: 6, education: 'B.Tech CSE — IIIT Hyderabad',
    location: 'Noida, India', profile_completion: 88, resume_score: 85,
    total_applications: 5, interviews_scheduled: 1, current_role: 'DevOps Engineer',
    expected_salary: '₹28-35 LPA', bio: 'DevOps engineer with expertise in cloud infrastructure and automation.',
    linkedin: 'linkedin.com/in/vikramsingh', github: 'github.com/vikramsingh',
  },
  {
    id: 7, user_id: 7, name: 'Meera Reddy', email: 'meera.reddy@gmail.com',
    phone: '+91 32109 87654', skills: ['Android', 'Kotlin', 'Flutter', 'Firebase', 'REST APIs'],
    experience_years: 3, education: 'B.Tech IT — VIT Vellore',
    location: 'Bangalore, India', profile_completion: 82, resume_score: 79,
    total_applications: 9, interviews_scheduled: 2, current_role: 'Mobile Developer',
    expected_salary: '₹16-20 LPA', bio: 'Mobile developer building cross-platform applications with Flutter and Kotlin.',
    linkedin: 'linkedin.com/in/meerareddy', github: 'github.com/meerareddy',
  },
  {
    id: 8, user_id: 8, name: 'Sanjay Mehta', email: 'sanjay.mehta@gmail.com',
    phone: '+91 21098 76543', skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Redis', 'Celery'],
    experience_years: 8, education: 'M.Tech CSE — IISc Bangalore',
    location: 'Bangalore, India', profile_completion: 95, resume_score: 93,
    total_applications: 4, interviews_scheduled: 2, current_role: 'Staff Engineer',
    expected_salary: '₹45-55 LPA', bio: 'Staff engineer with deep expertise in distributed systems and Python.',
    linkedin: 'linkedin.com/in/sanjaymehta', github: 'github.com/sanjaymehta',
  },
];

// ============================================================
// JOB LISTINGS
// ============================================================
export const mockJobs: Job[] = [
  {
    id: 1, job_title: 'Senior Backend Developer', company: 'TechNova Solutions',
    job_description: 'We are looking for an experienced backend developer to join our engineering team. You will design and build scalable microservices, optimize database queries, and mentor junior developers. The ideal candidate has strong Python/Django experience and a passion for clean code architecture.',
    required_skills: ['Python', 'Django', 'REST APIs', 'PostgreSQL', 'Docker', 'Redis'],
    experience_required: 4, salary_range: '₹20-30 LPA', salary_min: 2000000, salary_max: 3000000,
    location: 'Bangalore, India', job_type: 'full-time', status: 'active',
    applicant_count: 45, posted_at: '2026-06-01', deadline: '2026-07-15',
    created_at: '2026-06-01', updated_at: '2026-06-10',
  },
  {
    id: 2, job_title: 'Full Stack Engineer', company: 'CloudMinds AI',
    job_description: 'Join our fast-growing AI startup as a Full Stack Engineer. Work on cutting-edge AI-powered products using React and Node.js. You\'ll be responsible for building user-facing features, designing APIs, and collaborating with our ML team.',
    required_skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'AWS', 'GraphQL'],
    experience_required: 3, salary_range: '₹18-25 LPA', salary_min: 1800000, salary_max: 2500000,
    location: 'Mumbai, India', job_type: 'full-time', status: 'active',
    applicant_count: 62, posted_at: '2026-06-05', deadline: '2026-07-20',
    created_at: '2026-06-05', updated_at: '2026-06-12',
  },
  {
    id: 3, job_title: 'ML Engineer — NLP', company: 'DataSphere Analytics',
    job_description: 'Seeking an ML Engineer specializing in NLP to develop text classification, entity extraction, and document understanding models. You will work with state-of-the-art transformer models and deploy them at scale.',
    required_skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Transformers', 'MLOps'],
    experience_required: 3, salary_range: '₹22-32 LPA', salary_min: 2200000, salary_max: 3200000,
    location: 'Hyderabad, India', job_type: 'full-time', status: 'active',
    applicant_count: 28, posted_at: '2026-06-08', deadline: '2026-07-25',
    created_at: '2026-06-08', updated_at: '2026-06-14',
  },
  {
    id: 4, job_title: 'DevOps Engineer', company: 'InfraScale Technologies',
    job_description: 'We need a skilled DevOps engineer to manage our cloud infrastructure, CI/CD pipelines, and monitoring systems. Experience with AWS, Terraform, and container orchestration is essential.',
    required_skills: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'Jenkins', 'Linux'],
    experience_required: 5, salary_range: '₹25-35 LPA', salary_min: 2500000, salary_max: 3500000,
    location: 'Noida, India', job_type: 'full-time', status: 'active',
    applicant_count: 19, posted_at: '2026-06-03', deadline: '2026-07-10',
    created_at: '2026-06-03', updated_at: '2026-06-11',
  },
  {
    id: 5, job_title: 'React Frontend Developer', company: 'PixelCraft Studios',
    job_description: 'Looking for a talented React developer to build beautiful, responsive user interfaces for our SaaS platform. Strong CSS skills, component architecture knowledge, and attention to design detail are must-haves.',
    required_skills: ['React', 'TypeScript', 'CSS', 'Tailwind', 'Figma', 'Jest'],
    experience_required: 2, salary_range: '₹12-18 LPA', salary_min: 1200000, salary_max: 1800000,
    location: 'Pune, India', job_type: 'full-time', status: 'active',
    applicant_count: 78, posted_at: '2026-06-10', deadline: '2026-07-30',
    created_at: '2026-06-10', updated_at: '2026-06-14',
  },
  {
    id: 6, job_title: 'Mobile App Developer', company: 'AppVenture Labs',
    job_description: 'Build cross-platform mobile applications using Flutter and native Android/iOS. You\'ll work on consumer-facing products with millions of users.',
    required_skills: ['Flutter', 'Dart', 'Kotlin', 'Firebase', 'REST APIs', 'Git'],
    experience_required: 3, salary_range: '₹16-22 LPA', salary_min: 1600000, salary_max: 2200000,
    location: 'Chennai, India', job_type: 'full-time', status: 'active',
    applicant_count: 34, posted_at: '2026-06-07', deadline: '2026-07-22',
    created_at: '2026-06-07', updated_at: '2026-06-13',
  },
  {
    id: 7, job_title: 'Data Analyst Intern', company: 'InsightPro Research',
    job_description: 'Summer internship for aspiring data analysts. Work with real datasets, build dashboards, and learn from experienced data scientists.',
    required_skills: ['Python', 'SQL', 'Pandas', 'Excel', 'Power BI'],
    experience_required: 0, salary_range: '₹25,000/month', salary_min: 300000, salary_max: 300000,
    location: 'Remote', job_type: 'internship', status: 'active',
    applicant_count: 120, posted_at: '2026-06-12', deadline: '2026-06-30',
    created_at: '2026-06-12', updated_at: '2026-06-14',
  },
  {
    id: 8, job_title: 'Staff Software Engineer', company: 'QuantumEdge Systems',
    job_description: 'Lead architectural decisions for our distributed platform. Mentor engineering teams and drive technical excellence across the organization.',
    required_skills: ['System Design', 'Java', 'Microservices', 'Kubernetes', 'Leadership'],
    experience_required: 8, salary_range: '₹45-60 LPA', salary_min: 4500000, salary_max: 6000000,
    location: 'Bangalore, India', job_type: 'full-time', status: 'active',
    applicant_count: 12, posted_at: '2026-06-02', deadline: '2026-07-15',
    created_at: '2026-06-02', updated_at: '2026-06-09',
  },
];

// ============================================================
// APPLICATIONS
// ============================================================
export const mockApplications: Application[] = [
  {
    id: 1, candidate_id: 1, candidate_name: 'Priya Sharma', job_id: 1,
    job_title: 'Senior Backend Developer', company: 'TechNova Solutions',
    status: 'interview_scheduled', match_score: 87, applied_at: '2026-06-05',
    updated_at: '2026-06-13', resume_id: 1,
  },
  {
    id: 2, candidate_id: 1, candidate_name: 'Priya Sharma', job_id: 2,
    job_title: 'Full Stack Engineer', company: 'CloudMinds AI',
    status: 'under_review', match_score: 72, applied_at: '2026-06-08',
    updated_at: '2026-06-12', resume_id: 1,
  },
  {
    id: 3, candidate_id: 2, candidate_name: 'Arjun Patel', job_id: 2,
    job_title: 'Full Stack Engineer', company: 'CloudMinds AI',
    status: 'shortlisted', match_score: 91, applied_at: '2026-06-06',
    updated_at: '2026-06-14', resume_id: 2,
  },
  {
    id: 4, candidate_id: 2, candidate_name: 'Arjun Patel', job_id: 5,
    job_title: 'React Frontend Developer', company: 'PixelCraft Studios',
    status: 'interview_scheduled', match_score: 85, applied_at: '2026-06-11',
    updated_at: '2026-06-14', resume_id: 2,
  },
  {
    id: 5, candidate_id: 3, candidate_name: 'Neha Gupta', job_id: 8,
    job_title: 'Staff Software Engineer', company: 'QuantumEdge Systems',
    status: 'shortlisted', match_score: 94, applied_at: '2026-06-04',
    updated_at: '2026-06-12', resume_id: 3,
  },
  {
    id: 6, candidate_id: 4, candidate_name: 'Rahul Verma', job_id: 3,
    job_title: 'ML Engineer — NLP', company: 'DataSphere Analytics',
    status: 'applied', match_score: 78, applied_at: '2026-06-12',
    updated_at: '2026-06-12', resume_id: 4,
  },
  {
    id: 7, candidate_id: 5, candidate_name: 'Ananya Krishnan', job_id: 5,
    job_title: 'React Frontend Developer', company: 'PixelCraft Studios',
    status: 'under_review', match_score: 81, applied_at: '2026-06-13',
    updated_at: '2026-06-14', resume_id: 5,
  },
  {
    id: 8, candidate_id: 6, candidate_name: 'Vikram Singh', job_id: 4,
    job_title: 'DevOps Engineer', company: 'InfraScale Technologies',
    status: 'interview_scheduled', match_score: 92, applied_at: '2026-06-05',
    updated_at: '2026-06-13', resume_id: 6,
  },
  {
    id: 9, candidate_id: 7, candidate_name: 'Meera Reddy', job_id: 6,
    job_title: 'Mobile App Developer', company: 'AppVenture Labs',
    status: 'shortlisted', match_score: 86, applied_at: '2026-06-09',
    updated_at: '2026-06-14', resume_id: 7,
  },
  {
    id: 10, candidate_id: 1, candidate_name: 'Priya Sharma', job_id: 3,
    job_title: 'ML Engineer — NLP', company: 'DataSphere Analytics',
    status: 'rejected', match_score: 45, applied_at: '2026-06-10',
    updated_at: '2026-06-13', resume_id: 1,
  },
  {
    id: 11, candidate_id: 8, candidate_name: 'Sanjay Mehta', job_id: 1,
    job_title: 'Senior Backend Developer', company: 'TechNova Solutions',
    status: 'shortlisted', match_score: 96, applied_at: '2026-06-03',
    updated_at: '2026-06-11', resume_id: 8,
  },
  {
    id: 12, candidate_id: 4, candidate_name: 'Rahul Verma', job_id: 7,
    job_title: 'Data Analyst Intern', company: 'InsightPro Research',
    status: 'applied', match_score: 65, applied_at: '2026-06-14',
    updated_at: '2026-06-14', resume_id: 4,
  },
];

// ============================================================
// RESUMES
// ============================================================
export const mockResumes: Resume[] = [
  { id: 1, file: '/resumes/priya_sharma_resume.pdf', fileName: 'Priya_Sharma_Resume_2026.pdf', uploaded_at: '2026-06-03', match_score: 82, status: 'processed', file_size: '245 KB' },
  { id: 2, file: '/resumes/arjun_patel_resume.pdf', fileName: 'Arjun_Patel_CV.pdf', uploaded_at: '2026-06-05', match_score: 88, status: 'processed', file_size: '312 KB' },
  { id: 3, file: '/resumes/neha_gupta_resume.pdf', fileName: 'Neha_Gupta_Resume.pdf', uploaded_at: '2026-06-04', match_score: 91, status: 'processed', file_size: '198 KB' },
  { id: 4, file: '/resumes/rahul_verma_resume.pdf', fileName: 'Rahul_Verma_ML_Resume.pdf', uploaded_at: '2026-06-10', match_score: 76, status: 'processed', file_size: '267 KB' },
  { id: 5, file: '/resumes/ananya_krishnan_resume.pdf', fileName: 'Ananya_K_Portfolio_CV.pdf', uploaded_at: '2026-06-12', match_score: 68, status: 'processing', file_size: '452 KB' },
  { id: 6, file: '/resumes/vikram_singh_resume.pdf', fileName: 'Vikram_Singh_DevOps_CV.pdf', uploaded_at: '2026-06-04', match_score: 85, status: 'processed', file_size: '189 KB' },
  { id: 7, file: '/resumes/meera_reddy_resume.pdf', fileName: 'Meera_Reddy_Mobile_Dev.pdf', uploaded_at: '2026-06-08', match_score: 79, status: 'processed', file_size: '223 KB' },
  { id: 8, file: '/resumes/sanjay_mehta_resume.pdf', fileName: 'Sanjay_Mehta_Staff_Eng.pdf', uploaded_at: '2026-06-02', match_score: 93, status: 'processed', file_size: '178 KB' },
];

// ============================================================
// SCREENING RESULTS
// ============================================================
export const mockScreeningResults: ScreeningResult[] = [
  {
    id: 1, resume_id: 1, job_id: 1, job_title: 'Senior Backend Developer',
    overall_score: 87, skills_score: 90, experience_score: 80, education_score: 85,
    skills_matched: ['Python', 'Django', 'REST APIs', 'PostgreSQL', 'Docker'],
    skills_missing: ['Redis'], recommendation: 'excellent',
    ai_summary: 'Strong backend profile with excellent Python/Django skills. Minor gap in Redis caching experience. Recommend proceeding to technical interview.',
    screened_at: '2026-06-06',
  },
  {
    id: 2, resume_id: 2, job_id: 2, job_title: 'Full Stack Engineer',
    overall_score: 91, skills_score: 95, experience_score: 88, education_score: 90,
    skills_matched: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'AWS'],
    skills_missing: ['GraphQL'], recommendation: 'excellent',
    ai_summary: 'Exceptional full-stack profile. All core skills matched. 5 years of experience exceeds the 3-year requirement. Top candidate.',
    screened_at: '2026-06-07',
  },
  {
    id: 3, resume_id: 3, job_id: 8, job_title: 'Staff Software Engineer',
    overall_score: 94, skills_score: 88, experience_score: 95, education_score: 92,
    skills_matched: ['Java', 'Microservices', 'Kubernetes'],
    skills_missing: ['System Design', 'Leadership'], recommendation: 'excellent',
    ai_summary: 'Senior engineer with 7 years of strong technical experience. Leadership and system design skills could be better highlighted in resume.',
    screened_at: '2026-06-05',
  },
  {
    id: 4, resume_id: 4, job_id: 3, job_title: 'ML Engineer — NLP',
    overall_score: 78, skills_score: 75, experience_score: 80, education_score: 90,
    skills_matched: ['Python', 'TensorFlow', 'NLP'],
    skills_missing: ['PyTorch', 'Transformers', 'MLOps'], recommendation: 'good',
    ai_summary: 'Good ML foundation with NLP focus. Missing PyTorch and MLOps experience. Recommend additional screening for transformer model experience.',
    screened_at: '2026-06-13',
  },
  {
    id: 5, resume_id: 6, job_id: 4, job_title: 'DevOps Engineer',
    overall_score: 92, skills_score: 95, experience_score: 90, education_score: 85,
    skills_matched: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'Jenkins', 'Linux'],
    skills_missing: [], recommendation: 'excellent',
    ai_summary: 'Perfect skills match for the DevOps role. 6 years of relevant experience. All required technologies covered. Highly recommended.',
    screened_at: '2026-06-06',
  },
];

// ============================================================
// INTERVIEWS
// ============================================================
export const mockInterviews: Interview[] = [
  {
    id: 1, candidate_id: 1, candidate_name: 'Priya Sharma', job_id: 1,
    job_title: 'Senior Backend Developer', company: 'TechNova Solutions',
    date: '2026-06-18', time: '10:00 AM', duration: '45 min',
    type: 'technical', status: 'scheduled', meeting_link: 'https://meet.google.com/abc-defg-hij',
    interviewer: 'Karthik Rajan, Engineering Manager',
    notes: 'Focus on system design and Django architecture patterns.',
  },
  {
    id: 2, candidate_id: 2, candidate_name: 'Arjun Patel', job_id: 5,
    job_title: 'React Frontend Developer', company: 'PixelCraft Studios',
    date: '2026-06-19', time: '2:30 PM', duration: '60 min',
    type: 'technical', status: 'scheduled', meeting_link: 'https://zoom.us/j/123456789',
    interviewer: 'Deepa Nair, Tech Lead',
    notes: 'Live coding session — React component architecture and state management.',
  },
  {
    id: 3, candidate_id: 6, candidate_name: 'Vikram Singh', job_id: 4,
    job_title: 'DevOps Engineer', company: 'InfraScale Technologies',
    date: '2026-06-20', time: '11:00 AM', duration: '45 min',
    type: 'video', status: 'scheduled', meeting_link: 'https://teams.microsoft.com/l/meetup/abc',
    interviewer: 'Amit Joshi, VP Engineering',
    notes: 'Discussion on cloud architecture and CI/CD pipeline design.',
  },
  {
    id: 4, candidate_id: 1, candidate_name: 'Priya Sharma', job_id: 2,
    job_title: 'Full Stack Engineer', company: 'CloudMinds AI',
    date: '2026-06-10', time: '3:00 PM', duration: '30 min',
    type: 'phone', status: 'completed',
    interviewer: 'Ravi Kumar, HR Lead',
    notes: 'Initial phone screen completed. Candidate showed strong communication skills.',
    feedback: 'Positive — proceed to technical round.',
  },
  {
    id: 5, candidate_id: 3, candidate_name: 'Neha Gupta', job_id: 8,
    job_title: 'Staff Software Engineer', company: 'QuantumEdge Systems',
    date: '2026-06-22', time: '10:30 AM', duration: '90 min',
    type: 'in-person', status: 'scheduled',
    location: 'QuantumEdge Office, Koramangala, Bangalore',
    interviewer: 'Suresh Babu, CTO',
    notes: 'Final round — system design and leadership assessment.',
  },
];

// ============================================================
// AI INSIGHTS
// ============================================================
export const mockAIInsights: AIInsight[] = [
  {
    id: 1, resume_id: 1, overall_match_score: 82,
    skill_gaps: [
      { skill: 'Redis', current_level: 'beginner', required_level: 'intermediate', priority: 'high' },
      { skill: 'Kubernetes', current_level: 'none', required_level: 'intermediate', priority: 'medium' },
      { skill: 'GraphQL', current_level: 'none', required_level: 'beginner', priority: 'low' },
      { skill: 'CI/CD', current_level: 'beginner', required_level: 'advanced', priority: 'high' },
    ],
    recommendations: [
      'Add Redis caching projects to your portfolio to strengthen backend skills.',
      'Consider obtaining AWS Solutions Architect certification.',
      'Highlight leadership experience in your resume — even informal mentoring counts.',
      'Add metrics and quantifiable achievements to your work experience section.',
    ],
    suggested_roles: [
      { title: 'Backend Developer', match_percentage: 87, reason: 'Strong Python/Django foundation' },
      { title: 'API Engineer', match_percentage: 82, reason: 'REST API and database expertise' },
      { title: 'Software Engineer', match_percentage: 78, reason: 'Broad CS fundamentals' },
      { title: 'Data Engineer', match_percentage: 65, reason: 'Python and SQL knowledge transferable' },
    ],
    improvement_tips: [
      { category: 'Skills', tip: 'Learn Redis and implement a caching layer in a side project', impact: 'high' },
      { category: 'Resume', tip: 'Quantify your achievements — e.g., "Reduced API response time by 40%"', impact: 'high' },
      { category: 'Profile', tip: 'Add a professional summary highlighting your specialization', impact: 'medium' },
      { category: 'Experience', tip: 'Contribute to open-source Django projects for visibility', impact: 'medium' },
      { category: 'Education', tip: 'Complete an online certification in cloud computing', impact: 'low' },
    ],
    strengths: ['Strong Python fundamentals', 'Django REST Framework expertise', 'Clean code practices', 'Database optimization skills'],
    generated_at: '2026-06-06',
  },
];

// ============================================================
// AUDIT LOGS
// ============================================================
export const mockAuditLogs: AuditLog[] = [
  { id: 1, user_id: 1, user_name: 'Priya Sharma', user_email: 'priya.sharma@gmail.com', action: 'login', category: 'auth', details: 'User logged in successfully', ip_address: '103.21.58.192', timestamp: '2026-06-15T09:30:00Z' },
  { id: 2, user_id: 1, user_name: 'Priya Sharma', user_email: 'priya.sharma@gmail.com', action: 'upload_resume', category: 'resume', details: 'Uploaded resume: Priya_Sharma_Resume_2026.pdf', ip_address: '103.21.58.192', timestamp: '2026-06-15T09:35:00Z' },
  { id: 3, user_id: 10, user_name: 'Kavitha Iyer', user_email: 'kavitha.iyer@technova.com', action: 'create_job', category: 'job', details: 'Created job: Senior Backend Developer at TechNova Solutions', ip_address: '49.37.142.80', timestamp: '2026-06-15T08:45:00Z' },
  { id: 4, user_id: 10, user_name: 'Kavitha Iyer', user_email: 'kavitha.iyer@technova.com', action: 'screen_resume', category: 'resume', details: 'Screened 5 resumes for Senior Backend Developer', ip_address: '49.37.142.80', timestamp: '2026-06-15T10:15:00Z' },
  { id: 5, user_id: 2, user_name: 'Arjun Patel', user_email: 'arjun.patel@outlook.com', action: 'login', category: 'auth', details: 'User logged in successfully', ip_address: '122.161.73.45', timestamp: '2026-06-15T07:20:00Z' },
  { id: 6, user_id: 10, user_name: 'Kavitha Iyer', user_email: 'kavitha.iyer@technova.com', action: 'shortlist', category: 'job', details: 'Shortlisted Sanjay Mehta for Senior Backend Developer', ip_address: '49.37.142.80', timestamp: '2026-06-15T10:30:00Z' },
  { id: 7, user_id: 100, user_name: 'System', user_email: 'system@resumerank.ai', action: 'system_event', category: 'system', details: 'Daily AI screening batch completed — 12 resumes processed', timestamp: '2026-06-15T06:00:00Z' },
  { id: 8, user_id: 3, user_name: 'Neha Gupta', user_email: 'neha.gupta@yahoo.com', action: 'update_profile', category: 'user', details: 'Updated skills and experience sections', ip_address: '157.48.92.110', timestamp: '2026-06-14T18:45:00Z' },
  { id: 9, user_id: 6, user_name: 'Vikram Singh', user_email: 'vikram.singh@hotmail.com', action: 'login', category: 'auth', details: 'User logged in from new device', ip_address: '182.73.21.88', timestamp: '2026-06-14T14:30:00Z' },
  { id: 10, user_id: 100, user_name: 'Admin', user_email: 'admin@resumerank.ai', action: 'approve_recruiter', category: 'user', details: 'Approved recruiter registration: Rohan Das from InfraScale Technologies', timestamp: '2026-06-14T11:00:00Z' },
  { id: 11, user_id: 10, user_name: 'Kavitha Iyer', user_email: 'kavitha.iyer@technova.com', action: 'schedule_interview', category: 'interview', details: 'Scheduled technical interview with Priya Sharma for June 18', ip_address: '49.37.142.80', timestamp: '2026-06-14T16:00:00Z' },
  { id: 12, user_id: 7, user_name: 'Meera Reddy', user_email: 'meera.reddy@gmail.com', action: 'register', category: 'auth', details: 'New candidate registration', ip_address: '223.186.45.67', timestamp: '2026-06-13T10:15:00Z' },
];

// ============================================================
// NOTIFICATIONS
// ============================================================
export const mockNotifications: Notification[] = [
  { id: 1, title: 'Interview Scheduled', message: 'Your technical interview with TechNova Solutions is scheduled for June 18 at 10:00 AM.', type: 'success', read: false, created_at: '2026-06-14T16:00:00Z' },
  { id: 2, title: 'Application Update', message: 'Your application for Full Stack Engineer at CloudMinds AI is now under review.', type: 'info', read: false, created_at: '2026-06-13T09:30:00Z' },
  { id: 3, title: 'Resume Analyzed', message: 'Your resume has been analyzed by our AI engine. View your insights and match scores.', type: 'success', read: true, created_at: '2026-06-12T14:00:00Z' },
  { id: 4, title: 'Profile Incomplete', message: 'Complete your profile to improve job matching. Currently at 85% completion.', type: 'warning', read: true, created_at: '2026-06-11T10:00:00Z' },
  { id: 5, title: 'New Jobs Available', message: '3 new job openings match your profile. Check the Job Search page.', type: 'info', read: false, created_at: '2026-06-10T08:00:00Z' },
];

// ============================================================
// CHART DATA
// ============================================================
export const registrationChartData: ChartDataPoint[] = [
  { name: 'Jan', value: 45 }, { name: 'Feb', value: 62 },
  { name: 'Mar', value: 78 }, { name: 'Apr', value: 95 },
  { name: 'May', value: 110 }, { name: 'Jun', value: 134 },
];

export const applicationChartData: ChartDataPoint[] = [
  { name: 'Jan', value: 120 }, { name: 'Feb', value: 165 },
  { name: 'Mar', value: 210 }, { name: 'Apr', value: 248 },
  { name: 'May', value: 305 }, { name: 'Jun', value: 378 },
];

export const hiringTrendData: ChartDataPoint[] = [
  { name: 'Jan', value: 12, value2: 8 }, { name: 'Feb', value: 18, value2: 14 },
  { name: 'Mar', value: 25, value2: 19 }, { name: 'Apr', value: 22, value2: 17 },
  { name: 'May', value: 30, value2: 24 }, { name: 'Jun', value: 35, value2: 28 },
];

export const topSkillsData: ChartDataPoint[] = [
  { name: 'Python', value: 85 }, { name: 'React', value: 78 },
  { name: 'JavaScript', value: 75 }, { name: 'AWS', value: 62 },
  { name: 'Docker', value: 58 }, { name: 'TypeScript', value: 55 },
  { name: 'Java', value: 52 }, { name: 'SQL', value: 48 },
];

export const matchScoreDistribution: ChartDataPoint[] = [
  { name: '90-100', value: 15 }, { name: '75-89', value: 35 },
  { name: '50-74', value: 28 }, { name: '25-49', value: 14 },
  { name: '0-24', value: 8 },
];

// ============================================================
// ANALYTICS SUMMARY
// ============================================================
export const mockAnalytics: AnalyticsData = {
  total_users: 1247, total_candidates: 986, total_recruiters: 148,
  total_jobs: 67, active_jobs: 42, average_match_score: 74,
  applications_today: 23, shortlisted_count: 89, interviews_scheduled: 34,
  user_growth_percentage: 12.5, success_rate: 87,
};
