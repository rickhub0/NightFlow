/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  History, 
  BarChart3, 
  Moon, 
  Sun, 
  Bell,
  Search,
  MoreVertical,
  Trash2,
  Zap
} from 'lucide-react';
import { supabase, type Task } from './lib/supabase';
import { parseTask } from './lib/gemini';
import { format } from 'date-fns';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [view, setView] = useState<'today' | 'history' | 'analytics'>('today');
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    fetchTasks();
    
    // Realtime subscription
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        fetchTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTasks = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setTasks(data);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !supabase) return;

    setIsParsing(true);
    const parsed = await parseTask(input);
    
    const { error } = await supabase.from('tasks').insert([{
      user_id: '00000000-0000-0000-0000-000000000000', // Mock user ID for now
      title: parsed.title,
      category: parsed.category,
      priority: parsed.priority,
      due_at: parsed.due_at,
      completed: false
    }]);

    if (!error) {
      setInput('');
      fetchTasks();
    }
    setIsParsing(false);
  };

  const toggleComplete = async (task: Task) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', task.id);
    
    if (!error && !task.completed) {
      // Move to history logic could go here
      await supabase.from('history').insert([{
        user_id: task.user_id,
        task_id: task.id,
        title: task.title,
        category: task.category
      }]);
    }
  };

  const deleteTask = async (id: string) => {
    if (!supabase) return;
    await supabase.from('tasks').delete().eq('id', id);
  };

  if (!supabase) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="glass-panel p-12 max-w-md text-center">
          <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center text-accent mx-auto mb-6">
            <Zap size={32} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Configuration Required</h1>
          <p className="text-text-dim text-sm mb-8 leading-relaxed">
            Please set your <span className="text-accent font-mono">VITE_SUPABASE_URL</span> and <span className="text-accent font-mono">VITE_SUPABASE_ANON_KEY</span> in the Secrets panel to activate your productivity system.
          </p>
          <div className="bg-black/30 rounded-xl p-4 text-left border border-glass-border">
            <p className="text-[10px] uppercase tracking-widest font-bold text-text-dim mb-2">Setup Guide</p>
            <ol className="text-xs text-text-dim space-y-2 list-decimal pl-4">
              <li>Go to Supabase Project Settings</li>
              <li>Copy Project URL and Anon Key</li>
              <li>Open Secrets panel in AI Studio</li>
              <li>Add the variables and restart</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen p-5 gap-5 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] glass-panel flex flex-col p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_var(--color-accent)]" />
          <span className="text-xl font-bold tracking-tight">NightFlow</span>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-2">
            <NavButton active={view === 'today'} onClick={() => setView('today')} icon={<Clock size={18} />} label="Dashboard" />
            <NavButton active={view === 'history'} onClick={() => setView('history')} icon={<History size={18} />} label="History" />
            <NavButton active={view === 'analytics'} onClick={() => setView('analytics')} icon={<BarChart3 size={18} />} label="Analytics" />
          </ul>
        </nav>

        <div className="mt-auto pt-6 border-t border-glass-border">
          <div className="flex items-center gap-2 text-[11px] text-emerald-400">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#4caf50]" />
            Realtime Sync: Active
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-5 overflow-y-auto pr-2">
        <header className="py-2">
          <h1 className="text-3xl font-semibold">
            {view === 'today' && 'Good Evening, User'}
            {view === 'history' && 'Task History'}
            {view === 'analytics' && 'Performance'}
          </h1>
          <p className="text-text-dim text-sm mt-1">
            {view === 'today' && `You have ${tasks.filter(t => !t.completed).length} primary objectives scheduled for tonight.`}
            {view === 'history' && 'Reviewing your past achievements.'}
            {view === 'analytics' && 'Analyzing your productivity trends.'}
          </p>
        </header>

        {view === 'today' && (
          <>
            <div className="glass-panel p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[12px] uppercase tracking-widest font-semibold text-text-dim">Active Tasks</span>
                <span className="tag-pill">{tasks.filter(t => !t.completed).length} remaining</span>
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                <AnimatePresence mode="popLayout">
                  {tasks.filter(t => !t.completed).map((task) => (
                    <motion.div 
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="task-item-container group"
                    >
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => toggleComplete(task)}
                          className="w-5 h-5 border-2 border-accent rounded-md flex items-center justify-center hover:bg-accent/10 transition-colors"
                        >
                          {task.completed && <CheckCircle2 size={14} className="text-accent" />}
                        </button>
                        <div>
                          <h3 className="text-[15px] font-medium">{task.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-text-dim bg-white/5 px-1.5 py-0.5 rounded">
                              {task.category}
                            </span>
                            {task.due_at && (
                              <span className="text-[10px] text-text-dim flex items-center gap-1">
                                <Clock size={10} />
                                {format(new Date(task.due_at), 'h:mm a')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`tag-pill ${
                          task.priority === 'High' ? 'text-red-400 bg-red-400/10' : 
                          task.priority === 'Medium' ? 'text-amber-400 bg-amber-400/10' : 'text-emerald-400 bg-emerald-400/10'
                        }`}>
                          {task.priority}
                        </span>
                        <button onClick={() => deleteTask(task.id)} className="p-2 text-text-dim hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {tasks.filter(t => !t.completed).length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-text-dim py-20">
                    <Zap size={40} className="mb-4 opacity-20" />
                    <p className="text-sm">All clear. System optimized.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel p-6 h-[180px]">
              <span className="text-[12px] uppercase tracking-widest font-semibold text-text-dim">Weekly Performance Preview</span>
              <div className="flex gap-4 mt-4">
                <StatPill label="Efficiency" value="94%" />
                <StatPill label="Completed" value={tasks.filter(t => t.completed).length.toString()} />
                <StatPill label="Deep Work" value="32h" />
              </div>
            </div>
          </>
        )}

        {view === 'history' && (
          <div className="glass-panel p-6 flex-1 overflow-y-auto">
            <span className="text-[12px] uppercase tracking-widest font-semibold text-text-dim mb-6 block">Completed Objectives</span>
            {tasks.filter(t => t.completed).map((task) => (
              <div key={task.id} className="task-item-container opacity-60">
                <div className="flex items-center gap-4">
                  <CheckCircle2 size={20} className="text-accent" />
                  <div>
                    <h3 className="text-[15px] font-medium line-through text-text-dim">{task.title}</h3>
                    <p className="text-[10px] text-text-dim mt-1">Archived on {format(new Date(task.created_at), 'MMM d')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'analytics' && (
          <div className="grid grid-cols-2 gap-5">
            <div className="glass-panel p-8">
              <p className="text-[10px] font-semibold text-text-dim uppercase tracking-widest mb-2">Productivity Index</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-accent">84</span>
                <span className="text-xs text-text-dim">Top 12%</span>
              </div>
            </div>
            <div className="glass-panel p-8">
              <p className="text-[10px] font-semibold text-text-dim uppercase tracking-widest mb-2">Total Output</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-accent">{tasks.filter(t => t.completed).length}</span>
                <span className="text-xs text-text-dim">Tasks</span>
              </div>
            </div>
            <div className="glass-panel p-6 col-span-2">
              <span className="text-[12px] uppercase tracking-widest font-semibold text-text-dim mb-4 block">AI Insights</span>
              <p className="text-text-dim text-sm leading-relaxed">
                Your neural patterns show peak efficiency between 9 PM and 11 PM. "Work" modules are 90% optimized, but "Ideas" require more allocation. Break down conceptual tasks into smaller executable units.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Right Panel */}
      <aside className="w-[300px] flex flex-col gap-5">
        <div className="glass-panel p-6 text-center">
          <span className="text-[12px] uppercase tracking-widest font-semibold text-text-dim">Focus Timer</span>
          <div className="timer-display my-4">24:58</div>
          <p className="text-[11px] text-text-dim">Next: System Review</p>
        </div>

        <div className="glass-panel p-6 flex-1 flex flex-col">
          <span className="text-[12px] uppercase tracking-widest font-semibold text-text-dim">AI Productivity Agent</span>
          <p className="text-[13px] text-text-dim mt-4 leading-relaxed italic">
            "I've analyzed your task list. Based on your current focus, I recommend finishing the SQL schema before the WebSocket implementation to ensure data consistency."
          </p>
          
          <div className="mt-auto">
            <div className="text-[11px] text-accent font-semibold mb-2 uppercase tracking-wider">Ask AI Assistant</div>
            <form onSubmit={handleAddTask} className="relative">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. 'Add task: UI fix...'"
                className="w-full bg-black/30 border border-glass-border rounded-xl p-3 text-xs text-white outline-none focus:border-accent/50 transition-all"
              />
              {isParsing && (
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 1 }} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-accent"
                >
                  <Zap size={14} />
                </motion.div>
              )}
            </form>
          </div>
        </div>

        <div className="glass-panel p-6">
          <span className="text-[12px] uppercase tracking-widest font-semibold text-text-dim">Device Health</span>
          <div className="mt-4 space-y-3">
            <HealthItem label="Web App" status="Live" />
            <HealthItem label="Mobile" status="Live" />
            <HealthItem label="Extension" status="Live" />
          </div>
        </div>
      </aside>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-white/5 text-text-bright border-l-3 border-accent' 
          : 'text-text-dim hover:text-text-bright hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function StatPill({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex-1 bg-white/5 p-3 rounded-xl text-center">
      <span className="text-[10px] text-text-dim uppercase tracking-wider">{label}</span>
      <span className="block text-xl font-bold text-accent mt-1">{value}</span>
    </div>
  );
}

function HealthItem({ label, status }: { label: string, status: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-text-dim">{label}</span>
      <span className="text-emerald-400 font-medium">{status}</span>
    </div>
  );
}


