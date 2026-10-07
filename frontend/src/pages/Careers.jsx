import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Input from '../components/Input';
import {
  Briefcase,
  Search,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Sliders,
} from 'lucide-react';

export default function Careers() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const res = await api.get('/careers');
        if (res.success && res.data) {
          setCareers(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch careers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCareers();
  }, []);

  const tags = ['All', 'web development', 'data', 'analytics', 'design', 'security', 'cloud', 'ml'];

  const filteredCareers = careers.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedTag === 'All') return matchesSearch;

    const interestTags = Array.isArray(c.interest_tags)
      ? c.interest_tags
      : JSON.parse(c.interest_tags || '[]');

    const matchesTag = interestTags.some((tag) =>
      tag.toLowerCase().includes(selectedTag.toLowerCase())
    );

    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore Career Pathways
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Browse vetted tech and data disciplines, assess skill requirements, forecast market demand, and launch customized learning roadmaps.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80 relative">
          <Input
            placeholder="Search roles or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Careers Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Spinner size="lg" className="text-indigo-600 mb-2" />
          <p className="text-sm text-slate-500">Loading career profiles...</p>
        </div>
      ) : filteredCareers.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-base text-slate-600">No career paths found matching your criteria.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map((c) => {
            const skills = Array.isArray(c.required_skills)
              ? c.required_skills
              : JSON.parse(c.required_skills || '[]');

            return (
              <Card
                key={c.id}
                className="hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between"
                hover
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Demand: {c.demand_level}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{c.salary_range}</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">{c.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {c.description}
                  </p>

                  {/* Skills badges */}
                  <div className="mb-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Key Required Skills:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.slice(0, 4).map((s) => (
                        <span
                          key={s.skill}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                        >
                          {s.skill} (w:{s.weight})
                        </span>
                      ))}
                      {skills.length > 4 && (
                        <span className="px-1.5 py-0.5 text-xs text-slate-400 font-medium">
                          +{skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link to={`/careers/${c.id}`} className="w-full">
                    <Button variant="primary" size="sm" className="w-full gap-1.5">
                      <span>Explore Skill Gap & Trends</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
