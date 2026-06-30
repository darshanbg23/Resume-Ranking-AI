"""
seed_demo_data -- Clean demo data seeder for academic project demonstration.

Creates a small, professional dataset for a 5–10 minute live demo:
- 1 Admin account
- 2 Recruiters (Bengaluru region) with 2-3 jobs each
- 3 Candidates (Bengaluru region) with complete profiles, resumes, and AI data
- 5 Jobs in Bengaluru, Karnataka
- 7 Applications across all statuses
- ~10 Notifications
- Full AI analysis data for every resume

Usage:
    python manage.py seed_demo_data

The command is repeatable -- it clears old demo data before recreating.
"""
import os
import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from django.core.files.base import ContentFile
from django.utils import timezone

from resume_checker.models import UserProfile, JobDescription, UserResume
from resume_checker.ai_models import (
    JobApplication, ResumeJobMatch, SkillGapResult,
    InterviewQuestions, RoleRecommendation, Notification,
)


# -------------------------------------------------------------
# DATA CONSTANTS
# -------------------------------------------------------------

DEMO_PASSWORD = 'Demo@1234'

RECRUITERS = [
    {
        'email': 'rahul.sharma@demo.com',
        'first_name': 'Rahul',
        'last_name': 'Sharma',
        'profile': {
            'phone': '+91 98765 43210',
            'bio': 'Senior Technical Recruiter with 8+ years of experience in hiring top-tier tech talent for product companies across Bengaluru.',
            'location': 'Bengaluru, Karnataka',
            'company_name': 'TechNova Solutions',
            'designation': 'Senior Technical Recruiter',
            'current_role': 'Head of Talent Acquisition',
            'experience_years': 8,
            'education': 'MBA in Human Resources, Symbiosis Pune',
        },
    },
    {
        'email': 'priya.reddy@demo.com',
        'first_name': 'Priya',
        'last_name': 'Reddy',
        'profile': {
            'phone': '+91 87654 32109',
            'bio': 'HR Manager specializing in data science and analytics recruitment. Building high-performance engineering teams at DataSphere Analytics, Bengaluru.',
            'location': 'Bengaluru, Karnataka',
            'company_name': 'DataSphere Analytics',
            'designation': 'HR Manager',
            'current_role': 'Recruitment Manager',
            'experience_years': 6,
            'education': 'MBA in HR, IIM Kozhikode',
        },
    },
]

# ---- Candidate 1: Nandan Kumar — 2 resumes (v1 & v2) ----
# ---- Candidate 2: Prajwal Gowda — 1 resume ----
# ---- Candidate 3: Sneha Reddy — 1 resume ----

CANDIDATES = [
    {
        'email': 'nandan.kumar@demo.com',
        'first_name': 'Nandan',
        'last_name': 'Kumar',
        'profile': {
            'phone': '+91 90001 11111',
            'bio': 'Full-stack developer with 3 years of experience in Python and JavaScript ecosystems. Passionate about building scalable web applications and open-source tools.',
            'location': 'Bengaluru, Karnataka',
            'skills': ['Python', 'Django', 'React', 'SQL', 'REST APIs', 'Git', 'Docker'],
            'experience_years': 3,
            'education': 'B.Tech in Computer Science, RV College of Engineering, Bengaluru',
            'current_role': 'Software Developer',
        },
        'resumes': [
            # Resume Version 1 — initial version
            {
                'file_name': 'Nandan_Kumar_Resume_v1.pdf',
                'skills_extracted': ['Python', 'Django', 'React', 'SQL', 'REST APIs', 'Git', 'HTML', 'CSS', 'JavaScript'],
                'experience_extracted': '2 years',
                'education_extracted': 'B.Tech in Computer Science, RV College of Engineering, Bengaluru, 2023',
                'name_extracted': 'Nandan Kumar',
                'email_extracted': 'nandan.kumar@demo.com',
                'phone_extracted': '+91 90001 11111',
                'certifications_extracted': ['Python Professional Certificate'],
                'projects_extracted': [
                    {'name': 'Task Management API', 'description': 'RESTful API for task management with JWT auth, built using Django REST Framework'},
                    {'name': 'Portfolio Website', 'description': 'Personal portfolio built with React and hosted on Vercel'},
                ],
                'resume_summary': 'Nandan Kumar is a full-stack developer with 2 years of experience in Python, Django, and React. He has built RESTful APIs and personal projects. Holds Python Professional Certificate.',
                'match_score': 72.0,
                'analysis_result': {
                    'rank': 72,
                    'skills': ['Python', 'Django', 'React', 'SQL', 'REST APIs', 'Git'],
                    'experience': '2 years of full-stack development',
                    'project_categories': ['Web Development', 'Backend Development'],
                    'strengths': ['Solid Python and Django foundation', 'REST API experience'],
                    'weaknesses': ['Limited cloud deployment experience', 'No Docker/DevOps skills listed', 'Only 2 years experience'],
                },
                'extracted_text': 'NANDAN KUMAR\nFull Stack Developer\nEmail: nandan.kumar@demo.com | Phone: +91 90001 11111\nLocation: Bengaluru, Karnataka\n\nPROFESSIONAL SUMMARY\nFull-stack developer with 2 years of experience building web applications using Python, Django, and React.\n\nSKILLS\nPython, Django, Django REST Framework, React.js, JavaScript, SQL, Git, HTML, CSS, REST APIs\n\nEXPERIENCE\nJunior Software Developer | WebStart Technologies | 2022 - 2024\n- Developed RESTful APIs using Django REST Framework\n- Built responsive frontend interfaces using React.js\n- Collaborated on database design and optimization\n\nEDUCATION\nB.Tech in Computer Science | RV College of Engineering, Bengaluru | 2019-2023 | CGPA: 8.2\n\nCERTIFICATIONS\n- Python Professional Certificate (2023)\n\nPROJECTS\n1. Task Management API: RESTful API with JWT auth using DRF\n2. Portfolio Website: Personal portfolio built with React',
            },
            # Resume Version 2 — updated with more skills & experience
            {
                'file_name': 'Nandan_Kumar_Resume_v2.pdf',
                'skills_extracted': ['Python', 'Django', 'React', 'SQL', 'REST APIs', 'Git', 'Docker', 'PostgreSQL', 'JavaScript', 'HTML', 'CSS', 'AWS', 'Redis'],
                'experience_extracted': '3 years',
                'education_extracted': 'B.Tech in Computer Science, RV College of Engineering, Bengaluru, 2023',
                'name_extracted': 'Nandan Kumar',
                'email_extracted': 'nandan.kumar@demo.com',
                'phone_extracted': '+91 90001 11111',
                'certifications_extracted': ['AWS Certified Cloud Practitioner', 'Python Professional Certificate'],
                'projects_extracted': [
                    {'name': 'E-Commerce Platform', 'description': 'Built a full-stack e-commerce platform with Django and React supporting 10K+ users with payment gateway integration'},
                    {'name': 'Task Management API', 'description': 'RESTful API for task management with JWT auth, built using Django REST Framework'},
                    {'name': 'Real-time Chat App', 'description': 'WebSocket-based chat application using Django Channels and React with Redis pub/sub'},
                ],
                'resume_summary': 'Nandan Kumar is a full-stack developer with 3 years of experience specializing in Python, Django, and React. He has built scalable web applications including e-commerce platforms and real-time systems. Holds AWS Cloud Practitioner and Python Professional certifications.',
                'match_score': 85.0,
                'analysis_result': {
                    'rank': 85,
                    'skills': ['Python', 'Django', 'React', 'SQL', 'REST APIs', 'Git', 'Docker', 'PostgreSQL', 'AWS', 'Redis'],
                    'experience': '3 years of professional full-stack development',
                    'project_categories': ['Web Development', 'Backend Development', 'Cloud Computing'],
                    'strengths': ['Strong full-stack skills', 'Production deployment experience', 'Cloud certification', 'Docker & Redis experience'],
                    'weaknesses': ['Limited ML/AI experience', 'No mobile development background'],
                },
                'extracted_text': 'NANDAN KUMAR\nFull Stack Developer\nEmail: nandan.kumar@demo.com | Phone: +91 90001 11111\nLocation: Bengaluru, Karnataka\n\nPROFESSIONAL SUMMARY\nFull-stack developer with 3 years of experience building scalable web applications using Python, Django, React, and cloud technologies.\n\nSKILLS\nPython, Django, Django REST Framework, React.js, JavaScript, SQL, PostgreSQL, Git, Docker, AWS, Redis, HTML, CSS, REST APIs\n\nEXPERIENCE\nSoftware Developer | TechCorp Solutions, Bengaluru | 2023 - Present\n- Developed and maintained RESTful APIs using Django REST Framework\n- Built responsive frontend interfaces using React.js\n- Deployed applications on AWS EC2 with Docker containers\n- Integrated Redis caching reducing response times by 40%\n\nJunior Developer | WebStart Technologies, Bengaluru | 2022 - 2023\n- Built internal tools using Python and Django\n- Collaborated with senior developers on database optimization\n\nEDUCATION\nB.Tech in Computer Science | RV College of Engineering, Bengaluru | 2019-2023 | CGPA: 8.2\n\nCERTIFICATIONS\n- AWS Certified Cloud Practitioner (2024)\n- Python Professional Certificate (2023)\n\nPROJECTS\n1. E-Commerce Platform: Full-stack e-commerce with Django + React, 10K+ users, payment integration\n2. Task Management API: RESTful API with JWT auth using DRF\n3. Real-time Chat App: WebSocket chat using Django Channels + React + Redis',
            },
        ],
    },
    {
        'email': 'prajwal.gowda@demo.com',
        'first_name': 'Prajwal',
        'last_name': 'Gowda',
        'profile': {
            'phone': '+91 90002 22222',
            'bio': 'Data analyst with expertise in Python, Power BI, and SQL. Experienced in deriving actionable business insights from complex datasets. Passionate about data-driven decision making.',
            'location': 'Bengaluru, Karnataka',
            'skills': ['Python', 'Data Analytics', 'Power BI', 'SQL', 'Excel', 'Tableau', 'Pandas'],
            'experience_years': 2,
            'education': 'M.Sc. in Data Science, Christ University, Bengaluru',
            'current_role': 'Data Analyst',
        },
        'resumes': [
            {
                'file_name': 'Prajwal_Gowda_Resume.pdf',
                'skills_extracted': ['Python', 'Data Analytics', 'Power BI', 'SQL', 'Excel', 'Tableau', 'Pandas', 'NumPy', 'Matplotlib', 'Statistics', 'Data Visualization', 'Machine Learning'],
                'experience_extracted': '2 years',
                'education_extracted': 'M.Sc. in Data Science, Christ University, Bengaluru, 2023',
                'name_extracted': 'Prajwal Gowda',
                'email_extracted': 'prajwal.gowda@demo.com',
                'phone_extracted': '+91 90002 22222',
                'certifications_extracted': ['Google Data Analytics Professional Certificate', 'Microsoft Power BI Certification'],
                'projects_extracted': [
                    {'name': 'Sales Dashboard', 'description': 'Interactive Power BI dashboard tracking sales performance across 15 regions with drill-down analytics'},
                    {'name': 'Customer Churn Analysis', 'description': 'Predictive analysis of customer churn using Python and machine learning achieving 87% accuracy'},
                    {'name': 'Inventory Optimization Tool', 'description': 'Python-based inventory management analytics tool reducing overstock by 22%'},
                ],
                'resume_summary': 'Prajwal Gowda is a data analyst with 2 years of experience in Python, Power BI, and SQL. He specializes in building interactive dashboards and performing predictive analytics. Certified by Google and Microsoft in data analytics and Power BI.',
                'match_score': 88.0,
                'analysis_result': {
                    'rank': 88,
                    'skills': ['Python', 'Data Analytics', 'Power BI', 'SQL', 'Excel', 'Tableau', 'Pandas', 'Machine Learning'],
                    'experience': '2 years of data analytics and visualization',
                    'project_categories': ['Data Analytics', 'Business Intelligence', 'Data Visualization'],
                    'strengths': ['Strong visualization skills', 'Multiple BI tool proficiency', 'Industry certifications', 'ML exposure'],
                    'weaknesses': ['Limited big data tools experience', 'No deep learning skills'],
                },
                'extracted_text': 'PRAJWAL GOWDA\nData Analyst\nEmail: prajwal.gowda@demo.com | Phone: +91 90002 22222\nLocation: Bengaluru, Karnataka\n\nPROFESSIONAL SUMMARY\nData analyst with 2 years of experience in Python, Power BI, and SQL. Expert in building interactive dashboards and performing statistical analysis to drive business decisions.\n\nSKILLS\nPython, Pandas, NumPy, Matplotlib, SQL, Power BI, Tableau, Excel, Statistics, Data Visualization, Data Analytics, Machine Learning\n\nEXPERIENCE\nData Analyst | InsightHub Analytics, Bengaluru | 2023 - Present\n- Created Power BI dashboards tracking KPIs across 15 regions\n- Performed customer churn analysis using Python, reducing churn by 12%\n- Automated weekly reporting saving 10 hours per week\n\nData Analyst Intern | DataWorks Inc., Bengaluru | 2022 - 2023\n- Built Tableau dashboards for executive reporting\n- Cleaned and transformed large datasets using Pandas\n\nEDUCATION\nM.Sc. in Data Science | Christ University, Bengaluru | 2021-2023 | CGPA: 8.5\nB.Sc. in Statistics | Bangalore University | 2018-2021 | CGPA: 7.9\n\nCERTIFICATIONS\n- Google Data Analytics Professional Certificate (2023)\n- Microsoft Power BI Certification (2023)\n\nPROJECTS\n1. Sales Dashboard: Interactive Power BI dashboard, 15 regions with drill-down\n2. Customer Churn Analysis: Predictive ML model in Python, 87% accuracy\n3. Inventory Optimization Tool: Python analytics reducing overstock by 22%',
            },
        ],
    },
    {
        'email': 'sneha.reddy@demo.com',
        'first_name': 'Sneha',
        'last_name': 'Reddy',
        'profile': {
            'phone': '+91 90003 33333',
            'bio': 'Aspiring Machine Learning engineer with hands-on experience in Python, TensorFlow, and NLP. Built production-grade ML models during internship. Passionate about AI research and real-world applications.',
            'location': 'Bengaluru, Karnataka',
            'skills': ['Python', 'Machine Learning', 'TensorFlow', 'NLP', 'Pandas', 'Scikit-Learn'],
            'experience_years': 1,
            'education': 'B.Tech in Computer Science (AI & ML), PES University, Bengaluru',
            'current_role': 'ML Intern',
        },
        'resumes': [
            {
                'file_name': 'Sneha_Reddy_Resume.pdf',
                'skills_extracted': ['Python', 'Machine Learning', 'TensorFlow', 'NLP', 'Pandas', 'NumPy', 'Scikit-Learn', 'Deep Learning', 'Matplotlib', 'SQL', 'Git', 'Keras'],
                'experience_extracted': '1 year (internship)',
                'education_extracted': 'B.Tech in Computer Science (AI & ML), PES University, Bengaluru, 2024',
                'name_extracted': 'Sneha Reddy',
                'email_extracted': 'sneha.reddy@demo.com',
                'phone_extracted': '+91 90003 33333',
                'certifications_extracted': ['TensorFlow Developer Certificate', 'Google Machine Learning Crash Course'],
                'projects_extracted': [
                    {'name': 'Sentiment Analysis Engine', 'description': 'Built a sentiment analysis model using LSTM and word embeddings achieving 91% accuracy on IMDB reviews'},
                    {'name': 'Image Classifier', 'description': 'CNN-based image classification for plant disease detection with 88% accuracy using TensorFlow'},
                    {'name': 'Resume Parser', 'description': 'NLP-based resume parser using spaCy and regex for automated information extraction'},
                ],
                'resume_summary': 'Sneha Reddy is an aspiring ML engineer with 1 year of internship experience in Python, TensorFlow, and NLP. She has built sentiment analysis engines and image classifiers. Holds TensorFlow Developer Certificate and completed Google ML Crash Course.',
                'match_score': 76.0,
                'analysis_result': {
                    'rank': 76,
                    'skills': ['Python', 'Machine Learning', 'TensorFlow', 'NLP', 'Pandas', 'Scikit-Learn', 'Deep Learning', 'Keras'],
                    'experience': '1 year of ML internship experience',
                    'project_categories': ['Machine Learning', 'NLP', 'Computer Vision', 'Deep Learning'],
                    'strengths': ['Strong ML fundamentals', 'Hands-on deep learning projects', 'TensorFlow certification'],
                    'weaknesses': ['Limited professional experience', 'No production deployment skills', 'No web development background'],
                },
                'extracted_text': 'SNEHA REDDY\nMachine Learning Intern\nEmail: sneha.reddy@demo.com | Phone: +91 90003 33333\nLocation: Bengaluru, Karnataka\n\nPROFESSIONAL SUMMARY\nAspiring ML engineer with 1 year of internship experience in Python, TensorFlow, and NLP. Strong foundation in deep learning, computer vision, and natural language processing.\n\nSKILLS\nPython, TensorFlow, Keras, Scikit-Learn, NLP, Deep Learning, Machine Learning, Pandas, NumPy, Matplotlib, SQL, Git\n\nEXPERIENCE\nML Intern | AIFirst Labs, Bengaluru | 2023 - 2024\n- Built sentiment analysis engine processing customer reviews with 91% accuracy\n- Developed CNN-based plant disease classification model\n- Contributed to NLP pipeline for automated document processing\n\nEDUCATION\nB.Tech in Computer Science (AI & ML) | PES University, Bengaluru | 2020-2024 | CGPA: 8.6\n\nCERTIFICATIONS\n- TensorFlow Developer Certificate (2024)\n- Google Machine Learning Crash Course (2023)\n\nPROJECTS\n1. Sentiment Analysis Engine: LSTM-based, 91% accuracy on IMDB reviews\n2. Image Classifier: CNN for plant disease detection, 88% accuracy\n3. Resume Parser: NLP-based extraction using spaCy',
            },
        ],
    },
]

JOBS = [
    # --- Rahul Sharma's jobs (recruiter_index=0, TechNova Solutions) ---
    {
        'title': 'Python Developer',
        'company': 'TechNova Solutions',
        'recruiter_index': 0,
        'description': 'We are looking for an experienced Python Developer to join our backend team in Bengaluru. You will design and develop high-performance APIs, work with databases, and integrate third-party services. Experience with Django or Flask is required. You will collaborate closely with frontend developers and DevOps engineers to deliver scalable solutions.',
        'required_skills': ['Python', 'Django', 'REST APIs', 'SQL', 'Git'],
        'experience_required': '2-4 years',
        'location': 'Bengaluru, Karnataka',
        'salary_min': 800000,
        'salary_max': 1400000,
        'job_type': 'full-time',
    },
    {
        'title': 'Full Stack Developer',
        'company': 'TechNova Solutions',
        'recruiter_index': 0,
        'description': 'Join our engineering team in Bengaluru as a Full Stack Developer working on both frontend and backend systems. You will build end-to-end features using Python/Django and React. Strong understanding of databases, APIs, and deployment pipelines is expected. Experience with Docker and cloud platforms is a plus.',
        'required_skills': ['Python', 'Django', 'React', 'SQL', 'REST APIs', 'Docker', 'Git'],
        'experience_required': '3-5 years',
        'location': 'Bengaluru, Karnataka',
        'salary_min': 1200000,
        'salary_max': 2000000,
        'job_type': 'full-time',
    },
    {
        'title': 'React Developer',
        'company': 'TechNova Solutions',
        'recruiter_index': 0,
        'description': 'Seeking a talented React Developer to build modern, responsive web applications at our Bengaluru office. You will work with TypeScript, implement state management solutions, and ensure pixel-perfect UI delivery. Experience with Next.js or Vite is a plus. You will be part of an agile team building customer-facing products.',
        'required_skills': ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Redux'],
        'experience_required': '1-3 years',
        'location': 'Bengaluru, Karnataka',
        'salary_min': 600000,
        'salary_max': 1200000,
        'job_type': 'full-time',
    },
    # --- Priya Reddy's jobs (recruiter_index=1, DataSphere Analytics) ---
    {
        'title': 'Data Analyst',
        'company': 'DataSphere Analytics',
        'recruiter_index': 1,
        'description': 'We are hiring a Data Analyst to join our Bengaluru analytics team. You will analyze business data, create visualizations, and generate actionable insights. You will work with Power BI, SQL, and Python to build dashboards and reports that drive strategic decisions. Strong statistical knowledge is essential.',
        'required_skills': ['Python', 'SQL', 'Power BI', 'Data Analytics', 'Excel', 'Statistics'],
        'experience_required': '1-3 years',
        'location': 'Bengaluru, Karnataka',
        'salary_min': 500000,
        'salary_max': 900000,
        'job_type': 'full-time',
    },
    {
        'title': 'Machine Learning Intern',
        'company': 'DataSphere Analytics',
        'recruiter_index': 1,
        'description': 'Internship opportunity for aspiring ML engineers at our Bengaluru office. You will assist the data science team in building and evaluating machine learning models, preprocessing data, and conducting experiments. Strong Python fundamentals and basic ML knowledge required. This is a 6-month paid internship with potential for full-time conversion.',
        'required_skills': ['Python', 'Machine Learning', 'Pandas', 'NumPy', 'Scikit-Learn'],
        'experience_required': '0-1 years',
        'location': 'Bengaluru, Karnataka',
        'salary_min': 15000,
        'salary_max': 30000,
        'job_type': 'internship',
    },
    {
        'title': 'Backend Developer',
        'company': 'DataSphere Analytics',
        'recruiter_index': 1,
        'description': 'We are hiring a Backend Developer to build and maintain scalable server-side applications at our Bengaluru office. You will work with Python, Django, and PostgreSQL to design robust APIs and backend services. Experience with message queues, caching systems, and CI/CD pipelines is a plus. You will collaborate with frontend and DevOps teams.',
        'required_skills': ['Python', 'Django', 'PostgreSQL', 'REST APIs', 'Git', 'Docker'],
        'experience_required': '2-4 years',
        'location': 'Bengaluru, Karnataka',
        'salary_min': 700000,
        'salary_max': 1300000,
        'job_type': 'full-time',
    },
]

# Applications: (candidate_index, job_index, status)
# Candidate 0 = Nandan Kumar   -> 3 applications
# Candidate 1 = Prajwal Gowda  -> 2 applications
# Candidate 2 = Sneha Reddy    -> 2 applications
APPLICATIONS = [
    # Nandan Kumar (Full Stack Developer) -> 3 jobs
    (0, 0, 'shortlisted'),              # Python Developer -- Shortlisted
    (0, 1, 'interview_scheduled'),       # Full Stack Developer -- Interview Scheduled
    (0, 2, 'applied'),                   # React Developer -- Applied

    # Prajwal Gowda (Data Analyst) -> 2 jobs
    (1, 3, 'selected'),                  # Data Analyst -- Selected
    (1, 4, 'under_review'),              # ML Intern -- Under Review

    # Sneha Reddy (ML Intern) -> 2 jobs
    (2, 4, 'rejected'),                  # ML Intern -- Rejected
    (2, 0, 'under_review'),              # Python Developer -- Under Review
]


def _generate_dummy_pdf(name, skills, experience, education, email, phone):
    """Generate a minimal valid PDF file content for demo purposes."""
    content = f"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
   /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 16 Tf 50 740 Td ({name}) Tj
/F1 10 Tf 50 720 Td ({email} | {phone}) Tj
/F1 10 Tf 50 700 Td (Skills: {', '.join(skills[:8])}) Tj
/F1 10 Tf 50 680 Td (Experience: {experience}) Tj
/F1 10 Tf 50 660 Td (Education: {education}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000430 00000 n
0000000306 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
682
%%EOF"""
    return content.encode('latin-1')


class Command(BaseCommand):
    help = 'Seed clean demo data for academic project demonstration (small dataset)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            default=True,
            help='Clear existing demo data before seeding (default: True)',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('\n' + '=' * 60))
        self.stdout.write(self.style.WARNING('  RESUME RANKING AI -- Demo Data Seeder'))
        self.stdout.write(self.style.WARNING('  (Clean dataset for live demonstration)'))
        self.stdout.write(self.style.WARNING('=' * 60 + '\n'))

        # Step 1: Create groups
        self._create_groups()

        # Step 2: Clear old demo data
        if options.get('clear', True):
            self._clear_demo_data()

        # Step 3: Create admin
        admin_user = self._create_admin()

        # Step 4: Create recruiters
        recruiter_users = self._create_recruiters()

        # Step 5: Create jobs
        jobs = self._create_jobs(recruiter_users)

        # Step 6: Create candidates with resumes (supports multiple resumes per candidate)
        candidate_users, candidate_resumes = self._create_candidates()

        # Step 7: Create applications (uses latest resume for each candidate)
        applications = self._create_applications(candidate_users, candidate_resumes, jobs)

        # Step 8: Create resume-job matches (for all resumes)
        self._create_resume_job_matches(candidate_resumes, jobs)

        # Step 9: Create skill gap results
        self._create_skill_gap_results(candidate_resumes, jobs)

        # Step 10: Create interview questions
        self._create_interview_questions(candidate_resumes, jobs)

        # Step 11: Create role recommendations
        self._create_role_recommendations(candidate_resumes)

        # Step 12: Create notifications (small, targeted set)
        self._create_notifications(candidate_users, recruiter_users, admin_user, jobs, applications)

        # Summary
        self._print_summary(admin_user, recruiter_users, candidate_users, jobs, applications)

    # -------------------------------------------------------
    # GROUPS
    # -------------------------------------------------------
    def _create_groups(self):
        Group.objects.get_or_create(name='admin')
        Group.objects.get_or_create(name='recruiter')
        Group.objects.get_or_create(name='candidate')
        self.stdout.write(self.style.SUCCESS('[OK] Groups created/verified'))

    # -------------------------------------------------------
    # CLEAR OLD DATA
    # -------------------------------------------------------
    def _clear_demo_data(self):
        demo_emails = (
            [r['email'] for r in RECRUITERS]
            + [c['email'] for c in CANDIDATES]
            + ['admin@demo.com']
            # Also clean up old demo users from previous seed runs
            + ['nandan.reddy@demo.com', 'hithesh.kumar@demo.com', 'vikas.gowda@demo.com']
        )
        demo_users = User.objects.filter(email__in=demo_emails)

        if demo_users.exists():
            # Delete related data first
            Notification.objects.filter(user__in=demo_users).delete()
            RoleRecommendation.objects.filter(resume__user__in=demo_users).delete()
            InterviewQuestions.objects.filter(resume__user__in=demo_users).delete()
            SkillGapResult.objects.filter(resume__user__in=demo_users).delete()
            ResumeJobMatch.objects.filter(resume__user__in=demo_users).delete()
            JobApplication.objects.filter(user__in=demo_users).delete()
            UserResume.objects.filter(user__in=demo_users).delete()
            JobDescription.objects.filter(created_by__in=demo_users).delete()
            # Delete orphaned notifications for jobs that no longer exist
            Notification.objects.filter(related_job=None, related_application=None).delete()
            demo_users.delete()
            self.stdout.write(self.style.SUCCESS('[OK] Old demo data cleared'))
        else:
            self.stdout.write('  No old demo data to clear')

    # -------------------------------------------------------
    # ADMIN
    # -------------------------------------------------------
    def _create_admin(self):
        user = self._get_or_create_user(
            email='admin@demo.com',
            first_name='Admin',
            last_name='User',
            password=DEMO_PASSWORD,
            group_name='admin',
            is_staff=True,
            is_superuser=True,
        )
        profile = user.profile
        profile.phone = '+91 99999 00000'
        profile.bio = 'Platform Administrator managing the Resume Ranking AI system.'
        profile.location = 'Bengaluru, Karnataka'
        profile.company_name = 'Resume Ranking AI'
        profile.designation = 'Platform Administrator'
        profile.current_role = 'System Administrator'
        profile.experience_years = 10
        profile.education = 'M.Tech in Computer Science, IISc Bengaluru'
        profile.save()
        self.stdout.write(self.style.SUCCESS('[OK] Admin account created'))
        return user

    # -------------------------------------------------------
    # RECRUITERS
    # -------------------------------------------------------
    def _create_recruiters(self):
        users = []
        for rec_data in RECRUITERS:
            user = self._get_or_create_user(
                email=rec_data['email'],
                first_name=rec_data['first_name'],
                last_name=rec_data['last_name'],
                password=DEMO_PASSWORD,
                group_name='recruiter',
            )
            profile = user.profile
            for key, value in rec_data['profile'].items():
                setattr(profile, key, value)
            profile.save()
            users.append(user)
            self.stdout.write(self.style.SUCCESS(
                f'  [OK] Recruiter: {rec_data["first_name"]} {rec_data["last_name"]} ({rec_data["profile"]["company_name"]})'
            ))
        self.stdout.write(self.style.SUCCESS(f'[OK] {len(users)} recruiters created'))
        return users

    # -------------------------------------------------------
    # CANDIDATES + RESUMES (supports multiple resumes)
    # -------------------------------------------------------
    def _create_candidates(self):
        users = []
        # candidate_resumes[i] = list of resumes for candidate i
        candidate_resumes = []
        for cand_data in CANDIDATES:
            user = self._get_or_create_user(
                email=cand_data['email'],
                first_name=cand_data['first_name'],
                last_name=cand_data['last_name'],
                password=DEMO_PASSWORD,
                group_name='candidate',
            )
            profile = user.profile
            for key, value in cand_data['profile'].items():
                setattr(profile, key, value)
            profile.save()

            # Create all resumes for this candidate
            resumes_for_candidate = []
            for r_data in cand_data['resumes']:
                resume = self._create_resume(user, r_data)
                resumes_for_candidate.append(resume)

            users.append(user)
            candidate_resumes.append(resumes_for_candidate)

            resume_count = len(resumes_for_candidate)
            self.stdout.write(self.style.SUCCESS(
                f'  [OK] Candidate: {cand_data["first_name"]} {cand_data["last_name"]} + {resume_count} Resume(s) + AI Analysis'
            ))
        self.stdout.write(self.style.SUCCESS(f'[OK] {len(users)} candidates created with resumes'))
        return users, candidate_resumes

    def _create_resume(self, user, r_data):
        """Create a UserResume with pre-populated AI analysis data."""
        # Generate a dummy PDF file
        pdf_content = _generate_dummy_pdf(
            name=r_data['name_extracted'],
            skills=r_data['skills_extracted'],
            experience=r_data['experience_extracted'],
            education=r_data['education_extracted'],
            email=r_data['email_extracted'],
            phone=r_data['phone_extracted'],
        )
        file_content = ContentFile(pdf_content, name=r_data['file_name'])

        resume = UserResume.objects.create(
            user=user,
            file=file_content,
            file_name=r_data['file_name'],
            file_size=len(pdf_content),
            status='processed',
            analysis_result=r_data['analysis_result'],
            match_score=r_data['match_score'],
            skills_extracted=r_data['skills_extracted'],
            experience_extracted=r_data['experience_extracted'],
            education_extracted=r_data['education_extracted'],
            name_extracted=r_data['name_extracted'],
            email_extracted=r_data['email_extracted'],
            phone_extracted=r_data['phone_extracted'],
            certifications_extracted=r_data['certifications_extracted'],
            projects_extracted=r_data['projects_extracted'],
            resume_summary=r_data['resume_summary'],
            extracted_text=r_data['extracted_text'],
            analyzed_at=timezone.now() - timedelta(days=random.randint(1, 5)),
        )
        return resume

    # -------------------------------------------------------
    # JOBS
    # -------------------------------------------------------
    def _create_jobs(self, recruiter_users):
        jobs = []
        for job_data in JOBS:
            recruiter = recruiter_users[job_data['recruiter_index']]
            job = JobDescription.objects.create(
                job_title=job_data['title'],
                job_description=job_data['description'],
                created_by=recruiter,
                company_name=job_data['company'],
                required_skills=job_data['required_skills'],
                experience_required=job_data['experience_required'],
                location=job_data['location'],
                salary_min=job_data['salary_min'],
                salary_max=job_data['salary_max'],
                job_type=job_data['job_type'],
                is_active=True,
            )
            jobs.append(job)
            self.stdout.write(f'  [OK] Job: {job_data["title"]} @ {job_data["company"]}')
        self.stdout.write(self.style.SUCCESS(f'[OK] {len(jobs)} jobs created'))
        return jobs

    # -------------------------------------------------------
    # APPLICATIONS (uses the latest resume for each candidate)
    # -------------------------------------------------------
    def _create_applications(self, candidate_users, candidate_resumes, jobs):
        applications = []
        for cand_idx, job_idx, app_status in APPLICATIONS:
            candidate = candidate_users[cand_idx]
            # Use the latest (last) resume for applications
            resume = candidate_resumes[cand_idx][-1]
            job = jobs[job_idx]

            app = JobApplication.objects.create(
                user=candidate,
                job=job,
                resume=resume,
                status=app_status,
            )
            applications.append(app)

        self.stdout.write(self.style.SUCCESS(f'[OK] {len(applications)} applications created'))
        return applications

    # -------------------------------------------------------
    # RESUME-JOB MATCHES (creates matches for ALL resumes)
    # -------------------------------------------------------
    def _create_resume_job_matches(self, candidate_resumes, jobs):
        count = 0

        # Match data: (cand_idx, resume_idx_within_candidate, job_idx, semantic, keyword, overall)
        match_data = [
            # Nandan Reddy — Resume v1 (less experienced)
            (0, 0, 0, 68.5, 70.0, 72.3),    # v1 → Python Developer
            (0, 0, 1, 60.2, 55.7, 61.1),    # v1 → Full Stack Developer
            (0, 0, 2, 45.0, 40.0, 44.5),    # v1 → React Developer

            # Nandan Reddy — Resume v2 (updated, stronger)
            (0, 1, 0, 82.5, 85.0, 85.3),    # v2 → Python Developer (great match)
            (0, 1, 1, 88.2, 90.7, 89.1),    # v2 → Full Stack Developer (excellent)
            (0, 1, 2, 52.0, 45.0, 50.5),    # v2 → React Developer (moderate)

            # Hithesh Kumar — Data Analyst
            (1, 0, 3, 90.5, 88.3, 91.7),    # → Data Analyst (excellent match)
            (1, 0, 4, 55.0, 50.0, 54.3),    # → ML Intern (moderate match)

            # Vikas Gowda — ML Intern
            (2, 0, 4, 82.0, 80.0, 81.5),    # → ML Intern (good match)
            (2, 0, 0, 40.0, 30.0, 38.7),    # → Python Developer (weak match, no web exp)
        ]

        for c_idx, r_idx, j_idx, sem, kw, overall in match_data:
            resume = candidate_resumes[c_idx][r_idx]
            job = jobs[j_idx]

            resume_skills = set(s.lower() for s in (resume.skills_extracted or []))
            job_skills = set(s.lower() for s in (job.required_skills or []))
            matched = sorted(list(resume_skills & job_skills))
            missing = sorted(list(job_skills - resume_skills))

            ResumeJobMatch.objects.create(
                resume=resume,
                job=job,
                semantic_score=sem,
                keyword_score=kw,
                overall_score=overall,
                skills_matched=matched,
                skills_missing=missing,
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(f'[OK] {count} resume-job matches created'))

    # -------------------------------------------------------
    # SKILL GAP RESULTS
    # -------------------------------------------------------
    def _create_skill_gap_results(self, candidate_resumes, jobs):
        count = 0
        # (cand_idx, resume_idx, job_idx)
        gaps = [
            (0, 1, 0),  # Nandan v2 vs Python Developer
            (0, 1, 1),  # Nandan v2 vs Full Stack Developer
            (0, 0, 0),  # Nandan v1 vs Python Developer (shows improvement)
            (1, 0, 3),  # Hithesh vs Data Analyst
            (2, 0, 4),  # Vikas vs ML Intern
            (2, 0, 0),  # Vikas vs Python Developer
        ]

        recommendations_map = {
            'docker': 'Learn Docker by containerizing your existing projects. Start with Docker Compose for multi-service setups.',
            'redux': 'Study Redux Toolkit patterns. Build a state-managed React app to practice.',
            'typescript': 'Transition from JavaScript to TypeScript gradually. Use strict mode in new projects.',
            'statistics': 'Take a statistics course on Coursera. Practice hypothesis testing and regression analysis.',
            'excel': 'Master advanced Excel functions like VLOOKUP, pivot tables, and Power Query.',
            'power bi': 'Get Microsoft Power BI certification. Build sample dashboards with public datasets.',
            'css': 'Practice responsive design patterns. Learn CSS Grid and Flexbox layouts.',
            'html': 'Study semantic HTML5 best practices. Focus on accessibility standards.',
            'rest apis': 'Build a CRUD API from scratch. Study RESTful design principles and versioning.',
            'sql': 'Practice complex SQL queries on LeetCode. Learn query optimization techniques.',
            'django': 'Build a complete Django project with authentication, REST API, and deployment.',
            'react': 'Build 2-3 React projects with hooks, context, and routing. Focus on component design patterns.',
            'git': 'Learn Git branching strategies (GitFlow). Practice rebasing and cherry-picking.',
            'javascript': 'Deepen JavaScript knowledge with ES6+ features. Study async/await and Promises.',
            'numpy': 'Practice NumPy array operations. Work through scientific computing exercises.',
            'pandas': 'Master Pandas DataFrames with real-world datasets. Focus on groupby and merge operations.',
            'scikit-learn': 'Implement ML algorithms from scratch, then use Scikit-Learn. Focus on model evaluation.',
            'machine learning': 'Complete Andrew Ng\'s ML course. Build end-to-end ML pipelines.',
            'python': 'Strengthen Python with advanced topics like decorators, generators, and OOP patterns.',
        }

        for c_idx, r_idx, j_idx in gaps:
            resume = candidate_resumes[c_idx][r_idx]
            job = jobs[j_idx]

            resume_skills = set(s.lower() for s in (resume.skills_extracted or []))
            job_skills = set(s.lower() for s in (job.required_skills or []))
            present = sorted(list(resume_skills & job_skills))
            missing = sorted(list(job_skills - resume_skills))
            pct = (len(present) / max(len(job_skills), 1)) * 100

            recs = []
            for skill in missing[:4]:
                rec_text = recommendations_map.get(skill, f'Consider learning {skill.title()} through online courses and hands-on projects.')
                recs.append(f'{skill.title()}: {rec_text}')
            if not recs:
                recs = ['Your skills are well aligned with this role. Keep your skills up to date and continue building projects.']

            SkillGapResult.objects.create(
                resume=resume,
                job=job,
                present_skills=present,
                missing_skills=missing,
                match_percentage=round(pct, 1),
                recommendations=recs,
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(f'[OK] {count} skill gap results created'))

    # -------------------------------------------------------
    # INTERVIEW QUESTIONS
    # -------------------------------------------------------
    def _create_interview_questions(self, candidate_resumes, jobs):
        count = 0
        # (cand_idx, resume_idx, job_idx, questions)
        iq_data = [
            (0, 1, 0, {
                'technical': [
                    'Explain the difference between Django REST Framework serializers and model forms.',
                    'How would you optimize a slow SQL query in PostgreSQL?',
                    'What is middleware in Django and when would you write a custom one?',
                    'Describe the request-response cycle in a Django application.',
                    'How do you handle database migrations in a production Django project?',
                ],
                'behavioral': [
                    'Describe a time when you had to debug a complex production issue.',
                    'How do you prioritize tasks when working on multiple features simultaneously?',
                    'Tell me about a project where you had to learn a new technology quickly.',
                ],
                'role_specific': [
                    'How would you design a REST API for a large-scale application?',
                    'What testing strategies do you follow for backend Python code?',
                ],
            }),
            (0, 1, 1, {
                'technical': [
                    'How would you structure a Django + React project for production deployment?',
                    'Explain how Docker containers differ from virtual machines.',
                    'What are the benefits of using PostgreSQL over SQLite in production?',
                    'How do you implement authentication across a full-stack application?',
                    'Describe your approach to API versioning.',
                ],
                'behavioral': [
                    'Tell me about a time you had to balance frontend and backend priorities.',
                    'How do you handle code reviews and feedback from team members?',
                    'Describe a situation where you improved application performance.',
                ],
                'role_specific': [
                    'How would you set up CI/CD for a Django + React application?',
                    'What caching strategies would you implement for a high-traffic web app?',
                ],
            }),
            (1, 0, 3, {
                'technical': [
                    'How do you handle missing values in a large dataset?',
                    'Explain the difference between supervised and unsupervised learning.',
                    'What types of visualizations work best for time-series data?',
                    'How would you design an ETL pipeline for daily sales data?',
                    'Explain the concept of statistical significance in A/B testing.',
                ],
                'behavioral': [
                    'Describe a time when your data analysis led to a key business decision.',
                    'How do you communicate complex findings to non-technical stakeholders?',
                    'Tell me about a challenging dataset you worked with and how you cleaned it.',
                ],
                'role_specific': [
                    'Walk me through building a Power BI dashboard from scratch.',
                    'How do you ensure data quality in your analysis pipeline?',
                ],
            }),
            (2, 0, 4, {
                'technical': [
                    'Explain the bias-variance tradeoff in machine learning.',
                    'How do you handle overfitting in a neural network?',
                    'Compare batch gradient descent with stochastic gradient descent.',
                    'What is transfer learning and when would you use it?',
                    'How do you evaluate the performance of an NLP model?',
                ],
                'behavioral': [
                    'Describe your most challenging ML project and what you learned.',
                    'How do you stay updated with the latest ML research?',
                    'Tell me about a time when your model did not perform as expected.',
                ],
                'role_specific': [
                    'How would you approach building a sentiment analysis system from scratch?',
                    'What preprocessing steps are essential for NLP tasks?',
                ],
            }),
        ]

        for c_idx, r_idx, j_idx, questions in iq_data:
            InterviewQuestions.objects.create(
                resume=candidate_resumes[c_idx][r_idx],
                job=jobs[j_idx],
                technical_questions=questions['technical'],
                behavioral_questions=questions['behavioral'],
                role_specific_questions=questions['role_specific'],
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(f'[OK] {count} interview question sets created'))

    # -------------------------------------------------------
    # ROLE RECOMMENDATIONS (Career Recommendations)
    # -------------------------------------------------------
    def _create_role_recommendations(self, candidate_resumes):
        # Use the latest resume for each candidate
        recs_data = [
            # Nandan Reddy — latest resume (v2)
            (0, -1, [
                {'role': 'Full Stack Developer', 'confidence': 92, 'reason': 'Strong Python, Django, and React skills with production deployment experience and cloud certification.'},
                {'role': 'Backend Developer', 'confidence': 88, 'reason': 'Deep Django and REST API expertise with PostgreSQL, Docker, and Redis experience.'},
                {'role': 'Python Developer', 'confidence': 85, 'reason': 'Solid Python fundamentals with 3 years of professional experience and AWS certification.'},
                {'role': 'DevOps Engineer', 'confidence': 62, 'reason': 'Docker and AWS experience provides a good foundation, but more infrastructure skills needed.'},
            ]),
            # Hithesh Kumar
            (1, -1, [
                {'role': 'Data Analyst', 'confidence': 94, 'reason': 'Strong analytics skills with Power BI, SQL, and Python. Certified by Google and Microsoft.'},
                {'role': 'Business Intelligence Analyst', 'confidence': 88, 'reason': 'Dashboard and visualization expertise across Power BI and Tableau.'},
                {'role': 'Data Engineer', 'confidence': 60, 'reason': 'SQL proficiency provides a base, but needs more ETL pipeline and big data experience.'},
            ]),
            # Vikas Gowda
            (2, -1, [
                {'role': 'Machine Learning Engineer', 'confidence': 82, 'reason': 'Strong ML fundamentals with TensorFlow certification and hands-on deep learning projects.'},
                {'role': 'Data Scientist', 'confidence': 75, 'reason': 'Good Python and ML skills, but needs more statistical analysis experience.'},
                {'role': 'NLP Engineer', 'confidence': 70, 'reason': 'Sentiment analysis and resume parsing projects show NLP aptitude.'},
                {'role': 'AI Research Intern', 'confidence': 68, 'reason': 'Strong academic background in AI & ML with research-oriented project portfolio.'},
            ]),
        ]

        for c_idx, r_idx, roles in recs_data:
            RoleRecommendation.objects.create(
                resume=candidate_resumes[c_idx][r_idx],
                recommended_roles=roles,
            )
        self.stdout.write(self.style.SUCCESS(f'[OK] {len(recs_data)} role recommendations created'))

    # -------------------------------------------------------
    # NOTIFICATIONS (small, targeted set ~10)
    # -------------------------------------------------------
    def _create_notifications(self, candidate_users, recruiter_users, admin_user, jobs, applications):
        count = 0

        # 1. Resume analysis notifications for all candidates
        for user in candidate_users:
            Notification.objects.create(
                user=user,
                notification_type='resume_analyzed',
                title='Resume Analysis Complete',
                message='Your resume has been analyzed by our AI engine. View your insights on the AI Insights page.',
                is_read=False,
            )
            count += 1

        # 2. Status change notifications (only for non-"applied" statuses)
        status_messages = {
            'under_review': ('Application Under Review', 'Your application for {job} is now being reviewed by the recruiter.'),
            'shortlisted': ('Congratulations! Shortlisted', 'You have been shortlisted for {job}. The recruiter will contact you soon.'),
            'interview_scheduled': ('Interview Scheduled', 'An interview has been scheduled for {job}. Please check your email for details.'),
            'selected': ('Congratulations! Selected', 'You have been selected for {job}! Please check your email for the offer letter.'),
            'rejected': ('Application Update', 'Your application for {job} was not selected at this time. Keep applying!'),
        }

        for app in applications:
            if app.status in status_messages:
                title, msg_template = status_messages[app.status]
                msg = msg_template.format(job=f'{app.job.job_title} at {app.job.company_name}')
                Notification.objects.create(
                    user=app.user,
                    notification_type='status_changed',
                    title=title,
                    message=msg,
                    related_job=app.job,
                    related_application=app,
                    is_read=(app.status == 'rejected'),
                )
                count += 1

        # 3. Recruiter notifications — new applications received (one per recruiter)
        recruiter_notified = set()
        for app in applications:
            if app.job.created_by and app.job.created_by.id not in recruiter_notified:
                candidate_name = f'{app.user.first_name} {app.user.last_name}'.strip()
                Notification.objects.create(
                    user=app.job.created_by,
                    notification_type='application_received',
                    title='New Application Received',
                    message=f'{candidate_name} has applied for {app.job.job_title}.',
                    related_job=app.job,
                    related_application=app,
                    is_read=False,
                )
                recruiter_notified.add(app.job.created_by.id)
                count += 1

        self.stdout.write(self.style.SUCCESS(f'[OK] {count} notifications created'))

    # -------------------------------------------------------
    # HELPERS
    # -------------------------------------------------------
    def _get_or_create_user(self, email, first_name, last_name, password, group_name, is_staff=False, is_superuser=False):
        """Create a user and assign to group."""
        username = email.split('@')[0].replace('.', '_')

        # Ensure unique username
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f'{base_username}{counter}'
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            is_staff=is_staff,
            is_superuser=is_superuser,
        )

        group = Group.objects.get(name=group_name)
        user.groups.add(group)

        # Ensure profile exists (signal should create it, but just in case)
        UserProfile.objects.get_or_create(user=user)

        return user

    # -------------------------------------------------------
    # SUMMARY
    # -------------------------------------------------------
    def _print_summary(self, admin_user, recruiter_users, candidate_users, jobs, applications):
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS('  [OK] DEMO DATA SEEDED SUCCESSFULLY!'))
        self.stdout.write('=' * 60)

        all_demo_users = [admin_user] + list(recruiter_users) + list(candidate_users)
        demo_resumes = UserResume.objects.filter(user__in=all_demo_users)

        self.stdout.write(f'\n  Users:         {len(all_demo_users)}')
        self.stdout.write(f'  Recruiters:    {len(recruiter_users)}')
        self.stdout.write(f'  Candidates:    {len(candidate_users)}')
        self.stdout.write(f'  Jobs:          {len(jobs)}')
        self.stdout.write(f'  Applications:  {len(applications)}')
        self.stdout.write(f'  Resumes:       {demo_resumes.count()}')
        self.stdout.write(f'  Job Matches:   {ResumeJobMatch.objects.filter(resume__in=demo_resumes).count()}')
        self.stdout.write(f'  Skill Gaps:    {SkillGapResult.objects.filter(resume__in=demo_resumes).count()}')
        self.stdout.write(f'  Interview Qs:  {InterviewQuestions.objects.filter(resume__in=demo_resumes).count()}')
        self.stdout.write(f'  Role Recs:     {RoleRecommendation.objects.filter(resume__in=demo_resumes).count()}')
        self.stdout.write(f'  Notifications: {Notification.objects.filter(user__in=all_demo_users).count()}')

        self.stdout.write('\n' + '-' * 60)
        self.stdout.write(self.style.WARNING('  LOGIN CREDENTIALS (All accounts use same password)'))
        self.stdout.write('-' * 60)
        self.stdout.write(f'  Password for ALL accounts:  {DEMO_PASSWORD}')
        self.stdout.write('')

        self.stdout.write(self.style.MIGRATE_HEADING('  ADMIN:'))
        self.stdout.write(f'    Email:     admin@demo.com')
        self.stdout.write(f'    Password:  {DEMO_PASSWORD}')
        self.stdout.write('')

        self.stdout.write(self.style.MIGRATE_HEADING('  RECRUITERS:'))
        for rec in RECRUITERS:
            self.stdout.write(f'    {rec["first_name"]} {rec["last_name"]} ({rec["profile"]["company_name"]})')
            self.stdout.write(f'      Email: {rec["email"]}')
        self.stdout.write('')

        self.stdout.write(self.style.MIGRATE_HEADING('  CANDIDATES:'))
        for cand in CANDIDATES:
            resume_count = len(cand['resumes'])
            self.stdout.write(f'    {cand["first_name"]} {cand["last_name"]} ({resume_count} resume{"s" if resume_count > 1 else ""})')
            self.stdout.write(f'      Email: {cand["email"]}')
        self.stdout.write('')
        self.stdout.write('=' * 60 + '\n')
