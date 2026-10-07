import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../api/client';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import {
  MapPin,
  CheckCircle,
  Circle,
  ExternalLink,
  Sparkles,
  FolderGit2,
  Calendar,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

export default function Roadmaps() {
  const location = useLocation();
  const initialCareerId = location.state?.careerId;

  const [careers, setCareers] = useState([]);
  const [selectedCareerId, setSelectedCareerId] = useState(initialCareerId || '');
  const [currentRoadmap, setCurrentRoadmap] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [userRoadmaps, setUserRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch careers and existing roadmaps on load
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [careersRes, listRes] = await Promise.all([
          api.get('/careers'),
          api.get('/roadmaps'),
        ]);

        if (careersRes.success && careersRes.data) {
          setCareers(careersRes.data);
          if (!selectedCareerId && careersRes.data.length > 0) {
            setSelectedCareerId(careersRes.data[0].id);
          }
        }

        if (listRes.success && listRes.data) {
          setUserRoadmaps(listRes.data);
          // If we have an existing roadmap for the initialCareerId or first item
          if (listRes.data.length > 0) {
            const match = initialCareerId
              ? listRes.data.find((r) => r.career_id === Number(initialCareerId))
              : listRes.data[0];

            if (match) {
              loadRoadmapDetails(match.id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load initial roadmaps data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, [initialCareerId]);

  const loadRoadmapDetails = async (roadmapId) => {
    try {
      const res = await api.get(`/roadmaps/${roadmapId}`);
      if (res.success && res.data) {
        setCurrentRoadmap(res.data.roadmap);
        const pMap = {};
        (res.data.progress || []).forEach((p) => {
          pMap[p.task_id] = p.completed;
        });
        setProgressMap(pMap);
        setSelectedCareerId(res.data.roadmap.career_id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load roadmap');
    }
  };

  const handleGenerate = async (regenerate = false) => {
    if (!selectedCareerId) return;
    setError('');
    setGenerating(true);

    try {
      const res = await api.post('/roadmaps/generate', {
        careerId: Number(selectedCareerId),
        regenerate,
      });

      if (res.success && res.data) {
        setCurrentRoadmap(res.data.roadmap);
        const pMap = {};
        (res.data.progress || []).forEach((p) => {
          pMap[p.task_id] = p.completed;
        });
        setProgressMap(pMap);

        // Refresh user roadmaps list
        const listRes = await api.get('/roadmaps');
        if (listRes.success) setUserRoadmaps(listRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    if (!currentRoadmap) return;
    const currentState = Boolean(progressMap[taskId]);
    const newState = !currentState;

    // Optimistic UI update
    setProgressMap((prev) => ({
      ...prev,
      [taskId]: newState,
    }));

    try {
      await api.put(`/roadmaps/${currentRoadmap.id}/tasks/${taskId}`, {
        completed: newState,
      });
    } catch (err) {
      // Revert if error
      setProgressMap((prev) => ({
        ...prev,
        [taskId]: currentState,
      }));
    }
  };

  // Compute progress numbers
  let totalTasks = 0;
  let completedTasks = 0;
  const plan = currentRoadmap?.plan;

  if (plan?.weeks) {
    plan.weeks.forEach((w) => {
      w.tasks?.forEach((t) => {
        totalTasks++;
        if (progressMap[t.id]) completedTasks++;
      });
    });
  }

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header and Career Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Week-by-Week Learning Roadmaps
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Structured curriculum generated with milestones, task checklists, curated resources, and portfolio capstones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCareerId}
            onChange={(e) => {
              const newId = Number(e.target.value);
              setSelectedCareerId(newId);
              // Check if already generated for this career
              const existing = userRoadmaps.find((r) => r.career_id === newId);
              if (existing) {
                loadRoadmapDetails(existing.id);
              } else {
                setCurrentRoadmap(null);
              }
            }}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            size="md"
            isLoading={generating}
            onClick={() => handleGenerate(currentRoadmap ? true : false)}
            className="gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>{currentRoadmap ? 'Regenerate Plan' : 'Generate Roadmap'}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Spinner size="lg" className="text-indigo-600 mb-2" />
          <p className="text-sm text-slate-500">Loading learning roadmaps...</p>
        </div>
      ) : generating ? (
        <Card className="text-center py-20">
          <Spinner size="xl" className="text-indigo-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Architecting Your 6-Week Roadmap</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Structuring weekly learning outcomes, task deliverables, learning resources, and capstone specifications...
          </p>
        </Card>
      ) : !currentRoadmap ? (
        <Card className="text-center py-16">
          <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Active Roadmap Selected</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Generate a personalized 6-week curriculum for your target career to track your weekly task progress.
          </p>
          <Button variant="primary" onClick={() => handleGenerate(false)}>
            Generate Roadmap Now
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Progress Banner */}
          <Card className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white border-0 shadow-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-300">
                  {plan.durationWeeks}-Week Curriculum • {currentRoadmap.career_title || plan.careerTitle}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  {plan.title}
                </h2>
                <p className="text-xs sm:text-sm text-indigo-100/80 mt-1 max-w-2xl">
                  {plan.overview}
                </p>
              </div>

              <div className="text-right sm:text-right shrink-0">
                <span className="text-3xl font-extrabold text-emerald-400">{progressPercentage}%</span>
                <span className="text-xs text-indigo-200 block">
                  {completedTasks} of {totalTasks} tasks completed
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden backdrop-blur-xs">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </Card>

          {/* Week-by-Week Breakdown */}
          <div className="space-y-6">
            {(plan.weeks || []).map((week) => (
              <Card key={week.weekNumber} className="hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-sm flex items-center justify-center border border-indigo-200">
                      W{week.weekNumber}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{week.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{week.description}</p>
                    </div>
                  </div>
                </div>

                {/* Tasks Checklist */}
                <div className="space-y-2 mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Weekly Action Items:
                  </p>
                  {(week.tasks || []).map((task) => {
                    const isDone = Boolean(progressMap[task.id]);
                    return (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(task.id)}
                        className={`p-3 rounded-lg border text-sm transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isDone
                            ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 text-indigo-600 focus:outline-none"
                          aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {isDone ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-500" />
                          )}
                        </button>
                        <div className="flex-1">
                          <p className={`font-semibold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Free Resources */}
                {week.resources && week.resources.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Recommended Free Resources:</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {week.resources.map((res, rIdx) => (
                        <a
                          key={rIdx}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-colors"
                        >
                          <span>{res.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({res.type})</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Mini-Project Capstone Card */}
          {plan.miniProject && (
            <Card className="bg-amber-50/50 border-amber-200/80 shadow-xs">
              <div className="flex items-center gap-2.5 text-amber-800 font-bold mb-2">
                <FolderGit2 className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg">Capstone Mini-Project: {plan.miniProject.title}</h3>
              </div>
              <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                {plan.miniProject.description}
              </p>

              {plan.miniProject.deliverables && plan.miniProject.deliverables.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Key Deliverables:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                    {plan.miniProject.deliverables.map((item, dIdx) => (
                      <li key={dIdx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
