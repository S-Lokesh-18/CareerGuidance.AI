import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import KNN from 'ml-knn';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const CANONICAL_SKILLS = [
  'JavaScript',
  'React',
  'Node.js',
  'HTML/CSS',
  'Python',
  'SQL',
  'Statistics',
  'Machine Learning',
  'PyTorch/TensorFlow',
  'Figma',
  'UI Design',
  'User Research',
  'SEO',
  'Google Analytics',
  'Content Marketing',
  'Network Security',
  'Incident Response',
  'Linux',
  'AWS/Cloud',
  'Docker'
];

export const CAREER_LABELS = [
  'Data Analyst',
  'Full-Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'ML Engineer',
  'UI/UX Designer',
  'Digital Marketer',
  'Cybersecurity Analyst',
  'Cloud/DevOps Engineer'
];

// Base skill profiles (ratings 1-5 for canonical skills)
const CAREER_BASE_PROFILES = {
  'Data Analyst': {
    'SQL': 5, 'Python': 4, 'Statistics': 4, 'Google Analytics': 3,
    'JavaScript': 1, 'React': 1, 'Node.js': 1, 'HTML/CSS': 1,
    'Machine Learning': 2, 'PyTorch/TensorFlow': 1, 'Figma': 1,
    'UI Design': 2, 'User Research': 2, 'SEO': 2, 'Content Marketing': 1,
    'Network Security': 1, 'Incident Response': 1, 'Linux': 2, 'AWS/Cloud': 2, 'Docker': 1
  },
  'Full-Stack Developer': {
    'JavaScript': 5, 'React': 5, 'Node.js': 5, 'HTML/CSS': 5, 'SQL': 4, 'Linux': 3, 'Docker': 3, 'AWS/Cloud': 3,
    'Python': 2, 'Statistics': 1, 'Machine Learning': 1, 'PyTorch/TensorFlow': 1,
    'Figma': 3, 'UI Design': 3, 'User Research': 2, 'SEO': 2, 'Content Marketing': 1,
    'Network Security': 2, 'Incident Response': 1
  },
  'Frontend Developer': {
    'JavaScript': 5, 'React': 5, 'HTML/CSS': 5, 'UI Design': 4, 'Figma': 4,
    'Node.js': 2, 'SQL': 1, 'Python': 1, 'Statistics': 1, 'Machine Learning': 1, 'PyTorch/TensorFlow': 1,
    'User Research': 3, 'SEO': 3, 'Content Marketing': 1, 'Network Security': 1, 'Incident Response': 1,
    'Linux': 1, 'AWS/Cloud': 1, 'Docker': 1
  },
  'Backend Developer': {
    'Node.js': 5, 'SQL': 5, 'Linux': 4, 'Docker': 4, 'AWS/Cloud': 4, 'Python': 4, 'Network Security': 3,
    'JavaScript': 4, 'HTML/CSS': 2, 'React': 2, 'Statistics': 2, 'Machine Learning': 1, 'PyTorch/TensorFlow': 1,
    'Figma': 1, 'UI Design': 1, 'User Research': 1, 'SEO': 1, 'Content Marketing': 1, 'Incident Response': 2
  },
  'Data Scientist': {
    'Python': 5, 'Statistics': 5, 'Machine Learning': 5, 'SQL': 4, 'Linux': 2,
    'PyTorch/TensorFlow': 4, 'Docker': 2, 'AWS/Cloud': 2, 'JavaScript': 1, 'React': 1, 'Node.js': 1, 'HTML/CSS': 1,
    'Figma': 1, 'UI Design': 1, 'User Research': 1, 'SEO': 1, 'Google Analytics': 2, 'Content Marketing': 1,
    'Network Security': 1, 'Incident Response': 1
  },
  'ML Engineer': {
    'Python': 5, 'Machine Learning': 5, 'PyTorch/TensorFlow': 5, 'Docker': 4, 'Linux': 4, 'AWS/Cloud': 4, 'Statistics': 4, 'SQL': 3,
    'JavaScript': 1, 'React': 1, 'Node.js': 2, 'HTML/CSS': 1, 'Figma': 1, 'UI Design': 1,
    'User Research': 1, 'SEO': 1, 'Google Analytics': 1, 'Content Marketing': 1, 'Network Security': 2, 'Incident Response': 1
  },
  'UI/UX Designer': {
    'Figma': 5, 'UI Design': 5, 'User Research': 5, 'HTML/CSS': 2, 'JavaScript': 1,
    'Node.js': 1, 'Python': 1, 'SQL': 1, 'Statistics': 1, 'Machine Learning': 1, 'PyTorch/TensorFlow': 1,
    'SEO': 2, 'Google Analytics': 2, 'Content Marketing': 2, 'Network Security': 1, 'Incident Response': 1,
    'Linux': 1, 'AWS/Cloud': 1, 'Docker': 1
  },
  'Digital Marketer': {
    'SEO': 5, 'Google Analytics': 5, 'Content Marketing': 5, 'User Research': 3, 'UI Design': 2, 'Figma': 2,
    'HTML/CSS': 2, 'JavaScript': 1, 'Python': 1, 'SQL': 2, 'Statistics': 2,
    'Machine Learning': 1, 'PyTorch/TensorFlow': 1, 'Network Security': 1, 'Incident Response': 1,
    'Linux': 1, 'AWS/Cloud': 1, 'Docker': 1, 'Node.js': 1, 'React': 1
  },
  'Cybersecurity Analyst': {
    'Network Security': 5, 'Incident Response': 5, 'Linux': 5, 'Python': 3, 'SQL': 3, 'AWS/Cloud': 3, 'Docker': 3,
    'JavaScript': 1, 'React': 1, 'Node.js': 2, 'HTML/CSS': 1, 'Statistics': 2, 'Machine Learning': 2,
    'PyTorch/TensorFlow': 1, 'Figma': 1, 'UI Design': 1, 'User Research': 1, 'SEO': 1, 'Google Analytics': 1,
    'Content Marketing': 1
  },
  'Cloud/DevOps Engineer': {
    'Linux': 5, 'AWS/Cloud': 5, 'Docker': 5, 'Node.js': 3, 'Python': 4, 'Network Security': 4, 'SQL': 3,
    'JavaScript': 2, 'React': 1, 'HTML/CSS': 1, 'Statistics': 1, 'Machine Learning': 1,
    'PyTorch/TensorFlow': 1, 'Figma': 1, 'UI Design': 1, 'User Research': 1, 'SEO': 1, 'Google Analytics': 1,
    'Content Marketing': 1, 'Incident Response': 3
  }
};

function generateDataset() {
  const SAMPLES_PER_CAREER = 100;
  const X = [];
  const y = [];

  CAREER_LABELS.forEach((career, labelIdx) => {
    const base = CAREER_BASE_PROFILES[career];

    for (let i = 0; i < SAMPLES_PER_CAREER; i++) {
      const vector = CANONICAL_SKILLS.map((skill) => {
        const val = base[skill] || 1;
        // Add random variation (-1 to +1) with Gaussian-like tendency
        const noise = (Math.random() - 0.5) * 1.5;
        const noisyVal = Math.round(val + noise);
        return Math.max(1, Math.min(5, noisyVal));
      });
      X.push(vector);
      y.push(labelIdx);
    }
  });

  // Shuffle dataset
  const indices = Array.from({ length: X.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const shuffledX = indices.map((idx) => X[idx]);
  const shuffledY = indices.map((idx) => y[idx]);

  // Split 80/20 train/test
  const trainSize = Math.floor(shuffledX.length * 0.8);
  const trainX = shuffledX.slice(0, trainSize);
  const trainY = shuffledY.slice(0, trainSize);
  const testX = shuffledX.slice(trainSize);
  const testY = shuffledY.slice(trainSize);

  // Train KNN to measure test accuracy
  const knn = new KNN(trainX, trainY, { k: 7 });
  let correct = 0;
  for (let i = 0; i < testX.length; i++) {
    const pred = knn.predict(testX[i]);
    if (pred === testY[i]) {
      correct++;
    }
  }

  const testAccuracy = Number(((correct / testX.length) * 100).toFixed(1));
  console.log(`Trained k-NN on ${trainX.length} synthetic samples. Test accuracy on ${testX.length} samples: ${testAccuracy}%`);

  const outputData = {
    canonicalSkills: CANONICAL_SKILLS,
    careerLabels: CAREER_LABELS,
    trainX,
    trainY,
    testAccuracy,
    generatedAt: new Date().toISOString(),
    note: 'Trained on synthetic skill profile distributions with randomized variation.'
  };

  fs.writeFileSync(path.join(dataDir, 'trainingData.json'), JSON.stringify(outputData, null, 2));
  console.log('✓ Saved trainingData.json');

  // Generate historical skill demand dataset (2020 to 2025)
  // Index from 40 to 100 representing market demand / job posting indices
  const historicalYears = [2020, 2021, 2022, 2023, 2024, 2025];
  const skillDemandHistory = {
    'SQL': [60, 64, 70, 75, 82, 88],
    'Python': [65, 72, 80, 89, 95, 100],
    'JavaScript': [75, 78, 83, 86, 90, 93],
    'React': [68, 75, 82, 88, 92, 95],
    'Node.js': [62, 68, 74, 80, 85, 89],
    'Machine Learning': [50, 58, 68, 80, 92, 98],
    'PyTorch/TensorFlow': [45, 55, 66, 78, 90, 97],
    'Figma': [55, 65, 76, 85, 91, 94],
    'UI Design': [60, 66, 72, 78, 83, 87],
    'AWS/Cloud': [64, 72, 81, 89, 94, 98],
    'Docker': [58, 67, 75, 84, 90, 95],
    'Network Security': [65, 70, 76, 83, 90, 96],
    'SEO': [58, 62, 66, 70, 73, 76],
    'Google Analytics': [60, 65, 70, 74, 79, 83],
    'Statistics': [55, 60, 66, 72, 78, 82],
    'Linux': [68, 72, 77, 82, 87, 91],
    'HTML/CSS': [70, 72, 75, 77, 79, 81],
    'User Research': [50, 56, 63, 71, 78, 84],
    'Incident Response': [60, 66, 73, 81, 88, 94],
    'Content Marketing': [54, 58, 62, 67, 71, 75]
  };

  fs.writeFileSync(
    path.join(dataDir, 'forecastData.json'),
    JSON.stringify({ years: historicalYears, skillDemandHistory }, null, 2)
  );
  console.log('✓ Saved forecastData.json');
}

// Only execute dataset generation when run as main script (e.g. npm run ml:train)
const isMain = process.argv[1] && (
  process.argv[1].endsWith('generateData.js') ||
  process.argv[1].includes('generateData')
);

if (isMain) {
  generateDataset();
}

export default {
  generateDataset,
  CANONICAL_SKILLS,
  CAREER_LABELS,
};
