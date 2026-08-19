import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  ClipboardList,
  LayoutDashboard,
  LayoutList,
  Loader2,
  Plus,
  PlusCircle,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { Sidebar } from './components/Sidebar';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { LoginPage } from './components/LoginPage';
import { SurveyForm } from './components/SurveyForm';
import { SurveyList, type TypeFilter } from './components/SurveyList';
import { NotificationBell } from './components/NotificationBell';
import { SurveyModal } from './components/SurveyModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AssignmentList } from './components/AssignmentList';
import { AssignSiteModal } from './components/AssignSiteModal';
import { EditAssignmentModal } from './components/EditAssignmentModal';
import { TechnicianManager } from './components/TechnicianManager';
import { TechnicianDetail } from './components/TechnicianDetail';
import { AddTechnicianModal } from './components/AddTechnicianModal';
import { EditTechnicianModal } from './components/EditTechnicianModal';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import {
  approveReport,
  cancelAssignment,
  createAssignment,
  createReport,
  createTechnician,
  deleteTechnician,
  fetchAssignments,
  fetchProfile,
  fetchReports,
  fetchTechnicians,
  rejectReport,
  saveSeenMap,
  signOut,
  updateAssignment,
  updateTechnician,
  type AssignmentDraft,
  type CreateTechnicianInput,
  type ReportDraft,
  type UpdateTechnicianInput,
} from './lib/api';
import type { JobType, Report, SeenMap, SiteAssignment, User } from './types';

/** How often the admin's report list is refreshed to pick up new submissions. */
const POLL_INTERVAL_MS = 60_000;

function formatDate(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

type TechnicianTab = 'sites' | 'new' | 'mine';
type AdminTab = 'overview' | 'sites' | 'technicians' | 'pending' | 'approved' | 'rejected' | 'all';

const ADMIN_PAGE_META: Record<AdminTab, { title: string; description: string }> = {
  overview: { title: 'Overview', description: "Today's workload at a glance." },
  sites: { title: 'Sites', description: 'Every site assigned to a technician.' },
  technicians: { title: 'Technicians', description: 'Field team, availability and history.' },
  pending: { title: 'Pending Reports', description: 'Reports waiting on your review.' },
  approved: { title: 'Approved Reports', description: 'Reports you have signed off.' },
  rejected: { title: 'Rejected Reports', description: 'Reports sent back for correction.' },
  all: { title: 'All Reports', description: 'Every report submitted from the field.' },
};

function ConfigNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-card">
        <h1 className="text-lg font-black text-slate-950">Supabase isn't configured yet</h1>
        <p className="mt-2 text-sm text-slate-600">
          Add <code className="rounded bg-slate-100 px-1.5 py-0.5">VITE_SUPABASE_URL</code> and{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5">VITE_SUPABASE_ANON_KEY</code> to a{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5">.env.local</code> file and restart the app.
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
  const [reports, setReports] = useState<Report[]>([]);
  const [assignments, setAssignments] = useState<SiteAssignment[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [technicianTab, setTechnicianTab] = useState<TechnicianTab>('sites');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [viewingTechnicianId, setViewingTechnicianId] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [prefillAssignment, setPrefillAssignment] = useState<SiteAssignment | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddTechnicianModal, setShowAddTechnicianModal] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<User | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<SiteAssignment | null>(null);
  const [actionError, setActionError] = useState('');
  const [seenMap, setSeenMap] = useState<SeenMap>({});
  const [reportTypeFilter, setReportTypeFilter] = useState<TypeFilter>('all');

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

  // Load reports/assignments/(technicians for admins) whenever a user signs in.
  useEffect(() => {
    if (!user) {
      setReports([]);
      setAssignments([]);
      setTechnicians([]);
      return;
    }

    let active = true;
    setDataLoading(true);
    setLoadError('');

    (async () => {
      try {
        const [reportsData, assignmentsData] = await Promise.all([fetchReports(), fetchAssignments()]);
        if (!active) return;
        setReports(reportsData);
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

  // Seed the "already reviewed" marks from the signed-in admin's profile.
  useEffect(() => {
    setSeenMap(user?.reportsSeenAt ?? {});
  }, [user?.id]);

  // Admins get fresh submissions without reloading. Skipped while the tab is
  // in the background so a parked window isn't polling all day.
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const timer = window.setInterval(async () => {
      if (document.hidden) return;
      try {
        setReports(await fetchReports());
      } catch {
        // A dropped poll is not worth surfacing — the next one will retry.
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [user?.id, user?.role]);

  const myReports = useMemo(
    () => (user ? reports.filter((report) => report.technicianId === user.id) : []),
    [reports, user]
  );

  const myAssignments = useMemo(
    () => (user ? assignments.filter((assignment) => assignment.technicianId === user.id) : []),
    [assignments, user]
  );

  const pendingReports = useMemo(() => reports.filter((r) => r.status === 'pending'), [reports]);
  const approvedReports = useMemo(() => reports.filter((r) => r.status === 'approved'), [reports]);
  const rejectedReports = useMemo(() => reports.filter((r) => r.status === 'rejected'), [reports]);
  const openAssignments = useMemo(() => assignments.filter((a) => a.status === 'assigned'), [assignments]);

  // A submission is "new" while it is still pending and was created after the
  // last time this admin caught up on that category.
  const newReports = useMemo(() => {
    if (!user || user.role !== 'admin') return [];
    return reports.filter((report) => {
      if (report.status !== 'pending') return false;
      const seenAt = seenMap[report.type];
      return !seenAt || new Date(report.createdAt).getTime() > new Date(seenAt).getTime();
    });
  }, [reports, seenMap, user]);

  const newReportIds = useMemo(() => new Set(newReports.map((r) => r.id)), [newReports]);

  const newByCategory = useMemo(() => {
    const counts: Record<JobType, number> = { survey: 0, installation: 0, maintenance: 0 };
    newReports.forEach((report) => {
      counts[report.type] += 1;
    });
    return counts;
  }, [newReports]);

  // Resolved from state rather than stored, so edits to a technician are
  // reflected immediately while their detail page is open.
  const viewingTechnician = useMemo(
    () => technicians.find((t) => t.id === viewingTechnicianId) ?? null,
    [technicians, viewingTechnicianId]
  );

  if (!isSupabaseConfigured) {
    return <ConfigNotice />;
  }

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-kibs-ink" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  async function handleLogout() {
    await signOut();
    setUser(null);
    setActiveReport(null);
    setPrefillAssignment(null);
    setViewingTechnicianId(null);
  }

  function goToAdminTab(tab: AdminTab) {
    setViewingTechnicianId(null);
    setAdminTab(tab);
    setReportTypeFilter('all');
  }

  // Persisting the seen marks is best-effort: the badge already updated
  // locally, and a failed write just means it reappears on the next login.
  async function markSeen(next: SeenMap) {
    if (!user) return;
    setSeenMap(next);
    try {
      await saveSeenMap(user.id, next);
    } catch {
      // ignored on purpose
    }
  }

  function handleSelectCategory(type: JobType) {
    goToAdminTab('all');
    setReportTypeFilter(type);
    void markSeen({ ...seenMap, [type]: new Date().toISOString() });
  }

  function handleMarkAllRead() {
    const now = new Date().toISOString();
    void markSeen({ survey: now, installation: now, maintenance: now });
  }

  async function handleCreateReport(draft: ReportDraft) {
    if (!user) return;
    const report = await createReport(draft, user);
    setReports((prev) => [report, ...prev]);
    if (draft.assignmentId) {
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === draft.assignmentId
            ? { ...assignment, status: 'completed' as const, reportId: report.id }
            : assignment
        )
      );
    }
    setTechnicianTab('mine');
  }

  function applyReview(reportId: string, patch: Partial<Report>) {
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, ...patch } : r)));
    setActiveReport((prev) => (prev && prev.id === reportId ? { ...prev, ...patch } : prev));
  }

  async function handleApprove(reportId: string) {
    if (!user) return;
    try {
      await approveReport(reportId, user);
      applyReview(reportId, {
        status: 'approved',
        reviewedBy: user.name,
        reviewedAt: new Date().toISOString(),
        rejectionReason: undefined,
      });
    } catch (err) {
      flashError(err instanceof Error ? err.message : 'Could not approve this report.');
    }
  }

  async function handleReject(reportId: string, reason: string) {
    if (!user) return;
    try {
      await rejectReport(reportId, user, reason);
      applyReview(reportId, {
        status: 'rejected',
        reviewedBy: user.name,
        reviewedAt: new Date().toISOString(),
        rejectionReason: reason,
      });
    } catch (err) {
      flashError(err instanceof Error ? err.message : 'Could not reject this report.');
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

  function handleStartReport(assignment: SiteAssignment) {
    setPrefillAssignment(assignment);
    setTechnicianTab('new');
  }

  function handleViewReport(reportId: string) {
    const report = reports.find((r) => r.id === reportId);
    if (report) setActiveReport(report);
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
      setViewingTechnicianId((prev) => (prev === technicianId ? null : prev));
    } catch (err) {
      flashError(err instanceof Error ? err.message : 'Could not remove this technician.');
    }
  }

  const adminVisibleReports =
    adminTab === 'pending'
      ? pendingReports
      : adminTab === 'approved'
        ? approvedReports
        : adminTab === 'rejected'
          ? rejectedReports
          : reports;

  const technicianNavItems = [
    { id: 'sites' as TechnicianTab, label: 'My Sites', icon: Building2 },
    { id: 'new' as TechnicianTab, label: 'New Report', icon: PlusCircle },
    { id: 'mine' as TechnicianTab, label: 'My Reports', icon: ClipboardList },
  ];

  // The 3 major destinations live in the always-visible bottom bar on mobile
  // and lead the desktop sidebar; the report status filters live in the
  // Header's drawer on mobile and form the sidebar's second group.
  const primaryAdminNavItems = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'sites' as AdminTab, label: 'Sites', icon: Building2, count: openAssignments.length },
    { id: 'technicians' as AdminTab, label: 'Technicians', icon: Users },
  ];
  const secondaryAdminNavItems = [
    { id: 'pending' as AdminTab, label: 'Pending', icon: Clock, count: pendingReports.length },
    { id: 'approved' as AdminTab, label: 'Approved', icon: CheckCircle2 },
    { id: 'rejected' as AdminTab, label: 'Rejected', icon: XCircle },
    { id: 'all' as AdminTab, label: 'All Reports', icon: LayoutList },
  ];

  const pageMeta = ADMIN_PAGE_META[adminTab];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 lg:pb-10">
      <Header
        user={user}
        onLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navGroups={
          user.role === 'admin'
            ? [
                { label: 'Workspace', items: primaryAdminNavItems },
                { label: 'Reports', items: secondaryAdminNavItems },
              ]
            : [{ label: 'Menu', items: technicianNavItems }]
        }
        activeNavId={user.role === 'admin' ? adminTab : technicianTab}
        onNavChange={
          user.role === 'admin'
            ? (id) => goToAdminTab(id as AdminTab)
            : (id) => setTechnicianTab(id as TechnicianTab)
        }
        notificationSlot={
          user.role === 'admin' ? (
            <NotificationBell
              newReports={newReports}
              onOpenReport={setActiveReport}
              onViewAll={() => goToAdminTab('pending')}
              onMarkAllRead={handleMarkAllRead}
              formatDate={formatDate}
            />
          ) : undefined
        }
      />

      {(actionError || loadError) && (
        <div className="mx-auto mt-3 max-w-6xl px-3 sm:px-6">
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-bold text-red-700">
            {actionError || loadError}
          </div>
        </div>
      )}

      {dataLoading && reports.length === 0 && assignments.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-kibs-ink" />
        </div>
      ) : user.role === 'technician' ? (
        <main className="mx-auto max-w-2xl px-3 py-4 sm:px-6 sm:py-6">
          <div className="mb-4 hidden gap-2 lg:flex">
            {technicianNavItems.map((item) => {
              const Icon = item.icon;
              const active = technicianTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTechnicianTab(item.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold shadow-card transition ${
                    active ? 'bg-kibs-ink text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
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
              onStartSurvey={handleStartReport}
              onViewSurvey={handleViewReport}
            />
          )}
          {technicianTab === 'new' && (
            <SurveyForm
              technician={user}
              assignment={prefillAssignment}
              onClearAssignment={() => setPrefillAssignment(null)}
              onSubmit={handleCreateReport}
            />
          )}
          {technicianTab === 'mine' && (
            <SurveyList
              surveys={myReports}
              onSelect={setActiveReport}
              emptyMessage="You haven't submitted any reports yet."
              formatDate={formatDate}
            />
          )}

          <MobileNav items={technicianNavItems} activeId={technicianTab} onChange={setTechnicianTab} />
        </main>
      ) : (
        <div className="mx-auto flex max-w-6xl gap-6 px-3 py-4 sm:px-6 lg:py-8">
          <Sidebar
            groups={[
              { label: 'Workspace', items: primaryAdminNavItems },
              { label: 'Reports', items: secondaryAdminNavItems },
            ]}
            activeId={adminTab}
            onChange={goToAdminTab}
            onAddSite={() => setShowAssignModal(true)}
            onAddTechnician={() => setShowAddTechnicianModal(true)}
          />

          <main className="min-w-0 flex-1">
            {!viewingTechnician && (
              <div className="mb-5 hidden items-end justify-between gap-4 lg:flex">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950">{pageMeta.title}</h1>
                  <p className="mt-0.5 text-sm text-slate-500">{pageMeta.description}</p>
                </div>
                {adminTab === 'sites' && (
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(true)}
                    className="flex shrink-0 items-center gap-2 rounded-xl bg-kibs-ink px-4 py-2.5 text-sm font-black text-white shadow-card transition hover:bg-black"
                  >
                    <Plus className="h-4 w-4" />
                    Add Site
                  </button>
                )}
                {adminTab === 'technicians' && (
                  <button
                    type="button"
                    onClick={() => setShowAddTechnicianModal(true)}
                    className="flex shrink-0 items-center gap-2 rounded-xl bg-kibs-ink px-4 py-2.5 text-sm font-black text-white shadow-card transition hover:bg-black"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Technician
                  </button>
                )}
              </div>
            )}

            {adminTab === 'overview' && (
              <AdminDashboard
                reports={reports}
                assignments={assignments}
                technicians={technicians}
                onSelectReport={setActiveReport}
                onViewAll={() => goToAdminTab('all')}
                onViewSites={() => goToAdminTab('pending')}
                onViewTechnicians={() => goToAdminTab('technicians')}
                onSelectTechnician={(technician) => {
                  setAdminTab('technicians');
                  setViewingTechnicianId(technician.id);
                }}
                newByCategory={newByCategory}
                onSelectCategory={handleSelectCategory}
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
                onViewSurvey={handleViewReport}
                onEdit={setEditingAssignment}
              />
            )}
            {adminTab === 'technicians' &&
              (viewingTechnician ? (
                <TechnicianDetail
                  technician={viewingTechnician}
                  reports={reports}
                  assignments={assignments}
                  onBack={() => setViewingTechnicianId(null)}
                  onEdit={setEditingTechnician}
                  onRemove={handleRemoveTechnician}
                  onSelectReport={setActiveReport}
                  onViewReport={handleViewReport}
                  formatDate={formatDate}
                />
              ) : (
                <TechnicianManager
                  technicians={technicians}
                  reports={reports}
                  assignments={assignments}
                  onSelect={(technician) => setViewingTechnicianId(technician.id)}
                  onEdit={setEditingTechnician}
                  onRemove={handleRemoveTechnician}
                />
              ))}
            {(adminTab === 'pending' ||
              adminTab === 'approved' ||
              adminTab === 'rejected' ||
              adminTab === 'all') && (
              <SurveyList
                surveys={adminVisibleReports}
                onSelect={setActiveReport}
                showTechnician
                showFilters
                typeFilter={reportTypeFilter}
                onTypeFilterChange={setReportTypeFilter}
                newReportIds={newReportIds}
                emptyMessage="No reports in this view yet."
                formatDate={formatDate}
              />
            )}
          </main>

          <MobileNav items={primaryAdminNavItems} activeId={adminTab} onChange={goToAdminTab} />
        </div>
      )}

      <SurveyModal
        survey={activeReport}
        onClose={() => setActiveReport(null)}
        onApprove={handleApprove}
        onReject={handleReject}
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
