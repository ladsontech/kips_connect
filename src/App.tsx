import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  ClipboardList,
  LayoutDashboard,
  LayoutList,
  Loader2,
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
import { EditAssignmentModal } from './components/EditAssignmentModal';
import { TechnicianManager } from './components/TechnicianManager';
import { AddTechnicianModal } from './components/AddTechnicianModal';
import { EditTechnicianModal } from './components/EditTechnicianModal';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import {
  approveSurvey,
  cancelAssignment,
  createAssignment,
  createSurvey,
  createTechnician,
  deleteTechnician,
  fetchAssignments,
  fetchProfile,
  fetchSurveys,
  fetchTechnicians,
  signOut,
  updateAssignment,
  updateTechnician,
  type AssignmentDraft,
  type CreateTechnicianInput,
  type SurveyDraft,
  type UpdateTechnicianInput,
} from './lib/api';
import type { SiteAssignment, Survey, User } from './types';

function formatDate(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

type TechnicianTab = 'sites' | 'new' | 'mine';
type AdminTab = 'overview' | 'sites' | 'technicians' | 'pending' | 'approved' | 'all';

function ConfigNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <h1 className="text-lg font-black text-amber-900">Supabase isn't configured yet</h1>
        <p className="mt-2 text-sm text-amber-800">
          Add <code className="rounded bg-amber-100 px-1.5 py-0.5">VITE_SUPABASE_URL</code> and{' '}
          <code className="rounded bg-amber-100 px-1.5 py-0.5">VITE_SUPABASE_ANON_KEY</code> to a{' '}
          <code className="rounded bg-amber-100 px-1.5 py-0.5">.env.local</code> file and restart the app.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [sessionLoading, setSessionLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [assignments, setAssignments] = useState<SiteAssignment[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [technicianTab, setTechnicianTab] = useState<TechnicianTab>('sites');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [prefillAssignment, setPrefillAssignment] = useState<SiteAssignment | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddTechnicianModal, setShowAddTechnicianModal] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<User | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<SiteAssignment | null>(null);
  const [actionError, setActionError] = useState('');

  function flashError(message: string) {
    setActionError(message);
    window.setTimeout(() => setActionError(''), 4000);
  }

  // Restore the signed-in user from the Supabase session on load, and keep
  // this state in sync if the session ends elsewhere (e.g. token expiry).
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSessionLoading(false);
      return;
    }
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (data.session) {
        const profile = await fetchProfile(data.session.user.id);
        if (active) setUser(profile);
      }
      if (active) setSessionLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setUser(null);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Load surveys/assignments/(technicians for admins) whenever a user signs in.
  useEffect(() => {
    if (!user) {
      setSurveys([]);
      setAssignments([]);
      setTechnicians([]);
      return;
    }

    let active = true;
    setDataLoading(true);
    setLoadError('');

    (async () => {
      try {
        const [surveysData, assignmentsData] = await Promise.all([fetchSurveys(), fetchAssignments()]);
        if (!active) return;
        setSurveys(surveysData);
        setAssignments(assignmentsData);
        if (user.role === 'admin') {
          const techs = await fetchTechnicians();
          if (active) setTechnicians(techs);
        }
      } catch (err) {
        if (active) setLoadError(err instanceof Error ? err.message : 'Could not load data from Supabase.');
      } finally {
        if (active) setDataLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user?.id]);

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
  const openAssignments = useMemo(() => assignments.filter((a) => a.status === 'assigned'), [assignments]);

  if (!isSupabaseConfigured) {
    return <ConfigNotice />;
  }

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-kibs-deepGreen" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  async function handleLogout() {
    await signOut();
    setUser(null);
    setActiveSurvey(null);
    setPrefillAssignment(null);
  }

  async function handleCreateSurvey(draft: SurveyDraft) {
    if (!user) return;
    const survey = await createSurvey(draft, user);
    setSurveys((prev) => [survey, ...prev]);
    if (draft.assignmentId) {
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === draft.assignmentId
            ? { ...assignment, status: 'completed' as const, surveyId: survey.id }
            : assignment
        )
      );
    }
    setTechnicianTab('mine');
  }

  async function handleApprove(surveyId: string) {
    if (!user) return;
    try {
      await approveSurvey(surveyId, user);
      const approvedAt = new Date().toISOString();
      setSurveys((prev) =>
        prev.map((survey) =>
          survey.id === surveyId
            ? { ...survey, status: 'approved' as const, approvedBy: user.name, approvedAt }
            : survey
        )
      );
      setActiveSurvey((prev) =>
        prev && prev.id === surveyId
          ? { ...prev, status: 'approved' as const, approvedBy: user.name, approvedAt }
          : prev
      );
    } catch (err) {
      flashError(err instanceof Error ? err.message : 'Could not approve this survey.');
    }
  }

  async function handleCreateAssignment(draft: AssignmentDraft) {
    if (!user) return;
    const assignment = await createAssignment(draft, user);
    setAssignments((prev) => [assignment, ...prev]);
  }

  async function handleUpdateAssignment(assignmentId: string, draft: AssignmentDraft) {
    const updated = await updateAssignment(assignmentId, draft);
    setAssignments((prev) => prev.map((a) => (a.id === assignmentId ? updated : a)));
  }

  async function handleCancelAssignment(assignmentId: string) {
    try {
      await cancelAssignment(assignmentId);
      setAssignments((prev) => prev.filter((assignment) => assignment.id !== assignmentId));
    } catch (err) {
      flashError(err instanceof Error ? err.message : 'Could not cancel this assignment.');
    }
  }

  function handleStartSurvey(assignment: SiteAssignment) {
    setPrefillAssignment(assignment);
    setTechnicianTab('new');
  }

  function handleViewSurvey(surveyId: string) {
    const survey = surveys.find((s) => s.id === surveyId);
    if (survey) setActiveSurvey(survey);
  }

  async function handleCreateTechnician(input: CreateTechnicianInput): Promise<User> {
    const technician = await createTechnician(input);
    setTechnicians((prev) => [...prev, technician].sort((a, b) => a.name.localeCompare(b.name)));
    return technician;
  }

  async function handleUpdateTechnician(technicianId: string, input: UpdateTechnicianInput): Promise<User> {
    const updated = await updateTechnician(technicianId, input);
    setTechnicians((prev) =>
      prev.map((t) => (t.id === technicianId ? updated : t)).sort((a, b) => a.name.localeCompare(b.name))
    );
    return updated;
  }

  async function handleRemoveTechnician(technicianId: string) {
    const hasOpenWork = assignments.some(
      (a) => a.technicianId === technicianId && a.status === 'assigned'
    );
    if (hasOpenWork) {
      flashError("Cancel or reassign this technician's open site assignments before removing them.");
      return;
    }
    try {
      await deleteTechnician(technicianId);
      setTechnicians((prev) => prev.filter((t) => t.id !== technicianId));
    } catch (err) {
      flashError(err instanceof Error ? err.message : 'Could not remove this technician.');
    }
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

      {(actionError || loadError) && (
        <div className="mx-auto mt-3 max-w-6xl px-3 sm:px-6">
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-bold text-red-700">
            {actionError || loadError}
          </div>
        </div>
      )}

      {dataLoading && surveys.length === 0 && assignments.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-kibs-deepGreen" />
        </div>
      ) : user.role === 'technician' ? (
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
                onEdit={setEditingAssignment}
              />
            )}
            {adminTab === 'technicians' && (
              <TechnicianManager
                technicians={technicians}
                surveys={surveys}
                assignments={assignments}
                onEdit={setEditingTechnician}
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
          <EditAssignmentModal
            open={!!editingAssignment}
            assignment={editingAssignment}
            technicians={technicians}
            onClose={() => setEditingAssignment(null)}
            onSave={handleUpdateAssignment}
          />
          <AddTechnicianModal
            open={showAddTechnicianModal}
            existingUsers={technicians}
            onClose={() => setShowAddTechnicianModal(false)}
            onCreate={handleCreateTechnician}
          />
          <EditTechnicianModal
            open={!!editingTechnician}
            technician={editingTechnician}
            existingUsers={technicians}
            onClose={() => setEditingTechnician(null)}
            onSave={handleUpdateTechnician}
          />
        </>
      )}

      <PwaInstallPrompt />
    </div>
  );
}
