import React, { useState, useEffect } from 'react';
import api from '../api/client';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  Briefcase,
  History,
} from 'lucide-react';

export default function ResumeAnalyzer() {
  const [careers, setCareers] = useState([]);
  const [selectedCareerId, setSelectedCareerId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [cRes, hRes] = await Promise.all([
          api.get('/careers'),
          api.get('/resume/history'),
        ]);

        if (cRes.success) {
          setCareers(cRes.data);
          if (cRes.data.length > 0) setSelectedCareerId(cRes.data[0].id);
        }

        if (hRes.success && hRes.data.length > 0) {
          setHistory(hRes.data);
          // Show most recent
          setAnalysisResult(hRes.data[0]);
        }
      } catch (err) {
        console.error('Failed to load careers/resume history:', err);
      }
    };
    fetchInit();
  }, []);

  const handleFileChange = (e) => {
    setFileError('');
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith('.pdf') && selected.type !== 'application/pdf') {
      setFileError('Please upload a PDF document only.');
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setFileError('File exceeds maximum size limit of 5 MB.');
      return;
    }

    setFile(selected);
  };

  const handleUploadAndAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      setFileError('Please select a PDF resume file.');
      return;
    }

    setError('');
    setFileError('');
    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (selectedCareerId) formData.append('careerId', selectedCareerId);
      if (jobDescription.trim()) formData.append('jobDescription', jobDescription.trim());

      const res = await api.post('/resume/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.success && res.data) {
        setAnalysisResult(res.data);
        // Refresh history
        const hRes = await api.get('/resume/history');
        if (hRes.success) setHistory(hRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const feedback = analysisResult?.result?.feedback || null;
  const matchedKeywords = analysisResult?.result?.matchedKeywords || [];
  const missingKeywords = analysisResult?.result?.missingKeywords || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NLP & AI Diagnostic</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Resume Analyzer & Keyword Alignment
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          Upload your resume in PDF format. We utilize TF-IDF cosine similarity, keyword extraction, and AI coaching to diagnose your job-readiness and bullet impact.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Upload & Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <Card className="lg:col-span-5 shadow-sm" title="Upload Resume & Set Target">
          <form onSubmit={handleUploadAndAnalyze} className="space-y-5">
            {/* Target Role */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Career Path
              </label>
              <select
                value={selectedCareerId}
                onChange={(e) => setSelectedCareerId(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {careers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Job Description Optional */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Paste Job Description <span className="font-normal text-slate-400 lowercase">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Paste specific job requirements or responsibilities here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* File Dropzone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Upload Resume PDF (Max 5MB)
              </label>
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-5 text-center transition-colors bg-slate-50/60">
                <input
                  type="file"
                  id="resume-file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="resume-file" className="cursor-pointer block">
                  <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                  {file ? (
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-indigo-900">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB (PDF)</p>
                      <span className="text-xs text-indigo-600 underline font-medium">Click to replace</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Choose a PDF or drag and drop</p>
                      <p className="text-xs text-slate-400 mt-0.5">PDF only, up to 5 MB</p>
                    </div>
                  )}
                </label>
              </div>
              {fileError && <p className="mt-1.5 text-xs text-rose-600 font-semibold">{fileError}</p>}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={analyzing}
              disabled={!file}
              className="w-full gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{analyzing ? 'Analyzing Document with NLP...' : 'Run Readiness Analysis'}</span>
            </Button>
          </form>

          {/* History drawer list */}
          {history.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                <History className="w-3.5 h-3.5" />
                <span>Past Analyses ({history.length})</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setAnalysisResult(h)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      analysisResult?.id === h.id
                        ? 'border-indigo-500 bg-indigo-50/60 font-semibold text-indigo-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="line-clamp-1">{h.file_name}</span>
                    <span className="font-bold shrink-0 ml-2">{h.match_score}%</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Results Display */}
        <div className="lg:col-span-7 space-y-6">
          {analyzing ? (
            <Card className="text-center py-24">
              <Spinner size="xl" className="text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Extracting & Analyzing Resume Content
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Parsing PDF via in-memory buffer, tokenizing terms, calculating TF-IDF cosine similarity, and generating rewrite suggestions...
              </p>
            </Card>
          ) : !analysisResult ? (
            <Card className="text-center py-20">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No Resume Analysis Yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Upload your resume PDF on the left to review your match and readiness estimate.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Score Header Card */}
              <Card className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-0 shadow-md p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-indigo-300">
                      Match and Readiness Estimate
                    </span>
                    <h2 className="text-2xl font-extrabold text-white mt-0.5">
                      {analysisResult.result?.careerTitle || 'Career Match'}
                    </h2>
                    <p className="text-xs text-slate-300 mt-1">
                      File: {analysisResult.file_name || analysisResult.fileName}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-600/40 border border-indigo-400/40 flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-white">
                        {analysisResult.match_score || analysisResult.matchScore}%
                      </span>
                      <span className="text-[10px] text-indigo-200">Readiness</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-amber-300">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Note: This is an educational match and readiness estimate, never a real ATS score.
                  </span>
                </div>
              </Card>

              {/* Keywords Alignment */}
              <Card title="Skill Keywords Breakdown">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Identified in Resume ({matchedKeywords.length})</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedKeywords.length > 0 ? (
                        matchedKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            {kw}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No exact core keywords identified</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs font-bold text-rose-700 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      <span>Missing High-Impact Keywords ({missingKeywords.length})</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {missingKeywords.length > 0 ? (
                        missingKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"
                          >
                            {kw}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-emerald-600 font-medium">All major keywords present!</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Strengths & Weaknesses */}
              {feedback && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card title="Observed Strengths" className="border-emerald-200/80">
                    <ul className="space-y-2 text-xs text-slate-700">
                      {(feedback.strengths || []).map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card title="Areas for Optimization" className="border-amber-200/80">
                    <ul className="space-y-2 text-xs text-slate-700">
                      {(feedback.weaknesses || []).map((w, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}

              {/* Rewrite Suggestions */}
              {feedback?.rewriteSuggestions && feedback.rewriteSuggestions.length > 0 && (
                <Card title="Actionable Bullet Rewrite Suggestions">
                  <div className="space-y-4">
                    {feedback.rewriteSuggestions.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                        <div>
                          <span className="font-bold text-slate-500 block mb-0.5">Original / Typical Bullet:</span>
                          <p className="line-through text-slate-600 italic">{item.originalSectionOrBullet}</p>
                        </div>
                        <div>
                          <span className="font-bold text-emerald-700 block mb-0.5">High-Impact Revision:</span>
                          <p className="text-slate-900 font-semibold">{item.improvedVersion}</p>
                        </div>
                        <div className="pt-1 text-[11px] text-indigo-700 bg-indigo-50/80 p-2 rounded">
                          <span className="font-bold">Coaching Tip: </span>{item.rationale}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
