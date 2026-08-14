import React, { FormEvent, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Activity,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileText,
  Filter,
  Handshake,
  Home,
  LayoutDashboard,
  ListChecks,
  Mail,
  MapPin,
  MapPinned,
  PackageCheck,
  Phone,
  Play,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Star,
  UploadCloud,
  UserRound,
  UsersRound,
  Wrench,
  Sparkles,
  PieChart,
  TrendingUp,
  Trophy,
  Target,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { JobModal } from './components/JobModal';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

import {
  clients,
  feedback as initialFeedback,
  installedEquipment,
  jobs,
  leads,
  notifications as initialNotifications,
  salesPeople,
  sites,
  surveys,
  technicians,
  tools,
} from './data/mockData';
import type {
  Feedback,
  Job,
  JobStatus,
  JobType,
  Lead,
  LeadStage,
  NotificationItem,
  Priority,
  Role,
  ServiceType,
} from './types';

type ManagerView =
  | 'dashboard'
  | 'clients'
  | 'sites'
  | 'jobs'
  | 'sales'
  | 'documents'
  | 'technicians'
  | 'reports'
  | 'notifications'
  | 'settings';

type TechnicianView = 'home' | 'my_jobs' | 'completed' | 'notifications' | 'profile';
type SalesView = 'dashboard' | 'leads' | 'team';
type PublicView = 'support' | 'feedback';
type Tone = 'neutral' | 'success' | 'warning' | 'urgent' | 'info';

const managerNav: Array<{ id: ManagerView; label: string; icon: LucideIcon }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clients', label: 'Clients', icon: UsersRound },
  { id: 'sites', label: 'Sites', icon: MapPinned },
  { id: 'jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { id: 'sales', label: 'Sales', icon: Handshake },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'technicians', label: 'Technicians', icon: UserRound },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const technicianNav: Array<{ id: TechnicianView; label: string; icon: LucideIcon }> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'my_jobs', label: 'My Jobs', icon: BriefcaseBusiness },
  { id: 'completed', label: 'Completed', icon: CheckCircle2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'Profile', icon: UserRound },
];

const salesNav: Array<{ id: SalesView; label: string; icon: LucideIcon }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: Handshake },
  { id: 'team', label: 'Team', icon: UsersRound },
];

const leadStageLabels: Record<LeadStage, string> = {
  new: 'New',
  contacted: 'Contacted',
  survey_booked: 'Survey Booked',
  quoted: 'Quoted',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

const leadStageOrder: LeadStage[] = [
  'new',
  'contacted',
  'survey_booked',
  'quoted',
  'negotiation',
  'won',
  'lost',
];

const serviceTypes: ServiceType[] = [
  'CCTV',
  'Flood Lights',
  'Access Control',
  'Alarm System',
  'Electric Fence',
  'Other',
];

const statusLabels: Record<JobStatus, string> = {
  draft: 'Draft',
  surveyed: 'Surveyed',
  reported: 'Reported',
  scheduled: 'Scheduled',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  testing: 'Testing',
  resolved: 'Resolved',
  completed: 'Completed',
  feedback: 'Client Feedback',
};

const jobTypeLabels: Record<JobType, string> = {
  installation: 'Installation',
  support: 'Support',
  maintenance: 'Maintenance',
};

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-kibs-deepGreen focus:ring-2 focus:ring-kibs-green/30';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-slate-500';

function App() {
  const [role, setRole] = useState<Role>('manager');
  const [managerView, setManagerView] = useState<ManagerView>('dashboard');
  const [technicianView, setTechnicianView] = useState<TechnicianView>('home');
  const [salesView, setSalesView] = useState<SalesView>('dashboard');
  const [publicView, setPublicView] = useState<PublicView>('support');
  
  const [jobsState, setJobsState] = useState<Job[]>(jobs);
  const [feedbackState, setFeedbackState] = useState<Feedback[]>(initialFeedback);
  const [notificationsState, setNotificationsState] =
    useState<NotificationItem[]>(initialNotifications);
  
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id ?? '');
  const [mobileJobModalOpen, setMobileJobModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [jobSearch, setJobSearch] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState<'all' | JobType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | JobStatus>('all');
  const [serviceFilter, setServiceFilter] = useState<'all' | ServiceType>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  
  const [supportReceipt, setSupportReceipt] = useState<Job | null>(null);
  const [feedbackReceipt, setFeedbackReceipt] = useState<Feedback | null>(null);
  
  const [supportForm, setSupportForm] = useState({
    clientId: clients[0].id,
    siteId: sites[0].id,
    serviceType: 'CCTV' as ServiceType,
    problem: '',
    priority: 'normal' as Priority,
    contactName: '',
    contactPhone: '',
    photoCount: 0,
  });
  
  const [feedbackForm, setFeedbackForm] = useState({
    jobId: jobs.find((job) => job.status === 'completed')?.id ?? jobs[0].id,
    resolved: 'yes',
    overallRating: 5,
    technicianRating: 5,
    comments: '',
  });

  const [workReport, setWorkReport] = useState({
    diagnosis: '',
    workPerformed: '',
    materials: '',
    notes: '',
    beforePhotoCount: 0,
    afterPhotoCount: 0,
  });

  const selectedJob = useMemo(
    () => jobsState.find((job) => job.id === selectedJobId) ?? jobsState[0],
    [jobsState, selectedJobId]
  );
  
  const activeTechnician = technicians[0];
  const technicianJobs = jobsState.filter((job) =>
    job.assignedTechnicianIds.includes(activeTechnician.id)
  );
  const openTechnicianJobs = technicianJobs.filter((job) => job.status !== 'completed');
  const completedTechnicianJobs = technicianJobs.filter((job) => job.status === 'completed');

  const unreadCount = useMemo(
    () => notificationsState.filter((item) => item.unread).length,
    [notificationsState]
  );

  const filteredJobs = useMemo(() => {
    const search = jobSearch.trim().toLowerCase();

    return jobsState.filter((job) => {
      const client = getClient(job.clientId);
      const site = getSite(job.siteId);
      const technicianNames = job.assignedTechnicianIds
        .map((id) => getTechnician(id)?.name ?? '')
        .join(' ');
      const haystack = [
        job.jobNumber,
        job.title,
        job.description,
        client?.name,
        client?.primaryPhone,
        site?.name,
        technicianNames,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        (!search || haystack.includes(search)) &&
        (jobTypeFilter === 'all' || job.jobType === jobTypeFilter) &&
        (statusFilter === 'all' || job.status === statusFilter) &&
        (serviceFilter === 'all' || job.serviceType === serviceFilter) &&
        (priorityFilter === 'all' || job.priority === priorityFilter)
      );
    });
  }, [jobSearch, jobTypeFilter, jobsState, priorityFilter, serviceFilter, statusFilter]);

  function updateJobStatus(jobId: string, status: JobStatus, actor: string) {
    setJobsState((current) =>
      current.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status,
              startedAt:
                status === 'in_progress' && !job.startedAt
                  ? new Date().toISOString()
                  : job.startedAt,
              completedAt:
                status === 'completed' && !job.completedAt
                  ? new Date().toISOString()
                  : job.completedAt,
              statusHistory: [
                ...job.statusHistory,
                { status, at: new Date().toISOString(), actor },
              ],
            }
          : job
      )
    );
  }

  function pushNotification(note: Omit<NotificationItem, 'id' | 'createdAt'>) {
    setNotificationsState((current) => [
      {
        ...note,
        id: `note-${Date.now()}`,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
  }

  function handleSimulateTicket() {
    const sampleClient = clients[Math.floor(Math.random() * clients.length)];
    const sampleSite = sites.find((s) => s.clientId === sampleClient.id) ?? sites[0];
    const services: ServiceType[] = ['CCTV', 'Electric Fence', 'Access Control', 'Alarm System'];
    const service = services[Math.floor(Math.random() * services.length)];
    
    const nextNumber = Math.floor(1000 + Math.random() * 9000);
    const newJob: Job = {
      id: `job-demo-${Date.now()}`,
      jobNumber: `DEMO-${nextNumber}`,
      jobType: 'support',
      serviceType: service,
      title: `Client Demo: ${service} Emergency Inspection`,
      description: 'Triggered via Client Presentation Demo shortcut. Site team requesting urgent verification.',
      clientId: sampleClient.id,
      siteId: sampleSite.id,
      priority: 'urgent',
      status: 'reported',
      assignedTechnicianIds: [technicians[0].id],
      requiredToolIds: tools.slice(0, 3).map((t) => t.id),
      materials: [{ id: 'm1', name: 'Inspection Kit', quantity: '1' }],
      attachments: [],
      feedbackToken: `fb_${Date.now()}`,
      supportToken: `sup_${Date.now()}`,
      statusHistory: [{ status: 'reported', at: new Date().toISOString(), actor: sampleClient.contactPerson }],
    };

    setJobsState((current) => [newJob, ...current]);
    setSelectedJobId(newJob.id);
    setRole('manager');
    setManagerView('jobs');
    pushNotification({
      audience: 'manager',
      title: '⚡ Demo Support Ticket Triggered',
      body: `${sampleClient.name} filed an urgent ${service} ticket (#${newJob.jobNumber}).`,
      unread: true,
      severity: 'urgent',
    });
  }

  function handleSimulateProgress() {
    const targetJob = jobsState.find((j) => j.status !== 'completed') ?? jobsState[0];
    if (!targetJob) return;

    const nextStatus: JobStatus = targetJob.status === 'reported' ? 'assigned' : targetJob.status === 'assigned' ? 'in_progress' : 'completed';
    updateJobStatus(targetJob.id, nextStatus, 'Demo Simulation');
    setSelectedJobId(targetJob.id);
    setRole('manager');
    setManagerView('jobs');

    pushNotification({
      audience: 'manager',
      title: `⚡ Job ${targetJob.jobNumber} Updated`,
      body: `Status updated to ${statusLabels[nextStatus]}.`,
      unread: true,
      severity: 'info',
    });
  }

  function handleResetDemo() {
    setJobsState(jobs);
    setFeedbackState(initialFeedback);
    setNotificationsState(initialNotifications);
    setSelectedJobId(jobs[0]?.id ?? '');
  }

  function startSelectedJob(job: Job) {
    updateJobStatus(job.id, 'in_progress', activeTechnician.name);
    pushNotification({
      audience: 'manager',
      title: 'Job started',
      body: `${activeTechnician.name} started ${job.serviceType} ${jobTypeLabels[job.jobType]} ${job.jobNumber}.`,
      unread: true,
      severity: 'info',
    });
  }

  function completeSelectedJob(job: Job) {
    const afterPhotoCount = Math.max(workReport.afterPhotoCount, 1);

    setJobsState((current) =>
      current.map((existing) =>
        existing.id === job.id
          ? {
              ...existing,
              status: 'completed',
              diagnosis: workReport.diagnosis || 'Diagnosis recorded by technician.',
              workPerformed: workReport.workPerformed || 'Work report captured on site.',
              materials: workReport.materials
                ? [
                    ...existing.materials,
                    {
                      id: `mat-${Date.now()}`,
                      name: workReport.materials,
                      quantity: 'Recorded',
                    },
                  ]
                : existing.materials,
              attachments: [
                ...existing.attachments,
                ...Array.from({ length: workReport.beforePhotoCount }, (_, index) => ({
                  id: `before-${Date.now()}-${index}`,
                  category: 'before_work' as const,
                  name: `Before photo ${index + 1}`,
                  sizeKb: 520,
                })),
                ...Array.from({ length: afterPhotoCount }, (_, index) => ({
                  id: `after-${Date.now()}-${index}`,
                  category: 'after_work' as const,
                  name: `After photo ${index + 1}`,
                  sizeKb: 480,
                })),
              ],
              completedAt: new Date().toISOString(),
              statusHistory: [
                ...existing.statusHistory,
                {
                  status: 'completed',
                  at: new Date().toISOString(),
                  actor: activeTechnician.name,
                },
              ],
            }
          : existing
      )
    );

    pushNotification({
      audience: 'manager',
      title: 'Job completed',
      body: `${activeTechnician.name} completed ${job.jobNumber} at ${getClient(job.clientId)?.name}.`,
      unread: true,
      severity: 'success',
    });

    setWorkReport({
      diagnosis: '',
      workPerformed: '',
      materials: '',
      notes: '',
      beforePhotoCount: 0,
      afterPhotoCount: 0,
    });
  }

  function handleSupportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextNumber =
      Math.max(
        52,
        ...jobsState
          .filter((job) => job.jobType === 'support')
          .map((job) => Number(job.jobNumber.replace(/\D/g, '')) || 0)
      ) + 1;
    const newJob: Job = {
      id: `job-${Date.now()}`,
      jobNumber: `S-${String(nextNumber).padStart(4, '0')}`,
      jobType: 'support',
      serviceType: supportForm.serviceType,
      title: `${supportForm.serviceType} support request`,
      description: supportForm.problem,
      clientId: supportForm.clientId,
      siteId: supportForm.siteId,
      priority: supportForm.priority,
      status: 'reported',
      assignedTechnicianIds: [],
      requiredToolIds: [],
      materials: [],
      attachments: Array.from({ length: supportForm.photoCount }, (_, index) => ({
        id: `problem-${Date.now()}-${index}`,
        category: 'problem' as const,
        name: `Problem photo ${index + 1}`,
        sizeKb: 540,
      })),
      feedbackToken: `fb_${Date.now()}`,
      supportToken: `sup_${supportForm.clientId}_${supportForm.siteId}`,
      statusHistory: [
        { status: 'reported', at: new Date().toISOString(), actor: supportForm.contactName },
      ],
    };

    setJobsState((current) => [newJob, ...current]);
    setSelectedJobId(newJob.id);
    setSupportReceipt(newJob);
    pushNotification({
      audience: 'manager',
      title: supportForm.priority === 'urgent' ? 'Urgent support request' : 'New support request',
      body: `${getClient(supportForm.clientId)?.name} reported a ${supportForm.serviceType} problem.`,
      unread: true,
      severity: supportForm.priority === 'urgent' ? 'urgent' : 'info',
    });
    setSupportForm((current) => ({ ...current, problem: '', contactName: '', contactPhone: '', photoCount: 0 }));
  }

  function handleFeedbackSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const job = jobsState.find((item) => item.id === feedbackForm.jobId) ?? jobsState[0];
    const technicianId = job.assignedTechnicianIds[0] ?? technicians[0].id;
    const newFeedback: Feedback = {
      id: `feedback-${Date.now()}`,
      jobId: job.id,
      technicianId,
      resolved: feedbackForm.resolved === 'yes',
      overallRating: feedbackForm.overallRating,
      technicianRating: feedbackForm.technicianRating,
      comments: feedbackForm.comments,
      createdAt: new Date().toISOString(),
    };

    setFeedbackState((current) => [newFeedback, ...current]);
    setFeedbackReceipt(newFeedback);
    updateJobStatus(job.id, 'feedback', 'Client feedback link');
    pushNotification({
      audience: 'manager',
      title: feedbackForm.resolved === 'yes' ? 'Feedback received' : 'Unresolved feedback',
      body: `${getClient(job.clientId)?.name} rated ${job.jobNumber} ${feedbackForm.overallRating}/5.`,
      unread: true,
      severity: feedbackForm.resolved === 'yes' ? 'success' : 'warning',
    });
    setFeedbackForm((current) => ({ ...current, comments: '' }));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-kibs-green/30">
      {/* Top Glassmorphic Navigation Header */}
      <Header
        role={role}
        setRole={setRole}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <PwaInstallPrompt />

      {/* Main Container */}
      <div className="mx-auto flex max-w-7xl gap-4 px-2.5 py-3 sm:gap-6 sm:px-6 sm:py-6">
        {/* Desktop Sidebar Navigation for Manager */}
        {role === 'manager' && (
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs space-y-1">
              <p className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Operations Menu
              </p>
              {managerNav.map((item) => {
                const Icon = item.icon;
                const active = managerView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setManagerView(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                      active
                        ? 'bg-kibs-green/15 text-kibs-deepGreen shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-kibs-deepGreen' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Desktop Sidebar Navigation for Field Technician */}
        {role === 'technician' && (
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs space-y-1">
              <p className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Technician App
              </p>
              {technicianNav.map((item) => {
                const Icon = item.icon;
                const active = technicianView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTechnicianView(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                      active
                        ? 'bg-kibs-green/15 text-kibs-deepGreen shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-kibs-deepGreen' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {role === 'sales' && (
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs space-y-1">
              <p className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Sales Portal
              </p>
              {salesNav.map((item) => {
                const Icon = item.icon;
                const active = salesView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSalesView(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                      active
                        ? 'bg-kibs-green/15 text-kibs-deepGreen shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-kibs-deepGreen' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 pb-20 lg:pb-6 animate-fade-in">
          {role === 'manager' &&
            renderManagerView({
              managerView,
              jobsState,
              filteredJobs,
              selectedJob,
              setSelectedJobId,
              onSelectMobileJob: () => setMobileJobModalOpen(true),
              jobSearch,
              setJobSearch,
              jobTypeFilter,
              setJobTypeFilter,
              statusFilter,
              setStatusFilter,
              serviceFilter,
              setServiceFilter,
              priorityFilter,
              setPriorityFilter,
              notificationsState,
              feedbackState,
              updateJobStatus,
            })}

          {role === 'technician' &&
            renderTechnicianView({
              technicianView,
              activeTechnician,
              openTechnicianJobs,
              completedTechnicianJobs,
              selectedJob,
              setSelectedJobId,
              workReport,
              setWorkReport,
              startSelectedJob,
              completeSelectedJob,
              notificationsState,
            })}

          {role === 'sales' &&
            renderSalesView({
              salesView,
            })}

          {role === 'public' &&
            renderPublicView({
              publicView,
              setPublicView,
              supportForm,
              setSupportForm,
              supportReceipt,
              handleSupportSubmit,
              feedbackForm,
              setFeedbackForm,
              feedbackReceipt,
              handleFeedbackSubmit,
              jobsState,
            })}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {role === 'manager' && (
        <MobileNav
          role={role}
          items={managerNav}
          activeId={managerView}
          onChange={(id) => setManagerView(id)}
        />
      )}
      {role === 'technician' && (
        <MobileNav
          role={role}
          items={technicianNav}
          activeId={technicianView}
          onChange={(id) => setTechnicianView(id)}
        />
      )}
      {role === 'sales' && (
        <MobileNav
          role={role}
          items={salesNav}
          activeId={salesView}
          onChange={(id) => setSalesView(id)}
        />
      )}

      {/* Mobile Slide-Over Job Inspector Modal */}
      {mobileJobModalOpen && (
        <JobModal
          job={selectedJob}
          onClose={() => setMobileJobModalOpen(false)}
          updateJobStatus={updateJobStatus}
          getClient={getClient}
          getSite={getSite}
          getTechnician={getTechnician}
          statusLabels={statusLabels}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
        />
      )}
    </div>
  );
}

function renderManagerView(args: {
  managerView: ManagerView;
  jobsState: Job[];
  filteredJobs: Job[];
  selectedJob?: Job;
  setSelectedJobId: (id: string) => void;
  onSelectMobileJob: () => void;
  jobSearch: string;
  setJobSearch: (value: string) => void;
  jobTypeFilter: 'all' | JobType;
  setJobTypeFilter: (value: 'all' | JobType) => void;
  statusFilter: 'all' | JobStatus;
  setStatusFilter: (value: 'all' | JobStatus) => void;
  serviceFilter: 'all' | ServiceType;
  setServiceFilter: (value: 'all' | ServiceType) => void;
  priorityFilter: 'all' | Priority;
  setPriorityFilter: (value: 'all' | Priority) => void;
  notificationsState: NotificationItem[];
  feedbackState: Feedback[];
  updateJobStatus: (jobId: string, status: JobStatus, actor: string) => void;
}) {
  const {
    managerView,
    jobsState,
    filteredJobs,
    selectedJob,
    setSelectedJobId,
    onSelectMobileJob,
    jobSearch,
    setJobSearch,
    jobTypeFilter,
    setJobTypeFilter,
    statusFilter,
    setStatusFilter,
    serviceFilter,
    setServiceFilter,
    priorityFilter,
    setPriorityFilter,
    notificationsState,
    feedbackState,
    updateJobStatus,
  } = args;

  if (managerView === 'dashboard') {
    const openInstallations = jobsState.filter(
      (job) => job.jobType === 'installation' && job.status !== 'completed'
    );
    const pendingSupport = jobsState.filter(
      (job) => job.jobType === 'support' && !['completed', 'feedback'].includes(job.status)
    );
    const inProgress = jobsState.filter((job) => job.status === 'in_progress');
    const completed = jobsState.filter((job) => job.status === 'completed');
    const totalInstallations = jobsState.filter((job) => job.jobType === 'installation').length;
    const totalSupport = jobsState.filter((job) => job.jobType === 'support').length;
    const totalMaintenance = jobsState.filter((job) => job.jobType === 'maintenance').length;
    const completionRate =
      jobsState.length > 0 ? Math.round((completed.length / jobsState.length) * 100) : 0;
    const urgentOpen = jobsState.filter(
      (job) => job.priority === 'urgent' && !['completed', 'feedback'].includes(job.status)
    ).length;
    const evidencePhotos = jobsState.reduce((total, job) => total + job.attachments.length, 0);
    const averageRating =
      feedbackState.length > 0
        ? feedbackState.reduce((total, item) => total + item.overallRating, 0) /
          feedbackState.length
        : 0;
    const needsAttention = jobsState.filter(
      (job) =>
        job.priority === 'urgent' ||
        job.assignedTechnicianIds.length === 0 ||
        job.status === 'reported'
    );
    const topInstallers = technicians
      .map((technician) => {
        const assignedJobs = jobsState.filter((job) =>
          job.assignedTechnicianIds.includes(technician.id)
        );
        const installationJobs = assignedJobs.filter((job) => job.jobType === 'installation');
        const completedAssigned = assignedJobs.filter((job) =>
          ['completed', 'feedback'].includes(job.status)
        );

        return {
          id: technician.id,
          name: technician.name,
          specialty: technician.specialty.join(', '),
          completedThisMonth: technician.completedThisMonth,
          installations: installationJobs.length,
          activeJobs: assignedJobs.filter((job) => job.status !== 'completed').length,
          completionRate:
            assignedJobs.length > 0
              ? Math.round((completedAssigned.length / assignedJobs.length) * 100)
              : 0,
          rating: technician.averageRating,
        };
      })
      .sort((a, b) => b.completedThisMonth - a.completedThisMonth);
    const serviceMix: Array<{ label: string; value: number; tone: Tone }> = serviceTypes
      .map((service) => ({
        label: service,
        value: jobsState.filter((job) => job.serviceType === service).length,
        tone: (service === 'CCTV'
          ? 'info'
          : service === 'Flood Lights'
            ? 'warning'
            : 'success') as Tone,
      }))
      .filter((item) => item.value > 0);
    const statusMix: Array<{ label: string; value: number; tone: Tone }> = ([
      'reported',
      'scheduled',
      'assigned',
      'in_progress',
      'completed',
    ] as JobStatus[])
      .map((status) => ({
        label: statusLabels[status],
        value: jobsState.filter((job) => job.status === status).length,
        tone: (status === 'completed'
          ? 'success'
          : status === 'in_progress'
            ? 'warning'
            : 'info') as Tone,
      }))
      .filter((item) => item.value > 0);
    const monthlyTrend = [
      { label: 'Apr', installations: 5, support: 7 },
      { label: 'May', installations: 7, support: 8 },
      { label: 'Jun', installations: 6, support: 11 },
      { label: 'Jul', installations: 8, support: 10 },
      { label: 'Aug', installations: Math.max(totalInstallations + 5, 6), support: Math.max(totalSupport + 7, 8) },
    ];

    return (
      <SectionShell
        title="Operations Dashboard"
        eyebrow="Real-time Field Operations"
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            icon={ShieldCheck}
            label="Total Installations"
            value={`${totalInstallations}`}
            detail={`${openInstallations.length} active pipeline`}
            tone="info"
          />
          <MetricCard
            icon={AlertTriangle}
            label="Total Support"
            value={`${totalSupport}`}
            detail={`${pendingSupport.length} still pending`}
            tone="urgent"
          />
          <MetricCard
            icon={Clock3}
            label="In Field Work"
            value={`${inProgress.length} Jobs`}
            detail="Technicians dispatched"
            tone="warning"
          />
          <MetricCard
            icon={CheckCircle2}
            label="Completion Rate"
            value={`${completionRate}%`}
            detail={`${completed.length} resolved jobs`}
            tone="success"
          />
          <MetricCard
            icon={Star}
            label="Satisfaction"
            value={`${averageRating.toFixed(1)} / 5`}
            detail={`${feedbackState.length} ratings recorded`}
            tone="neutral"
          />
          <MetricCard
            icon={PackageCheck}
            label="Installed Assets"
            value={`${installedEquipment.length}`}
            detail={`${totalMaintenance} maintenance plan`}
            tone="success"
          />
        </div>

        <div className="mt-4 grid gap-3 sm:gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <Panel title="Installations vs Support Trend" icon={TrendingUp}>
            <TrendChart data={monthlyTrend} />
          </Panel>

          <Panel title="Top Installers" icon={Trophy}>
            <TopInstallers installers={topInstallers} />
          </Panel>
        </div>

        <div className="mt-4 grid gap-3 sm:gap-4 lg:grid-cols-3">
          <Panel title="Service Mix" icon={PieChart}>
            <HorizontalBars data={serviceMix} />
          </Panel>

          <Panel title="Job Status Mix" icon={Activity}>
            <HorizontalBars data={statusMix} />
          </Panel>

          <Panel title="Operational Health" icon={Sparkles}>
            <div className="grid grid-cols-2 gap-2">
              <MiniStat label="Urgent Open" value={urgentOpen} />
              <MiniStat label="Sites Covered" value={sites.length} />
              <MiniStat label="Evidence Photos" value={evidencePhotos} />
              <MiniStat label="Avg Response" value="3.2h" />
            </div>
            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Client-ready insight
              </p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-emerald-950">
                Field activity is healthy: installers are assigned, photo evidence is flowing, and urgent support is visible to management.
              </p>
            </div>
          </Panel>
        </div>

        <div className="mt-4 grid gap-3 sm:gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel title="Action Required / Dispatch Queue" icon={AlertTriangle}>
            <div className="space-y-3">
              {needsAttention.map((job) => (
                <JobListItem
                  key={job.id}
                  job={job}
                  onSelect={() => {
                    setSelectedJobId(job.id);
                    onSelectMobileJob();
                  }}
                />
              ))}
            </div>
          </Panel>

          <Panel title="Recent Notifications & Alerts" icon={Bell}>
            <div className="space-y-3">
              {notificationsState.slice(0, 5).map((item) => (
                <NotificationRow key={item.id} item={item} />
              ))}
            </div>
          </Panel>
        </div>
      </SectionShell>
    );
  }

  if (managerView === 'clients') {
    return (
      <SectionShell
        title="Client Accounts"
        eyebrow="Commercial & Residential Profiles"
        action={<PrimaryButton icon={Plus}>+ Register Client</PrimaryButton>}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => {
            const clientSites = sites.filter((site) => site.clientId === client.id);
            const clientJobs = jobsState.filter((job) => job.clientId === client.id);

            return (
              <article
                key={client.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-950">{client.name}</h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{client.notes}</p>
                  </div>
                  <StatusPill tone="success">★ {client.averageRating.toFixed(1)}</StatusPill>
                </div>
                <div className="mt-4 space-y-2 text-xs text-slate-700">
                  <InfoLine icon={UserRound}>{client.contactPerson}</InfoLine>
                  <InfoLine icon={Phone}>{client.primaryPhone}</InfoLine>
                  <InfoLine icon={Mail}>{client.email}</InfoLine>
                  <InfoLine icon={MapPin}>{client.address}</InfoLine>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <MiniStat label="Sites" value={clientSites.length} />
                  <MiniStat label="Jobs" value={clientJobs.length} />
                  <MiniStat label="Open Tickets" value={client.activeSupportRequests} />
                </div>
              </article>
            );
          })}
        </div>
      </SectionShell>
    );
  }

  if (managerView === 'sites') {
    return (
      <SectionShell
        title="Managed Sites & Locations"
        eyebrow="Security Systems Network"
        action={<PrimaryButton icon={Plus}>+ Register Site</PrimaryButton>}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {sites.map((site) => {
            const equipment = installedEquipment.filter((item) => item.siteId === site.id);
            const siteJobs = jobsState.filter((job) => job.siteId === site.id);

            return (
              <article
                key={site.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-kibs-deepGreen">
                      {getClient(site.clientId)?.name}
                    </p>
                    <h3 className="text-lg font-extrabold text-slate-950">{site.name}</h3>
                    <p className="mt-1 text-xs text-slate-600">{site.notes}</p>
                  </div>
                  <StatusPill tone={siteJobs.some((job) => job.status !== 'completed') ? 'warning' : 'success'}>
                    {siteJobs.filter((job) => job.status !== 'completed').length} active jobs
                  </StatusPill>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 text-xs text-slate-700">
                  <InfoLine icon={MapPin}>{site.address}</InfoLine>
                  <InfoLine icon={Phone}>{site.contactPhone}</InfoLine>
                </div>

                <InstalledEquipmentList siteId={site.id} />
              </article>
            );
          })}
        </div>
      </SectionShell>
    );
  }

  if (managerView === 'jobs') {
    return (
      <SectionShell
        title="Field Jobs & Support Tickets"
        eyebrow="Live Operations"
        action={<PrimaryButton icon={Plus}>+ New Job Ticket</PrimaryButton>}
      >
        {/* Filters */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs by number, client, location, or technician..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-kibs-deepGreen focus:bg-white"
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <SelectFilter
              label="Type"
              value={jobTypeFilter}
              onChange={(v) => setJobTypeFilter(v as any)}
              options={['all', 'installation', 'support', 'maintenance']}
            />
            <SelectFilter
              label="Status"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as any)}
              options={['all', 'reported', 'assigned', 'in_progress', 'completed']}
            />
            <SelectFilter
              label="Service"
              value={serviceFilter}
              onChange={(v) => setServiceFilter(v as any)}
              options={['all', ...serviceTypes]}
            />
            <SelectFilter
              label="Priority"
              value={priorityFilter}
              onChange={(v) => setPriorityFilter(v as any)}
              options={['all', 'urgent', 'high', 'normal', 'low']}
            />
          </div>
        </div>

        {/* Desktop Split View / Mobile Cards */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <JobListItem
                  key={job.id}
                  job={job}
                  selected={selectedJob?.id === job.id}
                  onSelect={() => {
                    setSelectedJobId(job.id);
                    onSelectMobileJob();
                  }}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
                No jobs match the current filters.
              </div>
            )}
          </div>

          {/* Desktop Inspection Panel */}
          <div className="hidden lg:block">
            {selectedJob ? (
              <JobDetailPanel job={selectedJob} updateJobStatus={updateJobStatus} />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
                Select a job from the list to inspect details.
              </div>
            )}
          </div>
        </div>
      </SectionShell>
    );
  }

  if (managerView === 'sales') {
    return (
      <SalesWorkspace
        title="Sales Pipeline"
        eyebrow="Leads & Conversion"
        showTeam
      />
    );
  }

  if (managerView === 'documents') {
    return <DocumentGenerator />;
  }

  if (managerView === 'technicians') {
    return (
      <SectionShell
        title="Field Technicians & Teams"
        eyebrow="Roster & Workloads"
        action={<PrimaryButton icon={Plus}>+ Add Technician</PrimaryButton>}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {technicians.map((tech) => {
            const techJobs = jobsState.filter((j) => j.assignedTechnicianIds.includes(tech.id));
            const activeCount = techJobs.filter((j) => j.status !== 'completed').length;

            return (
              <article key={tech.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kibs-green/15 text-kibs-deepGreen font-black text-lg">
                    {tech.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-950">{tech.name}</h3>
                    <p className="text-xs text-slate-500">{tech.specialty.join(', ')}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 text-xs text-slate-700">
                  <InfoLine icon={Phone}>{tech.phone}</InfoLine>
                  <InfoLine icon={ShieldCheck}>{tech.specialty}</InfoLine>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                  <MiniStat label="Active Jobs" value={activeCount} />
                  <MiniStat label="Total Assigned" value={techJobs.length} />
                </div>
              </article>
            );
          })}
        </div>
      </SectionShell>
    );
  }

  if (managerView === 'reports') {
    return (
      <SectionShell title="Operations Reports" eyebrow="Analytics & Printables">
        {selectedJob ? (
          <PrintableJobReport job={selectedJob} />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            Select a completed job to view printable report.
          </div>
        )}
      </SectionShell>
    );
  }

  if (managerView === 'notifications') {
    return (
      <SectionShell title="System Audit & Notifications" eyebrow="Activity Trail">
        <div className="space-y-3">
          {notificationsState.map((item) => (
            <NotificationRow key={item.id} item={item} expanded />
          ))}
        </div>
      </SectionShell>
    );
  }

  if (managerView === 'settings') {
    return (
      <SectionShell title="Platform Settings" eyebrow="Configuration">
        <div className="max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-950">Company Identity</h3>
            <p className="text-xs text-slate-500">Kibs Systems Ltd — Uganda Security Engineering</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs text-slate-700">
            <p><strong>Version:</strong> 2.0.0</p>
            <p><strong>Backend Engine:</strong> PostgreSQL / Supabase Schema Ready</p>
            <p><strong>Mobile Support:</strong> Full Responsive Mobile PWA Enabled</p>
          </div>
        </div>
      </SectionShell>
    );
  }

  return null;
}

function renderSalesView({ salesView }: { salesView: SalesView }) {
  if (salesView === 'leads') {
    return <SalesWorkspace title="My Lead Pipeline" eyebrow="Sales Follow-Up" focus="leads" />;
  }

  if (salesView === 'team') {
    return <SalesWorkspace title="Sales Team" eyebrow="Targets & Performance" focus="team" showTeam />;
  }

  return <SalesWorkspace title="Sales Dashboard" eyebrow="Pipeline Overview" showTeam />;
}

function SalesWorkspace({
  title,
  eyebrow,
  focus = 'dashboard',
  showTeam = false,
}: {
  title: string;
  eyebrow: string;
  focus?: 'dashboard' | 'leads' | 'team';
  showTeam?: boolean;
}) {
  const openLeads = leads.filter((lead) => !['won', 'lost'].includes(lead.stage));
  const wonLeads = leads.filter((lead) => lead.stage === 'won');
  const pipelineValue = openLeads.reduce((total, lead) => total + lead.value, 0);
  const weightedValue = openLeads.reduce(
    (total, lead) => total + lead.value * (lead.probability / 100),
    0
  );
  const wonValue = wonLeads.reduce((total, lead) => total + lead.value, 0);
  const nextActions = openLeads
    .slice()
    .sort((a, b) => a.nextActionDate.localeCompare(b.nextActionDate))
    .slice(0, 4);
  const stageData = leadStageOrder
    .map((stage) => ({
      label: leadStageLabels[stage],
      value: leads.filter((lead) => lead.stage === stage).length,
      tone: stage === 'won' ? 'success' : stage === 'lost' ? 'neutral' : stage === 'negotiation' ? 'warning' : 'info',
    }))
    .filter((item) => item.value > 0) as Array<{ label: string; value: number; tone: Tone }>;

  return (
    <SectionShell
      title={title}
      eyebrow={eyebrow}
      action={<PrimaryButton icon={Plus}>+ New Lead</PrimaryButton>}
    >
      {focus !== 'leads' && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard
              icon={Handshake}
              label="Open Leads"
              value={`${openLeads.length}`}
              detail={`${leads.length} total records`}
              tone="info"
            />
            <MetricCard
              icon={Target}
              label="Pipeline Value"
              value={formatMoneyShort(pipelineValue)}
              detail={`${formatMoneyShort(weightedValue)} weighted`}
              tone="success"
            />
            <MetricCard
              icon={TrendingUp}
              label="Won Revenue"
              value={formatMoneyShort(wonValue)}
              detail={`${wonLeads.length} closed deals`}
              tone="success"
            />
            <MetricCard
              icon={Clock3}
              label="Due Actions"
              value={`${nextActions.length}`}
              detail="Follow-ups scheduled"
              tone="warning"
            />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Lead Maturity Stages" icon={PieChart}>
              <HorizontalBars data={stageData} />
            </Panel>
            <Panel title="Priority Follow-Ups" icon={CalendarDays}>
              <div className="grid gap-2 sm:grid-cols-2">
                {nextActions.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} compact />
                ))}
              </div>
            </Panel>
          </div>
        </>
      )}

      {focus !== 'team' && (
        <div className="mt-4">
          <Panel title="Pipeline Board" icon={Handshake}>
            <LeadPipelineBoard />
          </Panel>
        </div>
      )}

      {showTeam && (
        <div className="mt-4">
          <Panel title="Sales Personnel Dashboard" icon={UsersRound}>
            <SalesPeopleDashboard />
          </Panel>
        </div>
      )}
    </SectionShell>
  );
}

function LeadPipelineBoard() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {leadStageOrder.map((stage) => {
        const stageLeads = leads.filter((lead) => lead.stage === stage);

        if (stageLeads.length === 0) {
          return null;
        }

        return (
          <section key={stage} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                {leadStageLabels[stage]}
              </h3>
              <StatusPill tone={stage === 'won' ? 'success' : stage === 'lost' ? 'neutral' : 'info'}>
                {stageLeads.length}
              </StatusPill>
            </div>
            <div className="space-y-2">
              {stageLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} compact />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function LeadCard({ lead, compact = false }: { lead: Lead; compact?: boolean }) {
  const salesPerson = getSalesPerson(lead.assignedSalesId);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-kibs-deepGreen">
            {lead.leadNumber} • {lead.source}
          </p>
          <h4 className="mt-1 truncate text-sm font-extrabold text-slate-950">
            {lead.companyName}
          </h4>
          <p className="mt-0.5 truncate text-xs text-slate-500">{lead.contactPerson}</p>
        </div>
        <StatusPill tone={lead.stage === 'won' ? 'success' : lead.stage === 'lost' ? 'neutral' : 'warning'}>
          {lead.probability}%
        </StatusPill>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MiniStat label="Value" value={formatMoneyShort(lead.value)} />
        <MiniStat label="System" value={lead.serviceInterest} />
      </div>
      {!compact && (
        <p className="mt-3 text-xs leading-relaxed text-slate-600">{lead.notes}</p>
      )}
      <div className="mt-3 rounded-lg bg-slate-50 p-2 text-xs">
        <p className="font-bold text-slate-900">{lead.nextAction}</p>
        <p className="mt-0.5 text-slate-500">
          {formatDate(lead.nextActionDate)} • {salesPerson?.name}
        </p>
      </div>
    </article>
  );
}

function SalesPeopleDashboard() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {salesPeople.map((person) => {
        const personLeads = leads.filter((lead) => lead.assignedSalesId === person.id);
        const stageCounts = {
          new: personLeads.filter((lead) => ['new', 'contacted'].includes(lead.stage)).length,
          survey: personLeads.filter((lead) => lead.stage === 'survey_booked').length,
          quoted: personLeads.filter((lead) => ['quoted', 'negotiation'].includes(lead.stage)).length,
          complete: personLeads.filter((lead) => lead.stage === 'won').length,
        };
        const openValue = personLeads
          .filter((lead) => !['won', 'lost'].includes(lead.stage))
          .reduce((total, lead) => total + lead.value, 0);
        const wonValue = personLeads
          .filter((lead) => lead.stage === 'won')
          .reduce((total, lead) => total + lead.value, 0);
        const targetProgress = Math.min(100, Math.round((wonValue / person.monthlyTarget) * 100));

        return (
          <article key={person.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-kibs-green/15 text-sm font-black text-kibs-deepGreen sm:h-10 sm:w-10">
                {person.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-extrabold text-slate-950">{person.name}</h3>
                <p className="truncate text-xs text-slate-500">{person.territory}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="font-bold uppercase text-slate-500">Open</p>
                <p className="mt-0.5 font-black text-slate-950">{formatMoneyShort(openValue)}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2">
                <p className="font-bold uppercase text-emerald-700">Won</p>
                <p className="mt-0.5 font-black text-emerald-950">{formatMoneyShort(wonValue)}</p>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              <StageMiniCard label="New" value={stageCounts.new} tone="info" />
              <StageMiniCard label="Survey" value={stageCounts.survey} tone="warning" />
              <StageMiniCard label="Quoted" value={stageCounts.quoted} tone="urgent" />
              <StageMiniCard label="Won" value={stageCounts.complete} tone="success" />
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-kibs-deepGreen" style={{ width: `${Math.max(4, targetProgress)}%` }} />
            </div>
            <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Target progress {targetProgress}%
            </p>
          </article>
        );
      })}
    </div>
  );
}

function StageMiniCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: Tone;
}) {
  return (
    <div className={`rounded-lg px-1.5 py-2 text-center ${toneClass(tone, 'soft')}`}>
      <p className="text-base font-black leading-none">{value}</p>
      <p className="mt-1 truncate text-[9px] font-black uppercase tracking-tight">{label}</p>
    </div>
  );
}

function renderTechnicianView(args: {
  technicianView: TechnicianView;
  activeTechnician: any;
  openTechnicianJobs: Job[];
  completedTechnicianJobs: Job[];
  selectedJob?: Job;
  setSelectedJobId: (id: string) => void;
  workReport: any;
  setWorkReport: React.Dispatch<React.SetStateAction<any>>;
  startSelectedJob: (job: Job) => void;
  completeSelectedJob: (job: Job) => void;
  notificationsState: NotificationItem[];
}) {
  const {
    technicianView,
    activeTechnician,
    openTechnicianJobs,
    completedTechnicianJobs,
    selectedJob,
    setSelectedJobId,
    workReport,
    setWorkReport,
    startSelectedJob,
    completeSelectedJob,
    notificationsState,
  } = args;

  if (technicianView === 'home' || technicianView === 'my_jobs') {
    return (
      <SectionShell
        title={`Welcome, ${activeTechnician.name.split(' ')[0]}`}
        eyebrow="Technician Field Console"
      >
        <div className="grid gap-3 sm:grid-cols-2 mb-6">
          <MetricCard
            icon={BriefcaseBusiness}
            label="Assigned Open Jobs"
            value={`${openTechnicianJobs.length} Assigned`}
            detail="Require site visit / resolution"
            tone="urgent"
          />
          <MetricCard
            icon={CheckCircle2}
            label="Completed Today"
            value={`${completedTechnicianJobs.length} Completed`}
            detail="Reports generated"
            tone="success"
          />
        </div>

        <h3 className="text-lg font-extrabold text-slate-950 mb-3">Assigned Jobs</h3>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-3">
            {openTechnicianJobs.map((job) => (
              <JobListItem
                key={job.id}
                job={job}
                selected={selectedJob?.id === job.id}
                onSelect={() => setSelectedJobId(job.id)}
              />
            ))}
          </div>

          {selectedJob && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">{selectedJob.jobNumber}</span>
                <StatusPill tone={selectedJob.status === 'in_progress' ? 'warning' : 'info'}>
                  {statusLabels[selectedJob.status]}
                </StatusPill>
              </div>

              <h2 className="text-xl font-extrabold text-slate-950">{selectedJob.title}</h2>
              <p className="text-xs text-slate-600">{selectedJob.description}</p>

              {selectedJob.status !== 'in_progress' && selectedJob.status !== 'completed' && (
                <button
                  type="button"
                  onClick={() => startSelectedJob(selectedJob)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-kibs-deepGreen py-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                >
                  <Play className="h-4 w-4" /> Start Field Work
                </button>
              )}

              {selectedJob.status === 'in_progress' && (
                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                  <h3 className="text-xs font-extrabold uppercase text-slate-500">Capture Work Report</h3>
                  <TextField
                    label="Diagnosis / Root Cause"
                    value={workReport.diagnosis}
                    onChange={(val) => setWorkReport((prev: any) => ({ ...prev, diagnosis: val }))}
                  />
                  <TextareaField
                    label="Work Performed"
                    value={workReport.workPerformed}
                    onChange={(val) => setWorkReport((prev: any) => ({ ...prev, workPerformed: val }))}
                  />
                  <TextField
                    label="Materials Used"
                    value={workReport.materials}
                    onChange={(val) => setWorkReport((prev: any) => ({ ...prev, materials: val }))}
                  />
                  <PhotoPicker
                    label="Attach Before / After Photos"
                    count={workReport.afterPhotoCount}
                    onChange={(cnt) => setWorkReport((prev: any) => ({ ...prev, afterPhotoCount: cnt }))}
                  />
                  <button
                    type="button"
                    onClick={() => completeSelectedJob(selectedJob)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Complete & Submit Job Report
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </SectionShell>
    );
  }

  if (technicianView === 'completed') {
    return (
      <SectionShell title="Completed Work History" eyebrow="Field Logs">
        <div className="space-y-3">
          {completedTechnicianJobs.map((job) => (
            <JobListItem key={job.id} job={job} onSelect={() => setSelectedJobId(job.id)} />
          ))}
        </div>
      </SectionShell>
    );
  }

  return null;
}

function renderPublicView(args: {
  publicView: PublicView;
  setPublicView: (view: PublicView) => void;
  supportForm: any;
  setSupportForm: React.Dispatch<React.SetStateAction<any>>;
  supportReceipt: Job | null;
  handleSupportSubmit: (e: FormEvent<HTMLFormElement>) => void;
  feedbackForm: any;
  setFeedbackForm: React.Dispatch<React.SetStateAction<any>>;
  feedbackReceipt: Feedback | null;
  handleFeedbackSubmit: (e: FormEvent<HTMLFormElement>) => void;
  jobsState: Job[];
}) {
  const {
    publicView,
    setPublicView,
    supportForm,
    setSupportForm,
    supportReceipt,
    handleSupportSubmit,
    feedbackForm,
    setFeedbackForm,
    feedbackReceipt,
    handleFeedbackSubmit,
    jobsState,
  } = args;

  return (
    <SectionShell title="Client Support & Portal" eyebrow="Self-Service Portal">
      <div className="mb-6 flex gap-2 rounded-xl border border-slate-200 bg-white p-1 max-w-xs">
        <button
          type="button"
          onClick={() => setPublicView('support')}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
            publicView === 'support'
              ? 'bg-kibs-green/15 text-kibs-deepGreen shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Report Issue
        </button>
        <button
          type="button"
          onClick={() => setPublicView('feedback')}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
            publicView === 'feedback'
              ? 'bg-kibs-green/15 text-kibs-deepGreen shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Submit Feedback
        </button>
      </div>

      {publicView === 'support' && (
        <div className="max-w-2xl">
          {supportReceipt ? (
            <ReceiptPanel
              icon={CheckCircle2}
              title={`Support Ticket ${supportReceipt.jobNumber} Received`}
              body="Our operations manager has been notified and a technician will be dispatched."
            />
          ) : (
            <form onSubmit={handleSupportSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6">
              <h3 className="text-base font-extrabold text-slate-950">Report a Security System Issue</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Client Name"
                  value={supportForm.clientId}
                  onChange={(v) => setSupportForm((prev: any) => ({ ...prev, clientId: v }))}
                  options={clients.map((c) => c.id)}
                  format={(id) => getClient(id)?.name ?? id}
                />
                <SelectField
                  label="System Type"
                  value={supportForm.serviceType}
                  onChange={(v) => setSupportForm((prev: any) => ({ ...prev, serviceType: v as any }))}
                  options={serviceTypes}
                />
              </div>
              <TextareaField
                label="Problem Description"
                value={supportForm.problem}
                onChange={(v) => setSupportForm((prev: any) => ({ ...prev, problem: v }))}
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Contact Name"
                  value={supportForm.contactName}
                  onChange={(v) => setSupportForm((prev: any) => ({ ...prev, contactName: v }))}
                  required
                />
                <TextField
                  label="Contact Phone"
                  value={supportForm.contactPhone}
                  onChange={(v) => setSupportForm((prev: any) => ({ ...prev, contactPhone: v }))}
                  required
                />
              </div>
              <PrimaryButton icon={Send} fullWidth>
                Submit Support Request
              </PrimaryButton>
            </form>
          )}
        </div>
      )}

      {publicView === 'feedback' && (
        <div className="max-w-2xl">
          {feedbackReceipt ? (
            <ReceiptPanel
              icon={Star}
              title="Thank You for Your Feedback!"
              body="Your rating has been recorded to improve our service quality."
            />
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6">
              <h3 className="text-base font-extrabold text-slate-950">Rate Recent Installation or Service</h3>
              <RatingField
                label="Overall Satisfaction"
                value={feedbackForm.overallRating}
                onChange={(v) => setFeedbackForm((prev: any) => ({ ...prev, overallRating: v }))}
              />
              <TextareaField
                label="Comments / Improvements"
                value={feedbackForm.comments}
                onChange={(v) => setFeedbackForm((prev: any) => ({ ...prev, comments: v }))}
              />
              <PrimaryButton icon={Send} fullWidth>
                Submit Feedback
              </PrimaryButton>
            </form>
          )}
        </div>
      )}
    </SectionShell>
  );
}

{/* Helper UI Components */}

function SectionShell({
  title,
  eyebrow,
  action,
  children,
}: {
  title: string;
  eyebrow: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 sm:space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-kibs-deepGreen">{eyebrow}</p>
          <h1 className="text-xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs sm:space-y-4 sm:p-5">
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2.5 sm:pb-3">
        <span className="rounded-lg bg-kibs-green/15 p-2 text-kibs-deepGreen">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-extrabold text-slate-950 sm:text-base">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tone: Tone;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs transition hover:border-slate-300 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <span className={`rounded-xl p-2 ${toneClass(tone, 'soft')} sm:p-2.5`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
      </div>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:mt-3 sm:text-xs">{label}</p>
      <p className="mt-0.5 text-lg font-black tracking-tight text-slate-950 sm:text-xl">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
    </article>
  );
}

function TrendChart({
  data,
}: {
  data: Array<{ label: string; installations: number; support: number }>;
}) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((item) => [item.installations, item.support])
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3 text-xs font-bold text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-kibs-deepGreen" />
          Installations
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-kibs-red" />
          Support
        </span>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-[360px] items-end gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 sm:min-w-[420px] sm:gap-4 sm:px-4 sm:py-4">
          {data.map((item) => (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-24 items-end gap-1.5 sm:h-32">
                <div
                  className="w-4 rounded-t-md bg-kibs-deepGreen shadow-sm sm:w-5"
                  style={{
                    height: `${Math.max(10, (item.installations / maxValue) * 88)}px`,
                  }}
                  title={`${item.installations} installations`}
                />
                <div
                  className="w-4 rounded-t-md bg-kibs-red shadow-sm sm:w-5"
                  style={{ height: `${Math.max(10, (item.support / maxValue) * 88)}px` }}
                  title={`${item.support} support jobs`}
                />
              </div>
              <span className="text-xs font-extrabold text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HorizontalBars({
  data,
}: {
  data: Array<{ label: string; value: number; tone?: Tone }>;
}) {
  const maxValue = Math.max(1, ...data.map((item) => item.value));

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs">
            <span className="font-bold text-slate-700">{item.label}</span>
            <span className="font-extrabold text-slate-950">{item.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${barColorClass(item.tone ?? 'info')}`}
              style={{ width: `${Math.max(8, (item.value / maxValue) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TopInstallers({
  installers,
}: {
  installers: Array<{
    id: string;
    name: string;
    specialty: string;
    completedThisMonth: number;
    installations: number;
    activeJobs: number;
    completionRate: number;
    rating: number;
  }>;
}) {
  const maxCompleted = Math.max(1, ...installers.map((item) => item.completedThisMonth));

  return (
    <div className="space-y-3">
      {installers.map((installer, index) => (
        <article
          key={installer.id}
          className="rounded-xl border border-slate-100 bg-slate-50 p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kibs-green/15 text-xs font-black text-kibs-deepGreen">
                  {index + 1}
                </span>
                <h3 className="truncate text-sm font-extrabold text-slate-950">
                  {installer.name}
                </h3>
              </div>
              <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                {installer.specialty}
              </p>
            </div>
            <StatusPill tone="success">{installer.rating.toFixed(1)}</StatusPill>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-kibs-deepGreen"
              style={{ width: `${Math.max(10, (installer.completedThisMonth / maxCompleted) * 100)}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <MiniStat label="Done" value={installer.completedThisMonth} />
            <MiniStat label="Installs" value={installer.installations} />
            <MiniStat label="Active" value={installer.activeJobs} />
          </div>
        </article>
      ))}
    </div>
  );
}

function JobListItem({
  job,
  selected,
  onSelect,
}: {
  job: Job;
  selected?: boolean;
  onSelect: () => void;
}) {
  const client = getClient(job.clientId);
  const site = getSite(job.siteId);

  return (
    <button
      className={`w-full rounded-2xl border p-3 text-left shadow-xs transition sm:p-4 ${
        selected
          ? 'border-kibs-deepGreen bg-emerald-50/30 ring-2 ring-kibs-green/20'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
      onClick={onSelect}
      type="button"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <StatusPill tone={job.priority === 'urgent' ? 'urgent' : 'info'}>{job.priority}</StatusPill>
            <span className="text-xs font-bold text-slate-400">{job.jobNumber}</span>
          </div>
          <h3 className="mt-1 text-sm font-extrabold text-slate-950 leading-snug">{job.title}</h3>
          <p className="mt-0.5 text-xs text-slate-600">
            {client?.name} — {site?.name}
          </p>
        </div>
        <StatusPill tone={job.status === 'completed' ? 'success' : 'warning'}>
          {statusLabels[job.status]}
        </StatusPill>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500 border-t border-slate-100 pt-2">
        <span>{jobTypeLabels[job.jobType]}</span>
        <span>•</span>
        <span>{job.serviceType}</span>
      </div>
    </button>
  );
}

function JobDetailPanel({
  job,
  updateJobStatus,
}: {
  job: Job;
  updateJobStatus: (jobId: string, status: JobStatus, actor: string) => void;
}) {
  return (
    <Panel title="Job Details & Audit" icon={FileText}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill tone="neutral">{job.jobNumber}</StatusPill>
        <StatusPill tone={job.priority === 'urgent' ? 'urgent' : 'info'}>{job.priority}</StatusPill>
        <StatusPill tone={job.status === 'completed' ? 'success' : 'warning'}>
          {statusLabels[job.status]}
        </StatusPill>
      </div>

      <div className="mt-3">
        <h2 className="text-xl font-extrabold text-slate-950">{job.title}</h2>
        <p className="mt-1 text-xs text-slate-600 leading-relaxed">{job.description}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
          <p className={labelClass}>Client & Location</p>
          <h3 className="mt-1 text-sm font-bold text-slate-950">{getClient(job.clientId)?.name}</h3>
          <InfoLine icon={MapPin}>{getSite(job.siteId)?.address}</InfoLine>
          <InfoLine icon={Phone}>{getSite(job.siteId)?.contactPhone}</InfoLine>
        </div>
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
          <p className={labelClass}>Technician Assignment</p>
          <div className="mt-1 space-y-1">
            {job.assignedTechnicianIds.length > 0 ? (
              job.assignedTechnicianIds.map((id) => (
                <InfoLine key={id} icon={UserRound}>
                  {getTechnician(id)?.name}
                </InfoLine>
              ))
            ) : (
              <p className="text-xs font-bold text-red-600">Unassigned</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ToolList toolIds={job.requiredToolIds} />
        <EvidenceList title="Site Images" icon={Camera} job={job} />
      </div>

      <InstalledEquipmentList siteId={job.siteId} />

      <div className="mt-4 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
        <p className={labelClass}>Audit Timeline</p>
        <div className="mt-2 space-y-2 text-xs">
          {job.statusHistory.map((item, index) => (
            <div key={`${item.status}-${index}`} className="flex justify-between items-center text-slate-700">
              <span className="font-bold text-slate-900">{statusLabels[item.status]}</span>
              <span className="text-slate-500">{formatDateTime(item.at)} by {item.actor}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {(['assigned', 'in_progress', 'completed'] as JobStatus[]).map((status) => (
          <button
            key={status}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 transition hover:border-kibs-deepGreen hover:text-kibs-deepGreen shadow-xs"
            onClick={() => updateJobStatus(job.id, status, 'Manager')}
            type="button"
          >
            <ListChecks className="h-3.5 w-3.5" />
            {statusLabels[status]}
          </button>
        ))}
      </div>
    </Panel>
  );
}

function ToolList({ toolIds }: { toolIds: string[] }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
      <div className="flex items-center gap-2">
        <Wrench className="h-4 w-4 text-kibs-deepGreen" />
        <p className={labelClass}>Required Tools</p>
      </div>
      <div className="mt-2 space-y-1">
        {toolIds.length > 0 ? (
          toolIds.map((id) => (
            <div key={id} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-kibs-deepGreen" />
              {tools.find((tool) => tool.id === id)?.name}
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500">Standard field kit</p>
        )}
      </div>
    </div>
  );
}

function EvidenceList({ title, icon: Icon, job, category }: { title: string; icon: LucideIcon; job: Job; category?: string }) {
  const attachments = category ? job.attachments.filter((i) => i.category === category) : job.attachments;

  return (
    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-kibs-deepGreen" />
        <p className={labelClass}>{title}</p>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {attachments.length > 0 ? (
          attachments.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-2 text-xs">
              <Camera className="h-4 w-4 text-slate-400" />
              <p className="mt-1 font-bold text-slate-900 truncate">{item.name}</p>
              <p className="text-[10px] text-slate-400">{item.sizeKb} KB</p>
            </div>
          ))
        ) : (
          <p className="col-span-2 text-xs text-slate-500">No photos attached</p>
        )}
      </div>
    </div>
  );
}

function InstalledEquipmentList({ siteId }: { siteId: string }) {
  const equipment = installedEquipment.filter((item) => item.siteId === siteId);
  if (equipment.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
      <div className="flex items-center gap-2">
        <PackageCheck className="h-4 w-4 text-kibs-deepGreen" />
        <p className={labelClass}>Installed System Assets</p>
      </div>
      <div className="mt-2 divide-y divide-slate-200 text-xs">
        {equipment.map((item) => (
          <div key={item.id} className="flex justify-between py-1.5">
            <span className="font-semibold text-slate-800">{item.equipment}</span>
            <span className="text-slate-500">{item.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrintableJobReport({ job }: { job: Job }) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-kibs-deepGreen">
            Official Field Report
          </p>
          <h2 className="text-2xl font-black text-slate-950">{job.jobNumber}</h2>
        </div>
        <StatusPill tone="success">{statusLabels[job.status]}</StatusPill>
      </div>
      <div className="grid gap-2 sm:grid-cols-3 text-xs">
        <ReportLine label="Company" value="Kibs Systems Ltd" />
        <ReportLine label="Client" value={getClient(job.clientId)?.name ?? ''} />
        <ReportLine label="Site" value={getSite(job.siteId)?.name ?? ''} />
        <ReportLine label="Job Type" value={jobTypeLabels[job.jobType]} />
        <ReportLine label="System" value={job.serviceType} />
        <ReportLine label="Technician" value={job.assignedTechnicianIds.map((id) => getTechnician(id)?.name).join(', ')} />
      </div>
    </section>
  );
}

function DocumentGenerator() {
  const [documentType, setDocumentType] = useState<'quotation' | 'receipt'>('quotation');
  const [clientName, setClientName] = useState('Pearl Heights Residences');
  const [contactPerson, setContactPerson] = useState('Esther K.');
  const [service, setService] = useState<ServiceType>('CCTV');
  const [description, setDescription] = useState(
    'Supply and installation of CCTV cameras, NVR setup, cabling, testing, and remote viewing configuration.'
  );
  const [amount, setAmount] = useState('18500000');
  const [deposit, setDeposit] = useState('6500000');
  const [validUntil, setValidUntil] = useState('2026-08-28');
  const [paymentMethod, setPaymentMethod] = useState('Bank transfer');
  const parsedAmount = Number(amount) || 0;
  const parsedDeposit = Number(deposit) || 0;
  const vat = Math.round(parsedAmount * 0.18);
  const quotationTotal = parsedAmount + vat;
  const receiptBalance = Math.max(0, quotationTotal - parsedDeposit);
  const docNumber =
    documentType === 'quotation'
      ? `QT-${new Date().getFullYear()}-0114`
      : `RC-${new Date().getFullYear()}-0068`;

  return (
    <SectionShell title="Branded Documents" eyebrow="Quotations & Receipts">
      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Panel title="Document Details" icon={FileText}>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 text-xs font-black">
            {(['quotation', 'receipt'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setDocumentType(type)}
                className={`rounded-lg px-3 py-2 capitalize ${
                  documentType === type
                    ? 'bg-white text-kibs-deepGreen shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Client / Company" value={clientName} onChange={setClientName} />
            <TextField label="Contact Person" value={contactPerson} onChange={setContactPerson} />
            <SelectField
              label="Service"
              value={service}
              onChange={(value) => setService(value as ServiceType)}
              options={serviceTypes}
            />
            <TextField label="Valid Until" value={validUntil} onChange={setValidUntil} />
          </div>

          <TextareaField label="Scope / Description" value={description} onChange={setDescription} />

          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Subtotal UGX" value={amount} onChange={setAmount} />
            <TextField
              label={documentType === 'quotation' ? 'Required Deposit UGX' : 'Amount Paid UGX'}
              value={deposit}
              onChange={setDeposit}
            />
            <TextField label="Payment Method" value={paymentMethod} onChange={setPaymentMethod} />
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-kibs-deepGreen px-4 py-2.5 text-xs font-black text-white shadow-xs transition hover:bg-emerald-700"
          >
            <FileText className="h-4 w-4" />
            Print / Save as PDF
          </button>
        </Panel>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-950 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 border-b-4 border-kibs-green pb-4 sm:flex-row sm:items-start sm:justify-between">
              <img
                src="/kibs-logo-desktop.png"
                alt="Kibs Systems Ltd"
                className="h-14 w-auto max-w-full object-contain sm:h-16"
              />
              <div className="text-left sm:text-right">
                <p className="text-xs font-black uppercase tracking-wider text-kibs-deepGreen">
                  {documentType === 'quotation' ? 'Official Quotation' : 'Official Receipt'}
                </p>
                <h2 className="text-2xl font-black text-slate-950">{docNumber}</h2>
                <p className="text-xs font-semibold text-slate-500">Date: {formatDate(new Date().toISOString())}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className={labelClass}>Bill To</p>
                <h3 className="mt-1 text-base font-black text-slate-950">{clientName}</h3>
                <p className="text-xs font-semibold text-slate-600">{contactPerson}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className={labelClass}>Company</p>
                <h3 className="mt-1 text-base font-black text-slate-950">Kibs Systems Ltd</h3>
                <p className="text-xs font-semibold text-slate-600">
                  Integrating Technology to your security needs
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
              <div className="grid grid-cols-[1fr_0.32fr] bg-slate-900 px-3 py-2 text-xs font-black uppercase text-white">
                <span>Description</span>
                <span className="text-right">Amount</span>
              </div>
              <div className="grid grid-cols-[1fr_0.32fr] gap-3 px-3 py-4 text-sm">
                <div>
                  <p className="font-black text-slate-950">{service} Security System</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{description}</p>
                </div>
                <p className="text-right font-black text-slate-950">{formatMoney(parsedAmount)}</p>
              </div>
              <DocumentTotalLine label="VAT 18%" value={formatMoney(vat)} />
              <DocumentTotalLine label="Total" value={formatMoney(quotationTotal)} strong />
              <DocumentTotalLine
                label={documentType === 'quotation' ? 'Required Deposit' : 'Amount Paid'}
                value={formatMoney(parsedDeposit)}
              />
              <DocumentTotalLine
                label={documentType === 'quotation' ? 'Balance After Deposit' : 'Balance Due'}
                value={formatMoney(receiptBalance)}
                strong
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className={labelClass}>{documentType === 'quotation' ? 'Terms' : 'Payment'}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {documentType === 'quotation'
                    ? `Quotation valid until ${formatDate(validUntil)}. Installation starts after deposit confirmation.`
                    : `Payment received by ${paymentMethod}. Thank you for choosing Kibs Systems Ltd.`}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className={labelClass}>Prepared By</p>
                <p className="mt-1 text-sm font-black text-slate-950">Admin / Sales Manager</p>
                <p className="text-xs text-slate-500">Kibs Systems Ltd</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SectionShell>
  );
}

function DocumentTotalLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[1fr_0.32fr] border-t border-slate-200 px-3 py-2 text-xs ${
        strong ? 'bg-emerald-50 font-black text-slate-950' : 'font-bold text-slate-600'
      }`}
    >
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function NotificationRow({ item, expanded = false }: { item: NotificationItem; expanded?: boolean }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-start gap-3">
        <span className={`rounded-xl p-2.5 ${toneClass(item.severity, 'soft')}`}>
          <Bell className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-extrabold text-slate-950">{item.title}</h3>
            {item.unread && <StatusPill tone="urgent">Unread</StatusPill>}
          </div>
          <p className="mt-0.5 text-xs text-slate-600">{item.body}</p>
          {expanded && (
            <p className="mt-1.5 text-[10px] font-bold text-slate-400 uppercase">
              {formatDateTime(item.createdAt)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function PrimaryButton({ icon: Icon, children, fullWidth = false }: { icon: LucideIcon; children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-kibs-deepGreen px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 ${
        fullWidth ? 'w-full' : ''
      }`}
      type="submit"
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function StatusPill({ children, tone }: { children: React.ReactNode; tone: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize ${toneClass(tone, 'pill')}`}>
      {children}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
      <p className="text-[10px] font-extrabold uppercase text-slate-400">{label}</p>
      <p className="mt-0.5 text-base font-black text-slate-950">{value}</p>
    </div>
  );
}

function ReportLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}

function InfoLine({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-xs text-slate-600">
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <span>{children}</span>
    </p>
  );
}

function SelectFilter({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none transition focus:border-kibs-deepGreen"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {label}: {titleCase(opt)}
        </option>
      ))}
    </select>
  );
}

function TextField({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input
        className={`${inputClass} mt-1`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}

function TextareaField({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <textarea
        className={`${inputClass} mt-1 min-h-24 resize-y`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options, format = titleCase }: { label: string; value: string; onChange: (value: string) => void; options: string[]; format?: (value: string) => string }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <select
        className={`${inputClass} mt-1`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {format(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function PhotoPicker({ label, count, onChange }: { label: string; count: number; onChange: (count: number) => void }) {
  return (
    <label className="block rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        <UploadCloud className="h-4 w-4 text-kibs-deepGreen" />
        {label}
      </span>
      <input
        className="mt-2 block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-kibs-green/15 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-kibs-deepGreen"
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => onChange(event.target.files?.length ?? 0)}
      />
      <p className="mt-1.5 text-xs font-semibold text-slate-500">{count} photos selected</p>
    </label>
  );
}

function RatingField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <div className="mt-2 flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xs font-black transition ${
              rating <= value
                ? 'border-amber-400 bg-amber-50 text-amber-600 shadow-xs'
                : 'border-slate-200 bg-white text-slate-400'
            }`}
            onClick={() => onChange(rating)}
            type="button"
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ReceiptPanel({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6">
      <span className="inline-flex rounded-xl bg-kibs-green/15 p-3 text-kibs-deepGreen">
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-2xl font-black text-slate-950">{title}</h2>
      <p className="mt-2 text-xs text-slate-600 leading-relaxed">{body}</p>
      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <MiniStat label="Status" value="Captured" />
        <MiniStat label="Alert" value="Dispatched" />
        <MiniStat label="Data" value="Saved" />
      </div>
    </section>
  );
}

function getClient(id: string) {
  return clients.find((client) => client.id === id);
}

function getSite(id: string) {
  return sites.find((site) => site.id === id);
}

function getTechnician(id: string) {
  return technicians.find((technician) => technician.id === id);
}

function getSalesPerson(id: string) {
  return salesPeople.find((person) => person.id === id);
}

function formatMoneyShort(value: number) {
  if (value >= 1000000) {
    return `UGX ${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`;
  }

  return `UGX ${Math.round(value / 1000)}K`;
}

function formatMoney(value: number) {
  return `UGX ${new Intl.NumberFormat('en-UG').format(Math.round(value))}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-UG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-UG', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function titleCase(value: string) {
  if (value === 'all') return 'All';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toneClass(tone: Tone, variant: 'soft' | 'pill') {
  const classes: Record<Tone, Record<'soft' | 'pill', string>> = {
    neutral: { soft: 'bg-slate-100 text-slate-600', pill: 'bg-slate-100 text-slate-700' },
    success: { soft: 'bg-emerald-100 text-emerald-700', pill: 'bg-emerald-100 text-emerald-700' },
    warning: { soft: 'bg-amber-100 text-amber-700', pill: 'bg-amber-100 text-amber-700' },
    urgent: { soft: 'bg-red-100 text-red-700', pill: 'bg-red-100 text-red-700' },
    info: { soft: 'bg-sky-100 text-sky-700', pill: 'bg-sky-100 text-sky-700' },
  };

  return classes[tone][variant];
}

function barColorClass(tone: Tone) {
  const classes: Record<Tone, string> = {
    neutral: 'bg-slate-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    urgent: 'bg-kibs-red',
    info: 'bg-sky-500',
  };

  return classes[tone];
}

export default App;
