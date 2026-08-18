import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ClipboardList,
  LayoutList,
  PlusCircle,
} from 'lucide-react';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { LoginPage } from './components/LoginPage';
import { SurveyForm } from './components/SurveyForm';
import { SurveyList } from './components/SurveyList';
import { SurveyModal } from './components/SurveyModal';
import { surveys as initialSurveys } from './data/mockData';
import type { Survey, SurveyStatus, User } from './types';

const SESSION_KEY = 'kibs-connect-session';

function formatDate(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function nextSurveyNumber(surveys: Survey[]) {
  const highest = surveys.reduce((max, survey) => {
    const num = Number(survey.surveyNumber.replace(/\D/g, ''));
    return Number.isFinite(num) ? Math.max(max, num) : max;
  }, 0);
  return `SV-${String(highest + 1).padStart(4, '0')}`;
}

type TechnicianTab = 'new' | 'mine';
type AdminTab = 'pending' | 'approved' | 'all';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });
  const [surveys, setSurveys] = useState<Survey[]>(initialSurveys);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [technicianTab, setTechnicianTab] = useState<TechnicianTab>('new');
  const [adminTab, setAdminTab] = useState<AdminTab>('pending');
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const mySurveys = useMemo(
    () => (user ? surveys.filter((survey) => survey.technicianId === user.id) : []),
    [surveys, user]
  );

  const pendingSurveys = useMemo(() => surveys.filter((survey) => survey.status === 'pending'), [surveys]);
  const approvedSurveys = useMemo(() => surveys.filter((survey) => survey.status === 'approved'), [surveys]);

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  function handleLogout() {
    setUser(null);
    setActiveSurvey(null);
  }

  function handleCreateSurvey(survey: Survey) {
    setSurveys((prev) => [survey, ...prev]);
    setTechnicianTab('mine');
  }

  function handleApprove(surveyId: string) {
    if (!user) return;
    setSurveys((prev) =>
      prev.map((survey) =>
        survey.id === surveyId
          ? {
              ...survey,
              status: 'approved' as SurveyStatus,
              approvedBy: user.name,
              approvedAt: new Date().toISOString(),
            }
          : survey
      )
    );
    setActiveSurvey((prev) => (prev && prev.id === surveyId ? { ...prev, status: 'approved' } : prev));
  }

  const adminVisibleSurveys =
    adminTab === 'pending' ? pendingSurveys : adminTab === 'approved' ? approvedSurveys : surveys;

  const technicianNavItems = [
    { id: 'new' as TechnicianTab, label: 'New Survey', icon: PlusCircle },
    { id: 'mine' as TechnicianTab, label: 'My Surveys', icon: ClipboardList },
  ];

  const adminNavItems = [
    { id: 'pending' as AdminTab, label: 'Pending', icon: Clock },
    { id: 'approved' as AdminTab, label: 'Approved', icon: CheckCircle2 },
    { id: 'all' as AdminTab, label: 'All Surveys', icon: LayoutList },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 sm:pb-8">
      <Header
        user={user}
        onLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="mx-auto max-w-2xl px-3 py-4 sm:px-6 sm:py-6">
        {user.role === 'technician' ? (
          <>
            <div className="mb-4 hidden gap-2 sm:flex">
              {technicianNavItems.map((item) => {
                const Icon = item.icon;
                const active = technicianTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTechnicianTab(item.id)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                      active
                        ? 'bg-kibs-deepGreen text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {technicianTab === 'new' ? (
              <SurveyForm
                technician={user}
                nextSurveyNumber={nextSurveyNumber(surveys)}
                onSubmit={handleCreateSurvey}
              />
            ) : (
              <SurveyList
                surveys={mySurveys}
                onSelect={setActiveSurvey}
                emptyMessage="You haven't submitted any surveys yet."
                formatDate={formatDate}
              />
            )}

            <MobileNav items={technicianNavItems} activeId={technicianTab} onChange={setTechnicianTab} />
          </>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                <p className="text-xl font-black text-slate-950">{surveys.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Total</p>
              </div>
              <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-center">
                <p className="text-xl font-black text-red-700">{pendingSurveys.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-red-500">Pending</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-center">
                <p className="text-xl font-black text-emerald-700">{approvedSurveys.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Approved</p>
              </div>
            </div>

            <div className="mb-4 hidden gap-2 sm:flex">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const active = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAdminTab(item.id)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                      active
                        ? 'bg-kibs-deepGreen text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <SurveyList
              surveys={adminVisibleSurveys}
              onSelect={setActiveSurvey}
              showTechnician
              emptyMessage="No surveys in this view yet."
              formatDate={formatDate}
            />

            <MobileNav items={adminNavItems} activeId={adminTab} onChange={setAdminTab} />
          </>
        )}
      </main>

      <SurveyModal
        survey={activeSurvey}
        onClose={() => setActiveSurvey(null)}
        onApprove={handleApprove}
        canApprove={user.role === 'admin'}
        formatDate={formatDate}
      />

      <PwaInstallPrompt />
    </div>
  );
}
