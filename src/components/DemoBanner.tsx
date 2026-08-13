import React, { useState } from 'react';
import { Sparkles, Database, PlusCircle, CheckCircle2, RotateCcw, X, Info, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

interface DemoBannerProps {
  isSupabaseConfigured: boolean;
  onSimulateTicket: () => void;
  onSimulateProgress: () => void;
  onResetDemo: () => void;
  demoModalOpen: boolean;
  setDemoModalOpen: (open: boolean) => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({
  isSupabaseConfigured,
  onSimulateTicket,
  onSimulateProgress,
  onResetDemo,
  demoModalOpen,
  setDemoModalOpen,
}) => {
  return (
    <>
      {/* Top Demo Bar */}
      <div className="mb-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 p-4 text-white shadow-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-kibs-green/20 text-kibs-green">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-black tracking-wide text-white uppercase">Client Presentation Demo</h2>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                  {isSupabaseConfigured ? 'Supabase Live Connected' : 'Interactive Mock Mode'}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-300">
                Showcase real-time field ticketing, survey logs, technician updates & feedback loops to your client.
              </p>
            </div>
          </div>

          {/* Quick Demo Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSimulateTicket}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>+ Demo Support Ticket</span>
            </button>
            <button
              type="button"
              onClick={onSimulateProgress}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 border border-slate-700 hover:bg-slate-700 transition"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Progress Field Job</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition"
            >
              <Database className="h-3.5 w-3.5 text-emerald-400" />
              <span>Supabase Integration</span>
            </button>
          </div>
        </div>
      </div>

      {/* Supabase Integration Info Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setDemoModalOpen(false)}
              className="absolute top-4 right-4 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-950">Supabase Backend Integration</h3>
                <p className="text-xs font-semibold text-emerald-700">Ready for Instant Production Deployment</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <p>
                Currently, Kibs Connect is running in <strong>Interactive Demo Mode</strong> with pre-populated realistic mock data (sites, CCTV installations, tickets, equipment logs, and technician assignments).
              </p>
              
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-mono text-slate-800">
                <div className="flex items-center justify-between text-slate-500 font-sans font-bold border-b border-slate-200 pb-2 mb-2">
                  <span>Supabase Environment Setup</span>
                  <span className="text-emerald-700 font-mono">.env</span>
                </div>
                <p className="text-slate-600">VITE_SUPABASE_URL=https://your-project.supabase.co</p>
                <p className="text-slate-600">VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni... (your-anon-key)</p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-900">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Included Database Schema
                </h4>
                <p className="mt-1 text-xs text-emerald-800">
                  The complete SQL migration script is located at <code className="font-bold text-emerald-900">supabase/schema.sql</code> including client tables, site locations, field jobs, equipment inventories, technician logs, and feedback metrics.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDemoModalOpen(false)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Back to Presentation Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
