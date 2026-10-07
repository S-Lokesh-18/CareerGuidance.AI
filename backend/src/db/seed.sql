-- Seed data for 10 Career Profiles
-- Safe to re-run (idempotent with ON CONFLICT)

INSERT INTO careers (title, description, required_skills, interest_tags, salary_range, demand_level)
VALUES
(
    'Data Analyst',
    'Examines data to uncover business insights, create dashboards, and help organizations make data-informed strategic decisions.',
    '[
        {"skill": "SQL", "weight": 5},
        {"skill": "Excel", "weight": 4},
        {"skill": "Tableau/PowerBI", "weight": 4},
        {"skill": "Python", "weight": 4},
        {"skill": "Statistics", "weight": 3},
        {"skill": "Data Cleaning", "weight": 4}
    ]'::jsonb,
    '["analytics", "data", "business", "dashboards", "reporting"]'::jsonb,
    '$65,000 - $95,000',
    'High'
),
(
    'Full-Stack Developer',
    'Builds end-to-end web applications, handling both client-side user interfaces and server-side logic, databases, and APIs.',
    '[
        {"skill": "JavaScript", "weight": 5},
        {"skill": "React", "weight": 5},
        {"skill": "Node.js", "weight": 5},
        {"skill": "SQL", "weight": 4},
        {"skill": "HTML/CSS", "weight": 4},
        {"skill": "Git", "weight": 4},
        {"skill": "REST APIs", "weight": 4}
    ]'::jsonb,
    '["web development", "coding", "fullstack", "applications", "software"]'::jsonb,
    '$80,000 - $130,000',
    'Very High'
),
(
    'Frontend Developer',
    'Creates intuitive, responsive, and visually appealing web interfaces that provide delightful user experiences across all devices.',
    '[
        {"skill": "HTML/CSS", "weight": 5},
        {"skill": "JavaScript", "weight": 5},
        {"skill": "React", "weight": 5},
        {"skill": "TypeScript", "weight": 4},
        {"skill": "Responsive Design", "weight": 4},
        {"skill": "UI Design", "weight": 3},
        {"skill": "Git", "weight": 3}
    ]'::jsonb,
    '["frontend", "design", "ui", "web development", "interactive"]'::jsonb,
    '$70,000 - $115,000',
    'High'
),
(
    'Backend Developer',
    'Architects robust server architectures, databases, background processing engines, and secure APIs powering modern software.',
    '[
        {"skill": "Node.js", "weight": 5},
        {"skill": "SQL", "weight": 5},
        {"skill": "REST APIs", "weight": 5},
        {"skill": "PostgreSQL", "weight": 4},
        {"skill": "Python", "weight": 4},
        {"skill": "System Design", "weight": 4},
        {"skill": "Docker", "weight": 3}
    ]'::jsonb,
    '["backend", "servers", "databases", "apis", "systems", "architecture"]'::jsonb,
    '$85,000 - $135,000',
    'High'
),
(
    'Data Scientist',
    'Applies advanced statistics, mathematical modeling, and machine learning to large datasets to predict future outcomes and extract deep insights.',
    '[
        {"skill": "Python", "weight": 5},
        {"skill": "Machine Learning", "weight": 5},
        {"skill": "Statistics", "weight": 5},
        {"skill": "Pandas/NumPy", "weight": 5},
        {"skill": "SQL", "weight": 4},
        {"skill": "Data Visualization", "weight": 4}
    ]'::jsonb,
    '["data science", "statistics", "math", "algorithms", "modeling"]'::jsonb,
    '$95,000 - $150,000',
    'Very High'
),
(
    'ML Engineer',
    'Bridges the gap between research models and production software by training, scaling, and deploying artificial intelligence systems at scale.',
    '[
        {"skill": "Python", "weight": 5},
        {"skill": "PyTorch/TensorFlow", "weight": 5},
        {"skill": "Machine Learning", "weight": 5},
        {"skill": "Deep Learning", "weight": 5},
        {"skill": "MLOps", "weight": 4},
        {"skill": "Docker", "weight": 4},
        {"skill": "Math & Linear Algebra", "weight": 4}
    ]'::jsonb,
    '["artificial intelligence", "ml", "deep learning", "algorithms", "neural networks"]'::jsonb,
    '$110,000 - $175,000',
    'Very High'
),
(
    'UI/UX Designer',
    'Researches user behavior and crafts seamless design systems, interactive prototypes, and wireframes to ensure optimum usability and aesthetic pleasure.',
    '[
        {"skill": "Figma", "weight": 5},
        {"skill": "Wireframing", "weight": 5},
        {"skill": "User Research", "weight": 5},
        {"skill": "UI Design", "weight": 5},
        {"skill": "Prototyping", "weight": 4},
        {"skill": "Information Architecture", "weight": 4},
        {"skill": "HTML/CSS", "weight": 2}
    ]'::jsonb,
    '["design", "ux", "ui", "research", "creativity", "prototyping"]'::jsonb,
    '$68,000 - $110,000',
    'High'
),
(
    'Digital Marketer',
    'Drives customer acquisition and brand visibility using search engine optimization, content strategies, paid ads, and conversion analytics.',
    '[
        {"skill": "SEO", "weight": 5},
        {"skill": "Google Analytics", "weight": 5},
        {"skill": "Content Marketing", "weight": 4},
        {"skill": "Social Media Marketing", "weight": 4},
        {"skill": "Copywriting", "weight": 4},
        {"skill": "Email Marketing", "weight": 3}
    ]'::jsonb,
    '["marketing", "seo", "growth", "content", "social media", "branding"]'::jsonb,
    '$55,000 - $90,000',
    'Medium'
),
(
    'Cybersecurity Analyst',
    'Defends corporate networks, applications, and confidential assets against breaches, vulnerabilities, and cyber attacks.',
    '[
        {"skill": "Network Security", "weight": 5},
        {"skill": "Incident Response", "weight": 5},
        {"skill": "Threat Analysis", "weight": 5},
        {"skill": "Ethical Hacking", "weight": 4},
        {"skill": "Linux", "weight": 4},
        {"skill": "SIEM Tools", "weight": 4},
        {"skill": "Cryptography", "weight": 3}
    ]'::jsonb,
    '["security", "cyber", "infosec", "investigation", "defense", "networking"]'::jsonb,
    '$85,000 - $130,000',
    'Very High'
),
(
    'Cloud/DevOps Engineer',
    'Automates deployment pipelines, provisions infrastructure as code, and maintains resilient, scalable cloud architectures.',
    '[
        {"skill": "AWS/Cloud", "weight": 5},
        {"skill": "Docker", "weight": 5},
        {"skill": "CI/CD", "weight": 5},
        {"skill": "Linux", "weight": 5},
        {"skill": "Kubernetes", "weight": 4},
        {"skill": "Terraform/IaC", "weight": 4},
        {"skill": "Git", "weight": 4}
    ]'::jsonb,
    '["cloud", "devops", "automation", "infrastructure", "containers", "sysadmin"]'::jsonb,
    '$95,000 - $145,000',
    'Very High'
)
ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    required_skills = EXCLUDED.required_skills,
    interest_tags = EXCLUDED.interest_tags,
    salary_range = EXCLUDED.salary_range,
    demand_level = EXCLUDED.demand_level;

-- Seed Default Demo User (password: demopass123)
INSERT INTO users (name, email, password_hash)
VALUES (
    'Demo Student',
    'demo@careerportal.ai',
    '$2b$10$GyZzZA6IwLeyf2dTeyc98ewiViauWth21wNgy6GXG9Lmkh7W2KKs6'
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash;
