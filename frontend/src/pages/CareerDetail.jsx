import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  LineChart,
  Line,
  ReferenceLine,
} from 'recharts';
import {
  Briefcase,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sliders,
  DollarSign,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function CareerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [career, setCareer] = useState(null);
  const [skillGap, setSkillGap] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cRes, gapRes, fRes] = await Promise.all([
          api.get(`/careers/${id}`),
          api.get(`/careers/${id}/skill-gap`),
          api.get(`/careers/${id}/forecast`),
        ]);

        if (cRes.success) setCareer(cRes.data);
        if (gapRes.success) setSkillGap(gapRes.data);
        if (fRes.success) setForecast(fRes.data);
      } catch (err) {
        setError(err.message || 'Failed to load career details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner size="lg" className="text-indigo-600 mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading skill gap and market forecast analytics...</p>
      </div>
    );
  }

  if (error || !career) {
    return (
      <div className="max-w-md mx-auto my-16 text-center">
        <Card className="p-8">
          <p className="text-sm text-rose-600 mb-4">{error || 'Career profile not found'}</p>
          <Link to="/careers">
            <Button variant="outline">Back to Careers</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const LINE_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              Demand: {career.demand_level}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{career.salary_range}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {career.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            {career.description}
          </p>
        </div>

        <div className="shrink-0">
          <Link to="/roadmaps" state={{ careerId: career.id }}>
            <Button variant="primary" size="lg" className="gap-2 shadow-md">
              <Sparkles className="w-4 h-4" />
              <span>Generate Roadmap for this Role</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* SECTION 1: SKILL GAP ANALYSIS */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              Skill Gap & Readiness Analysis
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic comparison of required competencies vs your self-evaluated profile.
            </p>
          </div>
          {skillGap && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Overall Readiness:</span>
              <span className="text-base font-extrabold text-indigo-600 px-3 py-1 bg-indigo-50 rounded-lg">
                {skillGap.readinessPercentage}%
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Recharts Bar Chart */}
          <Card className="lg:col-span-7" title="Required vs Current Skill Level (Rating 1 - 5)">
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillGap?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="skill"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Bar dataKey="required" name="Required Level" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="current" name="Your Current Level" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Missing & Weak Skill Breakdowns */}
          <div className="lg:col-span-5 space-y-4">
            {/* Missing Skills */}
            <Card
              title={`Missing Skills (${skillGap?.missingSkills?.length || 0})`}
              subtitle="Skills with 0 rating, ranked by requirement priority"
            >
              {skillGap?.missingSkills?.length === 0 ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>No completely missing core skills!</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {skillGap?.missingSkills?.map((m) => (
                    <div
                      key={m.skill}
                      className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span className="font-bold text-rose-900">{m.skill}</span>
                      </div>
                      <span className="font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded">
                        Required Weight: {m.weight}/5
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Weak Skills */}
            <Card
              title={`Weak / Maturing Skills (${skillGap?.weakSkills?.length || 0})`}
              subtitle="Skills below target competency"
            >
              {skillGap?.weakSkills?.length === 0 ? (
                <p className="text-xs text-slate-500">All rated skills meet target competency levels.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {skillGap?.weakSkills?.map((w) => (
                    <div
                      key={w.skill}
                      className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-100 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-amber-900">{w.skill}</span>
                      <span className="font-semibold text-amber-700">
                        Current: {w.userLevel} / Target: {w.requiredLevel}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* SECTION 2: SKILL DEMAND FORECAST */}
      <div className="space-y-6 pt-4">
        <div className="border-b border-slate-200/80 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Machine Learning Forecast</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            3-Year Skill Demand Trajectory (Simple Linear Regression)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical demand indices (2020-2025) fitted with Simple Linear Regression (<code className="text-indigo-600 font-mono">ml-regression</code>) to project market demand through 2028.
          </p>
        </div>

        <Card>
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast?.chartData || []} margin={{ top: 15, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[30, 105]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                <ReferenceLine x="2025" stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Forecast Start', fill: '#94a3b8', fontSize: 11, position: 'top' }} />

                {(forecast?.skills || []).map((skill, sIdx) => (
                  <Line
                    key={skill}
                    type="monotone"
                    dataKey={skill}
                    stroke={LINE_COLORS[sIdx % LINE_COLORS.length]}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <span>Y-axis: Market Demand Index (0-100) based on industry hiring trends.</span>
            <span className="italic">{forecast?.methodology}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
