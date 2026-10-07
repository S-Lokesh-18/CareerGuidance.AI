import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import {
  GraduationCap,
  Heart,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  Star,
} from 'lucide-react';

const EDUCATION_OPTIONS = [
  'Undergraduate (Computer Science / IT)',
  'Undergraduate (Engineering - Non-CS)',
  'Undergraduate (Business / Data / Analytics)',
  'Undergraduate (Arts, Humanities, Other)',
  'Master’s Degree / Postgraduate',
  'Bootcamp / Self-Taught Developer',
  'Working Professional (Transitioning Careers)',
  'High School Student',
];

const INTEREST_OPTIONS = [
  'Web Development',
  'Data & Analytics',
  'Machine Learning & AI',
  'UI/UX Design',
  'Cloud & DevOps',
  'Cybersecurity & Defense',
  'Digital Marketing & Growth',
  'System Architecture & Backend',
  'Product Strategy & Research',
  'Mobile Development',
];

const SKILL_CATEGORIES = [
  {
    category: 'Web & Core Programming',
    skills: ['JavaScript', 'React', 'Node.js', 'HTML/CSS', 'Python'],
  },
  {
    category: 'Data Science & Machine Learning',
    skills: ['SQL', 'Statistics', 'Machine Learning', 'PyTorch/TensorFlow', 'Pandas/NumPy'],
  },
  {
    category: 'Design & Growth Marketing',
    skills: ['Figma', 'UI Design', 'User Research', 'SEO', 'Google Analytics'],
  },
  {
    category: 'Cloud, Infrastructure & Security',
    skills: ['Linux', 'Docker', 'AWS/Cloud', 'Network Security', 'Incident Response'],
  },
];

export default function Assessment() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [education, setEducation] = useState(EDUCATION_OPTIONS[0]);
  const [interests, setInterests] = useState(['Web Development', 'Machine Learning & AI']);
  const [skills, setSkills] = useState({
    'JavaScript': 4,
    'React': 3,
    'HTML/CSS': 4,
    'Node.js': 3,
    'SQL': 3,
    'Python': 2,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSkillRating = (skill, rating) => {
    setSkills((prev) => ({
      ...prev,
      [skill]: rating,
    }));
  };

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        education,
        interests,
        skills,
      };

      const res = await api.post('/assessments', payload);
      if (res.success && res.data) {
        navigate('/assessment/results', { state: { assessmentData: res.data } });
      }
    } catch (err) {
      setError(err.message || 'Failed to submit assessment. Please check inputs.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header and Step Progress */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Career & Skill Evaluation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Discover Your Ideal Career Pathway
        </h1>
        <p className="mt-2 text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
          Our algorithm pairs weighted skill compatibility with a trained k-NN machine learning classifier to pinpoint your highest-readiness career trajectory.
        </p>

        {/* Step Indicator */}
        <div className="mt-8 flex items-center justify-center max-w-md mx-auto">
          {[
            { num: 1, label: 'Education', icon: GraduationCap },
            { num: 2, label: 'Interests', icon: Heart },
            { num: 3, label: 'Skills (1-5)', icon: Sliders },
          ].map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-sm'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs mt-1.5 font-medium ${
                      isCurrent ? 'text-indigo-600 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 transition-colors ${
                      currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Overlay During AI / ML Computation */}
      {isSubmitting ? (
        <Card className="text-center py-16 px-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Spinner size="xl" className="text-indigo-600" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">
                Evaluating Your Skill & Career Alignment
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Computing weighted skill match percentages, running k-NN classifier predictions, and generating AI career counseling insights...
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Analyzing against 10 modern tech career profiles</span>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="shadow-lg border-slate-200/90">
          {/* STEP 1: EDUCATION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  What is your primary education or background?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Helps our AI mentor contextualize your learning velocity and academic foundation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EDUCATION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setEducation(opt)}
                    className={`p-4 rounded-xl border text-left text-sm font-medium transition-all cursor-pointer ${
                      education === opt
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt}</span>
                      {education === opt && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentStep(2)}
                  className="gap-2"
                >
                  <span>Next: Passions & Interests</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: INTERESTS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  Which domain areas genuinely excite you?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select all that apply. Career satisfaction is highest when raw skill aligns with intrinsic curiosity.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setCurrentStep(1)}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentStep(3)}
                  className="gap-2"
                >
                  <span>Next: Skill Evaluation</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: SKILL RATINGS (1-5) */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  Rate Your Current Skill Levels (1 to 5)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  1 = Novice / Little experience, 3 = Comfortable / Built simple projects, 5 = Production Expert.
                  Unrated skills default to 1 (Novice).
                </p>
              </div>

              <div className="space-y-8">
                {SKILL_CATEGORIES.map((cat) => (
                  <div key={cat.category} className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100/70 px-3 py-1.5 rounded-md inline-block">
                      {cat.category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cat.skills.map((skill) => {
                        const currentRating = skills[skill] || 1;
                        return (
                          <div
                            key={skill}
                            className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-3"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{skill}</p>
                              <p className="text-[11px] text-slate-500">
                                {currentRating === 1 && 'Novice (1)'}
                                {currentRating === 2 && 'Beginner (2)'}
                                {currentRating === 3 && 'Intermediate (3)'}
                                {currentRating === 4 && 'Advanced (4)'}
                                {currentRating === 5 && 'Expert (5)'}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((lvl) => (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => handleSkillRating(skill, lvl)}
                                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                                    currentRating >= lvl
                                      ? 'bg-indigo-600 text-white shadow-xs'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                  }`}
                                  title={`Rate ${skill} as ${lvl}/5`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setCurrentStep(2)}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Complete Assessment & Run AI Match</span>
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
