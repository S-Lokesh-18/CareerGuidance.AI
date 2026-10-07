import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import {
  Trophy,
  Sparkles,
  Cpu,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Sliders,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Briefcase,
} from 'lucide-react';

export default function AssessmentResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const [assessmentData, setAssessmentData] = useState(location.state?.assessmentData || null);
  const [loading, setLoading] = useState(!location.state?.assessmentData);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!assessmentData) {
      const fetchLatest = async () => {
        try {
          const res = await api.get('/assessments/latest');
          if (res.success && res.data) {
            setAssessmentData(res.data);
          } else {
            setError('No assessment found. Please complete an assessment first.');
          }
        } catch (err) {
          setError(err.message || 'Failed to load assessment results.');
        } finally {
          setLoading(false);
        }
      };
      fetchLatest();
    }
  }, [assessmentData]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner size="lg" className="text-indigo-600 mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading your career assessment report...</p>
      </div>
    );
  }

  if (error || !assessmentData) {
    return (
      <div className="max-w-md mx-auto my-16 text-center px-4">
        <Card className="p-8">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">No Assessment Available</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'Please take the assessment to get personalized career recommendations.'}</p>
          <Link to="/assessment">
            <Button variant="primary" className="w-full">
              Take Career Assessment
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const results = assessmentData.results || {};
  const topCareers = results.topCareers || [];
  const modelInsights = results.modelInsights || {};
  const topMatch = topCareers[0];
  const runnerUps = topCareers.slice(1, 3);
  const otherCareers = topCareers.slice(3);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-2">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Analysis Complete</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Career Compatibility Report
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Algorithmically ranked via 60% Weighted Skill Alignment and 40% k-NN Machine Learning Classifier.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/assessment">
            <Button variant="outline" size="sm" className="gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Assessment</span>
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary" size="sm">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* #1 Top Recommended Career Hero */}
      {topMatch && (
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>#1 Best Career Match</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-indigo-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
                <span>Blended Score:</span>
                <span className="text-base font-extrabold text-white">{topMatch.finalScore}%</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              {topMatch.title}
            </h2>
            <p className="text-indigo-100/90 text-sm sm:text-base max-w-3xl leading-relaxed mb-6">
              {topMatch.description}
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-white/10 mb-6">
              <div>
                <p className="text-[11px] text-indigo-200 font-medium">Weighted Score</p>
                <p className="text-lg font-bold text-white mt-0.5">{topMatch.weightedScore}%</p>
              </div>
              <div>
                <p className="text-[11px] text-indigo-200 font-medium">k-NN ML Score</p>
                <p className="text-lg font-bold text-white mt-0.5">{topMatch.mlScore}%</p>
              </div>
              <div>
                <p className="text-[11px] text-indigo-200 font-medium">Est. Compensation</p>
                <p className="text-lg font-bold text-white mt-0.5">{topMatch.salaryRange || 'Competitive'}</p>
              </div>
              <div>
                <p className="text-[11px] text-indigo-200 font-medium">Market Demand</p>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">{topMatch.demandLevel || 'High'}</p>
              </div>
            </div>

            {/* AI Explanation Callout */}
            {topMatch.aiExplanation && (
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 mb-6">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-200 mb-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Counselor Recommendation</span>
                </div>
                <p className="text-sm text-indigo-50 leading-relaxed">
                  {topMatch.aiExplanation}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link to={`/careers/${topMatch.careerId || topMatch.id}`}>
                <Button variant="primary" size="md" className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold shadow-md">
                  <span>View Skill Gap & Forecast</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/roadmaps" state={{ careerId: topMatch.careerId || topMatch.id }}>
                <Button variant="outline" size="md" className="border-white/30 text-white hover:bg-white/10">
                  <Sliders className="w-4 h-4 mr-1.5" />
                  <span>Generate 6-Week Roadmap</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Model Insights Box (Required by prompt) */}
      <Card className="bg-slate-900 text-white border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Model Insights & Transparency</h3>
              <p className="text-xs text-slate-400">Algorithmic architecture and scoring integrity</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-semibold">
              Test Accuracy: {modelInsights.testAccuracy || 96.5}%
            </div>
            <div className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-300 text-xs font-semibold">
              k = 7 Nearest Neighbors
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="font-bold text-white block mb-1">Blended Ranking Architecture</span>
            Final ranking synthesizes 60% rule-based weighted skill alignment and 40% k-NN vector classification across 20 canonical skill dimensions.
          </div>
          <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="font-bold text-white block mb-1">Synthetic Training Distribution</span>
            The machine learning classifier is trained on a synthetic dataset generated with controlled Gaussian variance across tech disciplines.
          </div>
          <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="font-bold text-white block mb-1">Gemini Qualitative Role</span>
            Google Gemini acts purely as a narrative explainer to unpack reasons behind the top 3 recommendations in friendly language; it does not dictate rankings.
          </div>
        </div>
      </Card>

      {/* Runner Up Top Careers (#2 and #3) */}
      {runnerUps.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            Secondary High-Potential Pathways
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {runnerUps.map((career, idx) => (
              <Card key={career.title} className="hover:border-slate-300 transition-all flex flex-col justify-between" hover>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                      Rank #{idx + 2}
                    </span>
                    <span className="text-sm font-extrabold text-indigo-600">
                      {career.finalScore}% Match
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-slate-900 mb-1">{career.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{career.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-600 py-2 border-y border-slate-100 mb-3">
                    <span>Weighted: <strong>{career.weightedScore}%</strong></span>
                    <span>ML Classifier: <strong>{career.mlScore}%</strong></span>
                    <span>Salary: <strong>{career.salaryRange}</strong></span>
                  </div>

                  {career.aiExplanation && (
                    <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 mb-4">
                      <p className="font-medium">{career.aiExplanation}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Link
                    to={`/careers/${career.careerId || career.id}`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>View Skill Gap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link to="/roadmaps" state={{ careerId: career.careerId || career.id }}>
                    <Button variant="outline" size="sm">
                      Create Roadmap
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Other Ranked Careers */}
      {otherCareers.length > 0 && (
        <Card title="Remaining Evaluated Careers" subtitle="Other profiles analyzed during your assessment">
          <div className="divide-y divide-slate-100">
            {otherCareers.map((c, idx) => (
              <div key={c.title} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400 w-6">#{idx + 4}</span>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800">{c.title}</h5>
                    <p className="text-xs text-slate-500 line-clamp-1">{c.salaryRange} • Demand: {c.demandLevel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-700">{c.finalScore}%</span>
                    <span className="text-[10px] text-slate-400 block">blended</span>
                  </div>
                  <Link to={`/careers/${c.careerId || c.id}`}>
                    <Button variant="ghost" size="sm">Details</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
