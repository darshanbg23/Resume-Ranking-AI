"""
Resume Parser Engine — SpaCy NER + Regex-based extraction.

Extracts structured data from resume text:
- Name (SpaCy PERSON entity + heuristics)
- Email (regex)
- Phone (regex)
- Skills (keyword matching against taxonomy)
- Education (section detection + degree patterns)
- Experience (section detection + date patterns)
- Certifications (section detection)
- Projects (section detection)
"""
import re
import logging

logger = logging.getLogger(__name__)

# Lazy-load SpaCy to avoid import-time overhead
_nlp = None


def _get_nlp():
    """Lazy-load SpaCy model."""
    global _nlp
    if _nlp is None:
        try:
            import spacy
            _nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("SpaCy model 'en_core_web_sm' not found. Run: python -m spacy download en_core_web_sm")
            _nlp = False
    return _nlp if _nlp else None


# ============================================================
# SKILLS TAXONOMY
# ============================================================

TECHNICAL_SKILLS = {
    # Programming Languages
    'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'c', 'ruby', 'go', 'golang',
    'rust', 'swift', 'kotlin', 'scala', 'php', 'perl', 'r', 'matlab', 'dart', 'lua',
    'objective-c', 'groovy', 'haskell', 'elixir', 'clojure', 'fortran', 'cobol',
    'assembly', 'vhdl', 'verilog', 'bash', 'shell', 'powershell',

    # Web Frameworks
    'django', 'flask', 'fastapi', 'react', 'reactjs', 'react.js', 'angular', 'angularjs',
    'vue', 'vuejs', 'vue.js', 'next.js', 'nextjs', 'nuxt', 'nuxtjs',
    'express', 'expressjs', 'express.js', 'node', 'nodejs', 'node.js',
    'spring', 'spring boot', 'springboot', 'rails', 'ruby on rails',
    'laravel', 'symfony', 'asp.net', '.net', 'dotnet', 'blazor',
    'svelte', 'gatsby', 'remix', 'ember',

    # Databases
    'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'sqlite', 'oracle',
    'sql server', 'mssql', 'cassandra', 'dynamodb', 'couchdb', 'neo4j',
    'elasticsearch', 'mariadb', 'firebase', 'supabase',

    # Cloud & DevOps
    'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'heroku',
    'digitalocean', 'vercel', 'netlify', 'cloudflare',
    'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'jenkins',
    'ci/cd', 'github actions', 'gitlab ci', 'circleci', 'travis ci',
    'nginx', 'apache', 'linux', 'unix',

    # Data Science & ML
    'machine learning', 'deep learning', 'artificial intelligence', 'ai', 'ml',
    'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn',
    'pandas', 'numpy', 'scipy', 'matplotlib', 'seaborn', 'plotly',
    'nlp', 'natural language processing', 'computer vision', 'opencv',
    'hugging face', 'transformers', 'bert', 'gpt', 'llm',
    'data science', 'data analysis', 'data engineering', 'data visualization',
    'power bi', 'tableau', 'looker', 'spark', 'hadoop', 'kafka',
    'airflow', 'dbt', 'snowflake', 'databricks', 'bigquery',

    # Mobile
    'android', 'ios', 'react native', 'flutter', 'xamarin', 'ionic',
    'swiftui', 'jetpack compose',

    # Tools & Misc
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence',
    'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
    'rest', 'restful', 'rest api', 'graphql', 'grpc', 'websocket',
    'microservices', 'api', 'oauth', 'jwt',
    'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'tailwind', 'tailwindcss',
    'bootstrap', 'material ui', 'chakra ui',
    'webpack', 'vite', 'babel', 'eslint', 'prettier',
    'agile', 'scrum', 'kanban', 'devops', 'sre',
    'unit testing', 'integration testing', 'selenium', 'cypress', 'jest',
    'pytest', 'unittest', 'mocha', 'chai',
    'rabbitmq', 'celery', 'socket.io', 'websockets',
    'blockchain', 'web3', 'solidity', 'ethereum',
    'iot', 'embedded systems', 'raspberry pi', 'arduino',
}

# Section header patterns
SECTION_PATTERNS = {
    'education': re.compile(
        r'^\s*(?:education|academic|qualification|degree|university|college|school)',
        re.IGNORECASE | re.MULTILINE
    ),
    'experience': re.compile(
        r'^\s*(?:experience|work\s*experience|employment|professional\s*experience|work\s*history|career)',
        re.IGNORECASE | re.MULTILINE
    ),
    'skills': re.compile(
        r'^\s*(?:skills|technical\s*skills|core\s*competenc|key\s*skills|proficienc|technologies|tools)',
        re.IGNORECASE | re.MULTILINE
    ),
    'projects': re.compile(
        r'^\s*(?:projects|personal\s*projects|academic\s*projects|key\s*projects|notable\s*projects)',
        re.IGNORECASE | re.MULTILINE
    ),
    'certifications': re.compile(
        r'^\s*(?:certifications?|certificates?|professional\s*certifications?|licenses?|accreditations?)',
        re.IGNORECASE | re.MULTILINE
    ),
}


class ResumeParser:
    """Parse structured data from resume text using SpaCy NER and regex."""

    def __init__(self):
        self.nlp = _get_nlp()

    def parse(self, text: str) -> dict:
        """
        Full parse of resume text.

        Returns dict with:
        - name, email, phone
        - skills (list)
        - education (str)
        - experience (str)
        - certifications (list)
        - projects (list)
        """
        result = {
            'name': self.extract_name(text),
            'email': self.extract_email(text),
            'phone': self.extract_phone(text),
            'skills': self.extract_skills(text),
            'education': self.extract_education(text),
            'experience': self.extract_experience_years(text),
            'certifications': self.extract_certifications(text),
            'projects': self.extract_projects(text),
        }
        return result

    def extract_name(self, text: str) -> str:
        """Extract candidate name using heuristics + SpaCy NER."""
        lines = text.strip().split('\n')

        # Strategy 1: First non-empty line that looks like a name
        # Most resumes start with the candidate's name as the first line
        for line in lines[:5]:
            line = line.strip()
            if not line:
                continue
            # Skip lines with email, phone, URLs, or common section headers
            if '@' in line or re.search(r'\d{3}', line) or 'http' in line.lower():
                continue
            if re.search(r'(?:resume|curriculum|objective|summary|profile|experience|education|skills)', line, re.IGNORECASE):
                continue
            # Check if line looks like a name (2-5 words, mostly alphabetic, properly capitalized)
            words = line.split()
            if 1 <= len(words) <= 5:
                # Filter out single character words that aren't initials
                alpha_words = [w for w in words if re.match(r'^[A-Za-z][A-Za-z.\'-]*$', w)]
                if len(alpha_words) >= 2 and len(alpha_words) == len(words):
                    # Check at least 2 words start with uppercase
                    caps = sum(1 for w in alpha_words if w[0].isupper())
                    if caps >= 2:
                        return line
            # Single word name on first line (some resumes)
            if len(words) == 1 and len(line) > 1 and line[0].isupper() and line.isalpha():
                continue  # Skip single words, look for full name

        # Strategy 2: SpaCy NER
        if self.nlp:
            header = text[:800]
            doc = self.nlp(header)
            persons = [ent.text.strip() for ent in doc.ents if ent.label_ == 'PERSON']
            if persons:
                for p in persons:
                    words = p.split()
                    if 2 <= len(words) <= 5 and all(re.match(r'^[A-Za-z]', w) for w in words):
                        return p

        # Strategy 3: Look for "Name:" pattern
        name_match = re.search(r'(?:name|full\s*name)\s*[:]\s*(.+)', text[:500], re.IGNORECASE)
        if name_match:
            name = name_match.group(1).strip()
            if 2 <= len(name.split()) <= 5:
                return name

        return ''

    def extract_email(self, text: str) -> str:
        """Extract email address using regex."""
        pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        match = re.search(pattern, text)
        return match.group(0) if match else ''

    def extract_phone(self, text: str) -> str:
        """Extract phone number using regex."""
        patterns = [
            r'(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
            r'(?:\+\d{1,3}[-.\s]?)?\d{10,12}',
            r'(?:\+\d{1,2})?\s?\d{5}[-.\s]?\d{5}',
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                phone = match.group(0).strip()
                # Validate it's at least 10 digits
                digits = re.sub(r'\D', '', phone)
                if len(digits) >= 10:
                    return phone
        return ''

    def extract_skills(self, text: str) -> list:
        """Extract skills by matching against the skills taxonomy."""
        text_lower = text.lower()
        found_skills = set()

        for skill in TECHNICAL_SKILLS:
            # Word boundary matching to avoid partial matches
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                # Normalize skill name (title case)
                found_skills.add(skill.title() if len(skill) > 3 else skill.upper())

        # Also try extracting from skills section specifically
        skills_section = self._extract_section(text, 'skills')
        if skills_section:
            # Parse comma/pipe/bullet separated items
            items = re.split(r'[,|•·▪▸►\n]', skills_section)
            for item in items:
                item = item.strip().strip('-').strip('*').strip()
                if item and 2 <= len(item) <= 40:
                    # Check if it's in our taxonomy
                    if item.lower() in TECHNICAL_SKILLS:
                        found_skills.add(item.title() if len(item) > 3 else item.upper())

        return sorted(list(found_skills))

    def extract_education(self, text: str) -> str:
        """Extract education information."""
        edu_section = self._extract_section(text, 'education')
        if edu_section:
            return edu_section.strip()[:300]

        # Fallback: look for degree patterns
        degree_patterns = [
            r"(?:Bachelor|Master|PhD|Ph\.D|B\.Tech|M\.Tech|B\.Sc|M\.Sc|B\.E|M\.E|MBA|BCA|MCA|B\.A|M\.A|B\.Com|M\.Com|Associate)[\w\s.,()]*",
        ]
        for pattern in degree_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0).strip()[:300]

        return ''

    def extract_experience_years(self, text: str) -> str:
        """Extract years of experience."""
        patterns = [
            r'(\d+)\+?\s*(?:years?|yrs?)[\s]*(?:of)?\s*(?:experience|exp)',
            r'(?:experience|exp)[\s:]*(\d+)\+?\s*(?:years?|yrs?)',
            r'(\d+)\+?\s*(?:years?|yrs?)\s+(?:in|of)\s+\w+',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)

        # Fallback: count date ranges in experience section
        exp_section = self._extract_section(text, 'experience')
        if exp_section:
            date_ranges = re.findall(
                r'(?:19|20)\d{2}\s*[-–—to]+\s*(?:(?:19|20)\d{2}|present|current|now)',
                exp_section, re.IGNORECASE
            )
            if date_ranges:
                total_years = 0
                for dr in date_ranges:
                    years = re.findall(r'((?:19|20)\d{2})', dr)
                    if len(years) >= 2:
                        total_years += abs(int(years[1]) - int(years[0]))
                    elif 'present' in dr.lower() or 'current' in dr.lower():
                        start = re.search(r'((?:19|20)\d{2})', dr)
                        if start:
                            from datetime import datetime
                            total_years += datetime.now().year - int(start.group(1))
                if total_years > 0:
                    return str(total_years)

        return ''

    def extract_certifications(self, text: str) -> list:
        """Extract certifications from the resume."""
        cert_section = self._extract_section(text, 'certifications')
        if not cert_section:
            return []

        certs = []
        lines = cert_section.strip().split('\n')
        for line in lines:
            line = line.strip().strip('-').strip('•').strip('*').strip()
            if line and len(line) > 5 and not SECTION_PATTERNS['certifications'].match(line):
                certs.append(line[:200])

        return certs[:10]  # Cap at 10 certifications

    def extract_projects(self, text: str) -> list:
        """Extract project names/descriptions from the resume."""
        proj_section = self._extract_section(text, 'projects')
        if not proj_section:
            return []

        projects = []
        lines = proj_section.strip().split('\n')
        current_project = None

        for line in lines:
            stripped = line.strip()
            if not stripped or SECTION_PATTERNS['projects'].match(stripped):
                continue

            # Detect if this is a sub-point (starts with bullet/dash/number)
            is_bullet = bool(re.match(r'^[\-•*–▪►◦‣○]\s*', stripped)) or bool(re.match(r'^\d+[.)]\s+', stripped))

            # Detect leading whitespace (indented lines are sub-points)
            leading_spaces = len(line) - len(line.lstrip())
            is_indented = leading_spaces >= 2

            if is_bullet or is_indented:
                # This is a sub-point — append to current project description
                desc = re.sub(r'^[\-•*–▪►◦‣○]\s*', '', stripped)
                desc = re.sub(r'^\d+[.)]\s+', '', desc).strip()
                if desc and current_project:
                    if current_project['description']:
                        current_project['description'] += ' • ' + desc
                    else:
                        current_project['description'] = desc
                elif desc and not current_project:
                    # Bullet without preceding title — treat as standalone project
                    current_project = {'title': desc[:80], 'description': ''}
            else:
                # This looks like a project title (non-indented, non-bullet, short-ish)
                if len(stripped) <= 120:
                    if current_project:
                        projects.append(current_project)
                    # Clean common suffixes like dates, pipes, dashes
                    title = re.sub(r'\s*[\|–—-]\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4}).*$', '', stripped, flags=re.IGNORECASE)
                    current_project = {'title': title.strip(), 'description': ''}
                elif current_project:
                    # Long non-bullet line — treat as description
                    if current_project['description']:
                        current_project['description'] += ' ' + stripped
                    else:
                        current_project['description'] = stripped

        if current_project:
            projects.append(current_project)

        # Filter out empty/very short titles and deduplicate
        seen = set()
        filtered = []
        for p in projects:
            title_clean = p['title'].strip()
            if title_clean and len(title_clean) > 3 and title_clean.lower() not in seen:
                seen.add(title_clean.lower())
                filtered.append(p)

        return filtered[:10]  # Cap at 10 projects

    def _extract_section(self, text: str, section_name: str) -> str:
        """
        Extract text content of a specific section from the resume.
        Finds the section header and returns text until the next section header.
        """
        pattern = SECTION_PATTERNS.get(section_name)
        if not pattern:
            return ''

        lines = text.split('\n')
        section_start = None
        section_lines = []

        # All section patterns for detecting next section boundary
        all_patterns = list(SECTION_PATTERNS.values())

        for i, line in enumerate(lines):
            if section_start is None:
                if pattern.match(line.strip()):
                    section_start = i
            else:
                # Check if we've hit another section
                is_new_section = False
                for other_pattern in all_patterns:
                    if other_pattern != pattern and other_pattern.match(line.strip()):
                        is_new_section = True
                        break
                if is_new_section:
                    break
                section_lines.append(line)

        return '\n'.join(section_lines)
