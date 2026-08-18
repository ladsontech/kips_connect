import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  ClipboardList,
  LayoutDashboard,
  LayoutList,
  PlusCircle,
  Users,
} from 'lucide-react';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { Sidebar } from './components/Sidebar';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { LoginPage } from './components/LoginPage';
import { SurveyForm } from './components/SurveyForm';
import { SurveyList } from './components/SurveyList';
import { SurveyModal } from './components/SurveyModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AssignmentList } from './components/AssignmentList';
import { AssignSiteModal } from './components/AssignSiteModal';
import { TechnicianManager } from './components/TechnicianManager';
import { AddTechnicianModal } from './components/AddTechnicianModal';
import {
  surveys as initialSurveys,
  siteAssignments as initialAssignments,
  users as defaultUsers,
} from './data/mockData';
import type { SiteAssignment, Survey, SurveyStatus, User } from './types';

const SESSION_KEY = 'kibs-connect-session';
const SURVEYS_KEY = 'kibs-connect-surveys';
const ASSIGNMENTS_KEY = 'kibs-connect-assignments';
const USERS_KEY = 'kibs-connect-users';

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

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

type TechnicianTab = 'sites' | 'new' | 'mine';
type AdminTab = 'overview' | 'sites' | 'technicians' | 'pending' | 'approved' | 'all';

export default function App() {
  const [allUsers, setAllUsers] = useState<User[]>(() => loadFromStorage(USERS_KEY, defaultUsers));
  const [user, setUser] = useState<User | null>(() => loadFromStorage(SESSION_KEY, null));
  const [surveys, setSurveys] = useState<Survey[]>(() => loadFromStorage(SURVEYS_KEY, initialSurveys));
  const [assignments, setAssignments] = useState<SiteAssignment[]>(() =>
    loadFromStorage(ASSIGNMENTS_KEY, initialAssignments)
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [technicianTab, setTechnicianTab] = useState<TechnicianTab>('sites');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [prefillAssignment, setPrefillAssignment] = useState<SiteAssignment | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddTechnicianModal, setShowAddTechnicianModal] = useState(false);
  const [technicianError, setTechnicianError] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
    } catch {
      // Local storage full — user list stays in memory for this session.
    }
  }, [allUsers]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys));
    } catch {
      // Local storage full (large photo attachments) — surveys stay in memory for this session.
    }
  }, [surveys]);

  useEffect(() => {
    try {
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
    } catch {
      // Local storage full — assignments stay in memory for this session.
    }
  }, [assignments]);

  const mySurveys = useMemo(
    () => (user ? surveys.filter((survey) => survey.technicianId === user.id) : []),
    [surveys, user]
  );

  const myAssignments = useMemo(
    () => (user ? assignments.filter((assignment) => assignment.technicianId === user.id) : []),
    [assignments, user]
  );

  const pendingSurveys = useMemo(() => surveys.filter((survey) => survey.status === 'pending'), [surveys]);
  const approvedSurveys = useMemo(() => surveys.filter((survey) => survey.status === 'approved'), [surveys]);
  const technicians = useMemo(() => allUsers.filter((u) => u.role === 'technician'), [allUsers]);
  const openAssignments = useMemo(() => assignments.filter((a) => a.status === 'assigned'), [assignments]);

  if (!user) {
    return <LoginPage users={allUsers} onLogin={setUser} />;
  }

  function handleLogout() {
    setUser(null);
    setActiveSurvey(null);
    setPrefillAssignment(null);
  }

  function handleCreateSurvey(survey: Survey) {
    setSurveys((prev) => [survey, ...prev]);
    if (survey.assignmentId) {
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === survey.assignmentId
            ? { ...assignment, status: 'completed' as const, surveyId: survey.id }
            : assignment
        )
      );
    }
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

  function handleCreateAssignment(assignment: SiteAssignment) {
    setAssignments((prev) => [assignment, ...prev]);
  }

  function handleCancelAssignment(assignmentId: string) {
    setAssignments((prev) => prev.filter((assignment) => assignment.id !== assignmentId));
  }

  function handleStartSurvey(assignment: SiteAssignment) {
    setPrefillAssignment(assignment);
    setTechnicianTab('new');
  }

  function handleViewSurvey(surveyId: string) {
    const survey = surveys.find((s) => s.id === surveyId);
    if (survey) setActiveSurvey(survey);
  }

  function handleCreateTechnician(technician: User) {
    setAllUsers((prev) => [...prev, technician]);
  }

  function handleRemoveTechnician(technicianId: string) {
    const hasOpenWork = assignments.some(
      (a) => a.technicianId === technicianId && a.status === 'assigned'
    );
    if (hasOpenWork) {
      setTechnicianError('Cancel or reassign this technician\'s open site assignments before removing them.');
      window.setTimeout(() => setTechnicianError(''), 4000);
      return;
    }
    setAllUsers((prev) => prev.filter((u) => u.id !== technicianId));
  }

  const adminVisibleSurveys =
    adminTab === 'pending' ? pendingSurveys : adminTab === 'approved' ? approvedSurveys : surveys;

  const technicianNavItems = [
    { id: 'sites' as TechnicianTab, label: 'My Sites', icon: Building2 },
    { id: 'new' as TechnicianTab, label: 'New Survey', icon: PlusCircle },
    { id: 'mine' as TechnicianTab, label: 'My Surveys', icon: ClipboardList },
  ];

  const adminNavItems = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'sites' as AdminTab, label: 'Sites', icon: Building2, count: openAssignments.length },
    { id: 'pending' as AdminTab, label: 'Pending', icon: Clock, count: pendingSurveys.length },
    { id: 'approved' as AdminTab, label: 'Approved', icon: CheckCircle2 },
    { id: 'all' as AdminTab, label: 'All Surveys', icon: LayoutList },
    { id: 'technicians' as AdminTab, label: 'Technicians', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 sm:pb-8">
      <Header
        user={user}
        onLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {user.role === 'technician' ? (
        <main className="mx-auto max-w-2xl px-3 py-4 sm:px-6 sm:py-6">
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

          {technicianTab === 'sites' && (
            <AssignmentList
              assignments={myAssignments}
              formatDate={formatDate}
              emptyMessage="No sites have been assigned to you yet."
              onStartSurvey={handleStartSurvey}
              onViewSurvey={handleViewSurvey}
            />
          )}
          {technicianTab === 'new' && (
            <SurveyForm
              technician={user}
              nextSurveyNumber={nextSurveyNumber(surveys)}
              assignment={prefillAssignment}
              onClearAssignment={() => setPrefillAssignment(null)}
              onSubmit={handleCreateSurvey}
            />
          )}
          {technicianTab === 'mine' && (
            <SurveyList
              surveys={mySurveys}
              onSelect={setActiveSurvey}
              emptyMessage="You haven't submitted any surveys yet."
              formatDate={formatDate}
            />
          )}

          <MobileNav items={technicianNavItems} activeId={technicianTab} onChange={setTechnicianTab} />
        </main>
      ) : (
        <div className="mx-auto flex max-w-6xl gap-6 px-3 py-4 sm:px-6 sm:py-6">
          <Sidebar
            items={adminNavItems}
            activeId={adminTab}
            onChange={setAdminTab}
            onAddSite={() => setShowAssignModal(true)}
            onAddTechnician={() => setShowAddTechnicianModal(true)}
          />

          <main className="min-w-0 flex-1">
            {technicianError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-bold text-red-700">
                {technicianError}
              </div>
            )}

            {adminTab === 'overview' && (
              <AdminDashboard
                surveys={surveys}
                assignments={assignments}
                onSelectSurvey={setActiveSurvey}
                onViewAll={() => setAdminTab('all')}
                onViewSites={() => setAdminTab('sites')}
                formatDate={formatDate}
              />
            )}
            {adminTab === 'sites' && (
              <AssignmentList
                assignments={assignments}
                formatDate={formatDate}
                emptyMessage="No sites assigned yet. Use Add Site to assign one."
                showTechnician
                onCancel={handleCancelAssignment}
                onViewSurvey={handleViewSurvey}
              />
            )}
            {adminTab === 'technicians' && (
              <TechnicianManager
                technicians={technicians}
                surveys={surveys}
                assignments={assignments}
                onRemove={handleRemoveTechnician}
              />
            )}
            {(adminTab === 'pending' || adminTab === 'approved' || adminTab === 'all') && (
              <SurveyList
                surveys={adminVisibleSurveys}
                onSelect={setActiveSurvey}
                showTechnician
                emptyMessage="No surveys in this view yet."
                formatDate={formatDate}
              />
            )}
          </main>

          <MobileNav items={adminNavItems} activeId={adminTab} onChange={setAdminTab} />
        </div>
      )}

      <SurveyModal
        survey={activeSurvey}
        onClose={() => setActiveSurvey(null)}
        onApprove={handleApprove}
        canApprove={user.role === 'admin'}
        formatDate={formatDate}
      />

      {user.role === 'admin' && (
        <>
          <AssignSiteModal
            open={showAssignModal}
            admin={user}
            technicians={technicians}
            onClose={() => setShowAssignModal(false)}
            onCreate={handleCreateAssignment}
          />
          <AddTechnicianModal
            open={showAddTechnicianModal}
            existingUsers={allUsers}
            onClose={() => setShowAddTechnicianModal(false)}
            onCreate={handleCreateTechnician}
          />
        </>
      )}

      <PwaInstallPrompt />
    </div>
  );
}
