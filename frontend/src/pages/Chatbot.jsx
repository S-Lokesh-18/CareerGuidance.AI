import React, { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import {
  MessageSquare,
  Send,
  Trash2,
  Sparkles,
  Bot,
  User,
  Lightbulb,
} from 'lucide-react';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/chat/history');
        if (res.success && res.data) {
          setMessages(res.data);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || sending) return;

    setError('');
    const tempText = textToSend.trim();
    setInputMessage('');

    // Optimistic user message addition
    const optimisticUserMsg = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: tempText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);
    setSending(true);

    try {
      const res = await api.post('/chat', { message: tempText });
      if (res.success && res.data?.assistantMessage) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== optimisticUserMsg.id),
          res.data.userMessage,
          res.data.assistantMessage,
        ]);
      }
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear your chat history?')) return;
    try {
      await api.delete('/chat/history');
      setMessages([]);
    } catch (err) {
      setError(err.message || 'Failed to clear chat history.');
    }
  };

  const SUGGESTIONS = [
    'What practical project can I build to close my skill gap?',
    'How do I prepare for behavioral and technical interviews?',
    'What should my daily study schedule look like for this career?',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 h-[calc(100vh-5rem)] flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>AI Career Counselor</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
            </h1>
            <p className="text-xs text-slate-500">
              Personalized advice tuned to your latest career match and skill gaps
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-slate-500 hover:text-rose-600 gap-1.5"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Clear History</span>
          </Button>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Suggested Questions */}
      {messages.length === 0 && !loading && (
        <div className="my-auto py-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">How can I assist your career path today?</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Ask questions about career switching, portfolio construction, resume tuning, or specific technical topics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-xl mx-auto">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="w-full sm:w-auto p-3 text-left sm:text-center rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-xs text-slate-700 font-medium transition-colors shadow-xs hover:bg-slate-50 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Spinner size="lg" className="text-indigo-600 mb-2" />
            <p className="text-xs text-slate-500">Loading conversation history...</p>
          </div>
        ) : (
          messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id || idx}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}

        {sending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 shadow-xs flex items-center gap-2">
              <Spinner size="sm" className="text-indigo-600" />
              <span className="text-xs text-slate-500">AI Counselor is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <div className="pt-3 border-t border-slate-200/80 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything about your career path, skills, or projects..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={sending}
            className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={sending}
            disabled={!inputMessage.trim() || sending}
            className="px-5 py-3 h-full rounded-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
