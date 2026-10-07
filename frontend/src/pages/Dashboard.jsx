import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  Trophy,
  Sliders,
  MapPin,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner size="lg" className="text-indigo-600 mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading your career command center...</p>
      </div>
    );
  }

  const user = data?.user;
  const latestAssessment = data?.latestAssessment;
  const topCareer = latestAssessment?.topCareer;
  const skillGap = data?.skillGap;
  const activeRoadmap = data?.activeRoadmap;
  const latestResume = data?.latestResume;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Explorer'} 👋
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track your career progression, bridge critical skill gaps, and execute your milestones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/assessment">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ClipboardList className="w-4 h-4 text-indigo-600" />
              <span>{latestAssessment ? 'Retake Assessment' : 'Start Assessment'}</span>
            </Button>
          </Link>
          <Link to="/chat">
            <Button variant="primary" size="sm" className="gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI Counselor</span>
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Unassessed Prompt Card */}
      {!latestAssessment && (
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-indigo-100 uppercase tracking-wider">
                Step 1: Skill Evaluation
              </span>
              <h2 className="text-xl sm:text-2xl font-bold">Discover your career compatibility profile</h2>
              <p className="text-xs sm:text-sm text-indigo-100/90 max-w-xl">
                Take our 3-minute assessment to unlock weighted skill matching, k-NN machine learning predictions, and custom AI roadmaps.
              </p>
            </div>
            <Link to="/assessment" className="shrink-0">
              <Button variant="primary" size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold shadow-md">
                <span>Start Assessment</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Top Match */}
        <Card className="hover:border-indigo-200 transition-colors" hover>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Match</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900 line-clamp-1">
            {topCareer?.title || 'Not Assessed'}
          </p>
          <p className="text-xs text-indigo-600 font-bold mt-1">
            {topCareer ? `${topCareer.finalScore}% Compatibility` : 'Take assessment to calculate'}
          </p>
        </Card>

        {/* Card 2: Skill Readiness */}
        <Card className="hover:border-indigo-200 transition-colors" hover>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skill Readiness</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900">
            {skillGap ? `${skillGap.readinessPercentage}%` : 'Pending'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {skillGap ? `${skillGap.missingSkills?.length || 0} skill gaps identified` : 'Evaluated against top role'}
          </p>
        </Card>

        {/* Card 3: Roadmap Progress */}
        <Card className="hover:border-indigo-200 transition-colors" hover>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Roadmap Progress</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900">
            {activeRoadmap ? `${activeRoadmap.percentage}%` : 'No Roadmap'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {activeRoadmap ? `${activeRoadmap.completedTasks}/${activeRoadmap.totalTasks} tasks completed` : 'Create learning plan'}
          </p>
        </Card>

        {/* Card 4: Resume Match */}
        <Card className="hover:border-indigo-200 transition-colors" hover>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Latest Resume Score</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900">
            {latestResume ? `${latestResume.matchScore}%` : 'Not Uploaded'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {latestResume ? 'Match & readiness estimate' : 'Upload PDF resume'}
          </p>
        </Card>
      </div>

      {/* Main Grid: Skill Gap Chart & Active Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Skill Gap Chart */}
        <div className="lg:col-span-7 space-y-6">
          <Card
            title={topCareer ? `Skill Gap Breakdown: ${topCareer.title}` : 'Skill Alignment Overview'}
            subtitle="Comparing required mastery level vs your current self-evaluations"
            action={
              topCareer && (
                <Link to={`/careers/${topCareer.careerId || topCareer.id}`}>
                  <span className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    Full Details <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              )
            }
          >
            {skillGap?.chartData?.length > 0 ? (
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillGap.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="skill"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                    <Bar dataKey="required" name="Required" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="current" name="Current Level" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Sliders className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm">Complete your assessment to populate your skill gap chart.</p>
                <Link to="/assessment">
                  <Button variant="primary" size="sm">Take Assessment</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Quick Links Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/careers" className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Demand Forecast</p>
                <p className="text-xs text-slate-500">Regression trends</p>
              </div>
            </Link>

            <Link to="/resume" className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Analyze Resume</p>
                <p className="text-xs text-slate-500">TF-IDF match</p>
              </div>
            </Link>

            <Link to="/chat" className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">AI Counselor</p>
                <p className="text-xs text-slate-500">Instant answers</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Roadmap & Latest Resume */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Roadmap Card */}
          <Card
            title="Active Learning Roadmap"
            subtitle={activeRoadmap ? activeRoadmap.careerTitle : 'No active curriculum'}
            action={
              activeRoadmap && (
                <Link to="/roadmaps">
                  <Button variant="ghost" size="sm">Open</Button>
                </Link>
              )
            }
          >
            {activeRoadmap ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">{activeRoadmap.completedTasks} of {activeRoadmap.totalTasks} Tasks Completed</span>
                    <span className="text-indigo-600 font-extrabold">{activeRoadmap.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${activeRoadmap.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800 mb-0.5">{activeRoadmap.title}</p>
                  <p className="text-[11px] text-slate-500">Keep completing weekly action items to boost job readiness.</p>
                </div>

                <Link to="/roadmaps" className="block">
                  <Button variant="primary" size="sm" className="w-full">
                    Continue Roadmap
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-3">
                <MapPin className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">No roadmap in progress yet.</p>
                <Link to="/roadmaps">
                  <Button variant="outline" size="sm">Generate Roadmap</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Latest Resume Analysis Card */}
          <Card
            title="Latest Resume Diagnosis"
            subtitle={latestResume ? latestResume.fileName : 'No resume uploaded'}
            action={
              <Link to="/resume">
                <Button variant="ghost" size="sm">Upload</Button>
              </Link>
            }
          >
            {latestResume ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50/60 border border-indigo-100">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-700 block">
                      Target Role
                    </span>
                    <span className="text-sm font-bold text-slate-900">{latestResume.careerTitle || 'General'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-indigo-600">{latestResume.matchScore}%</span>
                    <span className="text-[10px] text-slate-500 block">readiness</span>
                  </div>
                </div>

                {latestResume.summary && (
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {latestResume.summary}
                  </p>
                )}

                <Link to="/resume" className="block pt-1">
                  <Button variant="outline" size="sm" className="w-full">
                    View Full Analysis & Rewrites
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-3">
                <FileText className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">Upload your resume to receive AI feedback and keyword alignment.</p>
                <Link to="/resume">
                  <Button variant="outline" size="sm">Upload Resume</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
