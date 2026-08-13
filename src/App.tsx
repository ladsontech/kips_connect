import React, { FormEvent, useMemo, useState } from 'react';
import {
  AlertTriangle,
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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  clients,
  feedback as initialFeedback,
  installedEquipment,
  jobs,
  notifications as initialNotifications,
  sites,
  surveys,
  technicians,
  tools,
} from './data/mockData';
import { isSupabaseConfigured } from './lib/supabase';
import type {
  Feedback,
  Job,
  JobStatus,
  JobType,
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
  | 'technicians'
  | 'reports'
  | 'notifications'
  | 'settings';

type TechnicianView = 'home' | 'my_jobs' | 'completed' | 'notifications' | 'profile';
type PublicView = 'support' | 'feedback';
type Tone = 'neutral' | 'success' | 'warning' | 'urgent' | 'info';

const managerNav: Array<{ id: ManagerView; label: string; icon: LucideIcon }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clients', label: 'Clients', icon: UsersRound },
  { id: 'sites', label: 'Sites', icon: MapPinned },
  { id: 'jobs', label: 'Jobs', icon: BriefcaseBusiness },
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
  'w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-kibs-deepGreen focus:ring-2 focus:ring-kibs-green/30';
const labelClass = 'text-xs font-semibold uppercase tracking-wide text-slate-500';

function App() {
  const [role, setRole] = useState<Role>('manager');
  const [managerView, setManagerView] = useState<ManagerView>('dashboard');
  const [technicianView, setTechnicianView] = useState<TechnicianView>('home');
  const [publicView, setPublicView] = useState<PublicView>('support');
  const [jobsState, setJobsState] = useState<Job[]>(jobs);
  const [feedbackState, setFeedbackState] = useState<Feedback[]>(initialFeedback);
  const [notificationsState, setNotificationsState] =
    useState<NotificationItem[]>(initialNotifications);
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id ?? '');
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
    <div className="min-h-screen bg-kibs-panel text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <div className="flex items-center gap-3">
            <img
              src="/kibs-logo.png"
              alt="Kibs Systems Ltd"
              className="h-12 w-40 rounded-md object-contain sm:w-56"
            />
            <div className="hidden border-l border-slate-200 pl-3 sm:block">
              <p className="text-sm font-semibold text-slate-900">Kibs Connect</p>
              <p className="text-xs text-slate-500">Security field service operations</p>
            </div>
          </div>

          <div className="grid grid-cols-3 rounded-md border border-slate-200 bg-slate-100 p-1 text-sm font-semibold">
            {(['manager', 'technician', 'public'] as Role[]).map((item) => (
              <button
                key={item}
                className={`rounded px-3 py-2 capitalize transition ${
                  role === item
                    ? 'bg-white text-kibs-deepGreen shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setRole(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-5 px-4 py-5 lg:px-6">
        {role === 'manager' && (
          <SideNav
            items={managerNav}
            activeId={managerView}
            onChange={(id) => setManagerView(id)}
          />
        )}

        {role === 'technician' && (
          <SideNav
            items={technicianNav}
            activeId={technicianView}
            onChange={(id) => setTechnicianView(id)}
          />
        )}

        <main className="min-w-0 flex-1 pb-24 lg:pb-0">
          {role === 'manager' &&
            renderManagerView({
              managerView,
              jobsState,
              filteredJobs,
              selectedJob,
              setSelectedJobId,
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
    </div>
  );
}

function renderManagerView(args: {
  managerView: ManagerView;
  jobsState: Job[];
  filteredJobs: Job[];
  selectedJob?: Job;
  setSelectedJobId: (id: string) => void;
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

    return (
      <SectionShell
        title="Operations Dashboard"
        eyebrow="Today"
        action={<StatusPill tone={isSupabaseConfigured ? 'success' : 'warning'}>{isSupabaseConfigured ? 'Supabase connected' : 'Demo mode'}</StatusPill>}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            icon={ShieldCheck}
            label="Installations"
            value={`${openInstallations.length} Upcoming`}
            detail={`${openInstallations.filter((job) => job.status === 'in_progress').length} in progress`}
            tone="info"
          />
          <MetricCard
            icon={AlertTriangle}
            label="Support"
            value={`${pendingSupport.length} Pending`}
            detail={`${pendingSupport.filter((job) => job.priority === 'urgent').length} urgent`}
            tone="urgent"
          />
          <MetricCard
            icon={Clock3}
            label="In Progress"
            value={`${inProgress.length} Jobs`}
            detail="Live field work"
            tone="warning"
          />
          <MetricCard
            icon={CheckCircle2}
            label="Completed"
            value={`${completed.length} This Month`}
            detail="Ready for feedback"
            tone="success"
          />
          <MetricCard
            icon={Star}
            label="Satisfaction"
            value={`${averageRating.toFixed(1)} / 5`}
            detail={`${feedbackState.length} feedback records`}
            tone="neutral"
          />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel title="Needs Attention" icon={AlertTriangle}>
            <div className="space-y-3">
              {needsAttention.map((job) => (
                <JobListItem
                  key={job.id}
                  job={job}
                  onSelect={() => setSelectedJobId(job.id)}
                />
              ))}
            </div>
          </Panel>

          <Panel title="Recent Activity" icon={Bell}>
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
      <SectionShell title="Clients" eyebrow="Profiles" action={<PrimaryButton icon={Plus}>New Client</PrimaryButton>}>
        <div className="grid gap-4 lg:grid-cols-3">
          {clients.map((client) => {
            const clientSites = sites.filter((site) => site.clientId === client.id);
            const clientJobs = jobsState.filter((job) => job.clientId === client.id);

            return (
              <article key={client.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">{client.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{client.notes}</p>
                  </div>
                  <StatusPill tone="success">{client.averageRating.toFixed(1)}</StatusPill>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <InfoLine icon={UserRound}>{client.contactPerson}</InfoLine>
                  <InfoLine icon={Phone}>{client.primaryPhone}</InfoLine>
                  <InfoLine icon={Mail}>{client.email}</InfoLine>
                  <InfoLine icon={MapPin}>{client.address}</InfoLine>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <MiniStat label="Sites" value={clientSites.length} />
                  <MiniStat label="Jobs" value={clientJobs.length} />
                  <MiniStat label="Active" value={client.activeSupportRequests} />
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
      <SectionShell title="Sites" eyebrow="Locations" action={<PrimaryButton icon={Plus}>New Site</PrimaryButton>}>
        <div className="grid gap-4 lg:grid-cols-2">
          {sites.map((site) => {
            const equipment = installedEquipment.filter((item) => item.siteId === site.id);
            const siteJobs = jobsState.filter((job) => job.siteId === site.id);
            const survey = surveys.find((item) => item.siteId === site.id);

            return (
              <article key={site.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-kibs-deepGreen">
                      {getClient(site.clientId)?.name}
                    </p>
                    <h3 className="text-xl font-bold text-slate-950">{site.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{site.notes}</p>
                  </div>
                  <StatusPill tone={siteJobs.some((job) => job.status !== 'completed') ? 'warning' : 'success'}>
                    {siteJobs.filter((job) => job.status !== 'completed').length} active
                  </StatusPill>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 text-sm text-slate-700">
                    <InfoLine icon={MapPin}>{site.address}</InfoLine>
                    <InfoLine icon={Phone}>{site.contactPhone}</InfoLine>
                    <InfoLine icon={UserRound}>{site.contactPerson}</InfoLine>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3">
                    <p className={labelClass}>Installed Systems</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[...new Set(equipment.map((item) => item.system))].map((system) => (
                        <StatusPill key={system} tone="info">
                          {system}
                        </StatusPill>
                      ))}
                    </div>
                    {survey && (
                      <p className="mt-3 text-sm text-slate-600">
                        Survey: {survey.proposedSystem} on {formatDate(survey.surveyDate)}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </SectionShell>
    );
  }

  if (managerView === 'jobs') {
    return (
      <SectionShell title="Jobs" eyebrow="Work Queue" action={<PrimaryButton icon={Plus}>New Job</PrimaryButton>}>
        <Panel title="Search and Filters" icon={Filter}>
          <div className="grid gap-3 md:grid-cols-[1.4fr_repeat(4,1fr)]">
            <label className="block">
              <span className={labelClass}>Search</span>
              <div className="relative mt-1">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  className={`${inputClass} pl-9`}
                  value={jobSearch}
                  onChange={(event) => setJobSearch(event.target.value)}
                  placeholder="Client, phone, site, job number"
                />
              </div>
            </label>
            <SelectField
              label="Type"
              value={jobTypeFilter}
              onChange={(value) => setJobTypeFilter(value as 'all' | JobType)}
              options={['all', 'installation', 'support', 'maintenance']}
            />
            <SelectField
              label="Status"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as 'all' | JobStatus)}
              options={['all', 'reported', 'scheduled', 'assigned', 'in_progress', 'completed']}
              format={(value) => (value === 'all' ? 'All' : statusLabels[value as JobStatus])}
            />
            <SelectField
              label="Service"
              value={serviceFilter}
              onChange={(value) => setServiceFilter(value as 'all' | ServiceType)}
              options={['all', ...serviceTypes]}
            />
            <SelectField
              label="Priority"
              value={priorityFilter}
              onChange={(value) => setPriorityFilter(value as 'all' | Priority)}
              options={['all', 'normal', 'urgent']}
            />
          </div>
        </Panel>

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <JobListItem
                key={job.id}
                job={job}
                selected={selectedJob?.id === job.id}
                onSelect={() => setSelectedJobId(job.id)}
              />
            ))}
          </div>

          {selectedJob && (
            <JobDetailPanel job={selectedJob} updateJobStatus={updateJobStatus} />
          )}
        </div>
      </SectionShell>
    );
  }

  if (managerView === 'technicians') {
    return (
      <SectionShell title="Technicians" eyebrow="Field Team" action={<PrimaryButton icon={Plus}>Add Technician</PrimaryButton>}>
        <div className="grid gap-4 lg:grid-cols-3">
          {technicians.map((technician) => (
            <article key={technician.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">{technician.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{technician.phone}</p>
                </div>
                <StatusPill tone="success">{technician.averageRating.toFixed(1)}</StatusPill>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {technician.specialty.map((item) => (
                  <StatusPill key={item} tone="info">
                    {item}
                  </StatusPill>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm">
                <MiniStat label="Active" value={technician.activeJobs} />
                <MiniStat label="Completed" value={technician.completedThisMonth} />
              </div>
            </article>
          ))}
        </div>
      </SectionShell>
    );
  }

  if (managerView === 'reports') {
    const completedJobs = jobsState.filter((job) => job.status === 'completed');
    const byType = (type: JobType) => jobsState.filter((job) => job.jobType === type).length;

    return (
      <SectionShell title="Reports" eyebrow="MVP Summaries">
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Job Summary" icon={BarChart3}>
            <div className="space-y-2">
              <ReportLine label="Total jobs" value={jobsState.length} />
              <ReportLine label="Installations" value={byType('installation')} />
              <ReportLine label="Support requests" value={byType('support')} />
              <ReportLine label="Maintenance" value={byType('maintenance')} />
              <ReportLine label="Completed" value={completedJobs.length} />
            </div>
          </Panel>
          <Panel title="Technician Summary" icon={UserRound}>
            <div className="space-y-2">
              {technicians.map((technician) => (
                <ReportLine
                  key={technician.id}
                  label={technician.name}
                  value={`${technician.completedThisMonth} done`}
                />
              ))}
            </div>
          </Panel>
          <Panel title="Client Summary" icon={UsersRound}>
            <div className="space-y-2">
              {clients.map((client) => (
                <ReportLine
                  key={client.id}
                  label={client.name}
                  value={`${client.averageRating.toFixed(1)}/5`}
                />
              ))}
            </div>
          </Panel>
        </div>

        {completedJobs[0] && <PrintableJobReport job={completedJobs[0]} />}
      </SectionShell>
    );
  }

  if (managerView === 'notifications') {
    return (
      <SectionShell title="Notifications" eyebrow="In-App History">
        <div className="space-y-3">
          {notificationsState.map((item) => (
            <NotificationRow key={item.id} item={item} expanded />
          ))}
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title="Settings" eyebrow="System">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Configuration" icon={Settings}>
          <div className="space-y-3 text-sm text-slate-700">
            <ReportLine label="Supabase" value={isSupabaseConfigured ? 'Configured' : 'Environment pending'} />
            <ReportLine label="Storage provider" value="Supabase Storage" />
            <ReportLine label="Image target" value="300-800 KB" />
            <ReportLine label="Push provider" value="Firebase Cloud Messaging" />
            <ReportLine label="Public link security" value="Tokenized links" />
          </div>
        </Panel>
        <Panel title="Public Links" icon={Send}>
          <div className="space-y-3 text-sm">
            {sites.map((site) => (
              <div key={site.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold text-slate-900">
                  {getClient(site.clientId)?.name} - {site.name}
                </p>
                <p className="mt-1 break-all text-slate-600">/support/{site.clientId}/{site.id}/secure-token</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </SectionShell>
  );
}

function renderTechnicianView(args: {
  technicianView: TechnicianView;
  activeTechnician: (typeof technicians)[number];
  openTechnicianJobs: Job[];
  completedTechnicianJobs: Job[];
  selectedJob?: Job;
  setSelectedJobId: (id: string) => void;
  workReport: {
    diagnosis: string;
    workPerformed: string;
    materials: string;
    notes: string;
    beforePhotoCount: number;
    afterPhotoCount: number;
  };
  setWorkReport: React.Dispatch<
    React.SetStateAction<{
      diagnosis: string;
      workPerformed: string;
      materials: string;
      notes: string;
      beforePhotoCount: number;
      afterPhotoCount: number;
    }>
  >;
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

  if (technicianView === 'notifications') {
    return (
      <SectionShell title="Notifications" eyebrow={activeTechnician.name}>
        <div className="space-y-3">
          {notificationsState
            .filter((item) => item.audience === 'technician')
            .map((item) => (
              <NotificationRow key={item.id} item={item} expanded />
            ))}
        </div>
      </SectionShell>
    );
  }

  if (technicianView === 'completed') {
    return (
      <SectionShell title="Completed Jobs" eyebrow={activeTechnician.name}>
        <div className="space-y-3">
          {completedTechnicianJobs.map((job) => (
            <JobListItem key={job.id} job={job} onSelect={() => setSelectedJobId(job.id)} />
          ))}
        </div>
      </SectionShell>
    );
  }

  if (technicianView === 'profile') {
    return (
      <SectionShell title="Profile" eyebrow={activeTechnician.name}>
        <Panel title="Technician Details" icon={UserRound}>
          <div className="grid gap-4 sm:grid-cols-2">
            <MiniStat label="Active Jobs" value={activeTechnician.activeJobs} />
            <MiniStat label="Completed This Month" value={activeTechnician.completedThisMonth} />
            <MiniStat label="Average Rating" value={activeTechnician.averageRating.toFixed(1)} />
            <MiniStat label="Phone" value={activeTechnician.phone} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {activeTechnician.specialty.map((item) => (
              <StatusPill key={item} tone="info">
                {item}
              </StatusPill>
            ))}
          </div>
        </Panel>
      </SectionShell>
    );
  }

  const activeJob =
    selectedJob && selectedJob.assignedTechnicianIds.includes(activeTechnician.id)
      ? selectedJob
      : openTechnicianJobs[0] ?? completedTechnicianJobs[0];

  return (
    <SectionShell
      title={technicianView === 'home' ? 'Technician Home' : 'My Jobs'}
      eyebrow={activeTechnician.name}
    >
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-3">
          {openTechnicianJobs.map((job) => (
            <JobListItem
              key={job.id}
              job={job}
              selected={activeJob?.id === job.id}
              onSelect={() => setSelectedJobId(job.id)}
            />
          ))}
        </div>

        {activeJob && (
          <Panel title={`${activeJob.serviceType} ${jobTypeLabels[activeJob.jobType]}`} icon={BriefcaseBusiness}>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={activeJob.priority === 'urgent' ? 'urgent' : 'info'}>
                {activeJob.priority}
              </StatusPill>
              <StatusPill tone="neutral">{activeJob.jobNumber}</StatusPill>
              <StatusPill tone={activeJob.status === 'completed' ? 'success' : 'warning'}>
                {statusLabels[activeJob.status]}
              </StatusPill>
            </div>

            <div className="mt-4 space-y-3">
              <h3 className="text-2xl font-bold text-slate-950">{getClient(activeJob.clientId)?.name}</h3>
              <InfoLine icon={MapPin}>{getSite(activeJob.siteId)?.name}</InfoLine>
              <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">{activeJob.description}</p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <EvidenceList title="Client Photos" icon={Camera} job={activeJob} category="problem" />
              <ToolList toolIds={activeJob.requiredToolIds} />
            </div>

            <InstalledEquipmentList siteId={activeJob.siteId} />

            {activeJob.status !== 'completed' && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-kibs-deepGreen px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
                  onClick={() => startSelectedJob(activeJob)}
                  type="button"
                >
                  <Play className="h-5 w-5" />
                  Start Job
                </button>
                <button
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-kibs-red px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
                  onClick={() => completeSelectedJob(activeJob)}
                  type="button"
                >
                  <ClipboardCheck className="h-5 w-5" />
                  Mark Completed
                </button>
              </div>
            )}

            {activeJob.status !== 'completed' && (
              <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
                <h4 className="text-base font-bold text-slate-950">Work Report</h4>
                <div className="mt-3 grid gap-3">
                  <TextareaField
                    label="Diagnosis"
                    value={workReport.diagnosis}
                    onChange={(value) => setWorkReport((current) => ({ ...current, diagnosis: value }))}
                  />
                  <TextareaField
                    label="Work Performed"
                    value={workReport.workPerformed}
                    onChange={(value) => setWorkReport((current) => ({ ...current, workPerformed: value }))}
                  />
                  <TextareaField
                    label="Materials or Parts Used"
                    value={workReport.materials}
                    onChange={(value) => setWorkReport((current) => ({ ...current, materials: value }))}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <PhotoPicker
                      label="Before Photos"
                      count={workReport.beforePhotoCount}
                      onChange={(count) => setWorkReport((current) => ({ ...current, beforePhotoCount: count }))}
                    />
                    <PhotoPicker
                      label="After Photos"
                      count={workReport.afterPhotoCount}
                      onChange={(count) => setWorkReport((current) => ({ ...current, afterPhotoCount: count }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </Panel>
        )}
      </div>
    </SectionShell>
  );
}

function renderPublicView(args: {
  publicView: PublicView;
  setPublicView: (view: PublicView) => void;
  supportForm: {
    clientId: string;
    siteId: string;
    serviceType: ServiceType;
    problem: string;
    priority: Priority;
    contactName: string;
    contactPhone: string;
    photoCount: number;
  };
  setSupportForm: React.Dispatch<
    React.SetStateAction<{
      clientId: string;
      siteId: string;
      serviceType: ServiceType;
      problem: string;
      priority: Priority;
      contactName: string;
      contactPhone: string;
      photoCount: number;
    }>
  >;
  supportReceipt: Job | null;
  handleSupportSubmit: (event: FormEvent<HTMLFormElement>) => void;
  feedbackForm: {
    jobId: string;
    resolved: string;
    overallRating: number;
    technicianRating: number;
    comments: string;
  };
  setFeedbackForm: React.Dispatch<
    React.SetStateAction<{
      jobId: string;
      resolved: string;
      overallRating: number;
      technicianRating: number;
      comments: string;
    }>
  >;
  feedbackReceipt: Feedback | null;
  handleFeedbackSubmit: (event: FormEvent<HTMLFormElement>) => void;
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
  const matchingSites = sites.filter((site) => site.clientId === supportForm.clientId);
  const completedJobs = jobsState.filter((job) => ['completed', 'feedback'].includes(job.status));

  return (
    <SectionShell title="Client Links" eyebrow="Public Forms">
      <div className="mb-5 grid max-w-md grid-cols-2 rounded-md border border-slate-200 bg-white p-1 text-sm font-semibold">
        {(['support', 'feedback'] as PublicView[]).map((view) => (
          <button
            key={view}
            className={`rounded px-3 py-2 capitalize ${
              publicView === view ? 'bg-kibs-deepGreen text-white' : 'text-slate-600'
            }`}
            onClick={() => setPublicView(view)}
            type="button"
          >
            {view}
          </button>
        ))}
      </div>

      {publicView === 'support' ? (
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <Panel title="Report a Problem" icon={Send}>
            <form className="space-y-4" onSubmit={handleSupportSubmit}>
              <SelectField
                label="Client"
                value={supportForm.clientId}
                onChange={(value) => {
                  const firstSite = sites.find((site) => site.clientId === value);
                  setSupportForm((current) => ({
                    ...current,
                    clientId: value,
                    siteId: firstSite?.id ?? current.siteId,
                  }));
                }}
                options={clients.map((client) => client.id)}
                format={(value) => getClient(value)?.name ?? value}
              />
              <SelectField
                label="Site"
                value={supportForm.siteId}
                onChange={(value) => setSupportForm((current) => ({ ...current, siteId: value }))}
                options={matchingSites.map((site) => site.id)}
                format={(value) => getSite(value)?.name ?? value}
              />
              <SelectField
                label="System"
                value={supportForm.serviceType}
                onChange={(value) => setSupportForm((current) => ({ ...current, serviceType: value as ServiceType }))}
                options={serviceTypes}
              />
              <TextareaField
                label="Problem"
                value={supportForm.problem}
                onChange={(value) => setSupportForm((current) => ({ ...current, problem: value }))}
                required
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField
                  label="Urgency"
                  value={supportForm.priority}
                  onChange={(value) => setSupportForm((current) => ({ ...current, priority: value as Priority }))}
                  options={['normal', 'urgent']}
                />
                <PhotoPicker
                  label="Photos"
                  count={supportForm.photoCount}
                  onChange={(count) => setSupportForm((current) => ({ ...current, photoCount: count }))}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Contact Name"
                  value={supportForm.contactName}
                  onChange={(value) => setSupportForm((current) => ({ ...current, contactName: value }))}
                  required
                />
                <TextField
                  label="Contact Phone"
                  value={supportForm.contactPhone}
                  onChange={(value) => setSupportForm((current) => ({ ...current, contactPhone: value }))}
                  required
                />
              </div>
              <PrimaryButton icon={Send} fullWidth>
                Submit Support Request
              </PrimaryButton>
            </form>
          </Panel>

          <ReceiptPanel
            icon={BriefcaseBusiness}
            title={supportReceipt ? `Support ${supportReceipt.jobNumber}` : 'Support Queue'}
            body={
              supportReceipt
                ? `${getClient(supportReceipt.clientId)?.name} - ${supportReceipt.serviceType} - ${statusLabels[supportReceipt.status]}`
                : 'New public submissions create unassigned support jobs and management notifications.'
            }
          />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <Panel title="How Was Our Service?" icon={Star}>
            <form className="space-y-4" onSubmit={handleFeedbackSubmit}>
              <SelectField
                label="Job"
                value={feedbackForm.jobId}
                onChange={(value) => setFeedbackForm((current) => ({ ...current, jobId: value }))}
                options={completedJobs.map((job) => job.id)}
                format={(value) => {
                  const job = jobsState.find((item) => item.id === value);
                  return job ? `${job.jobNumber} - ${getClient(job.clientId)?.name}` : value;
                }}
              />
              <SelectField
                label="Resolved"
                value={feedbackForm.resolved}
                onChange={(value) => setFeedbackForm((current) => ({ ...current, resolved: value }))}
                options={['yes', 'no']}
              />
              <RatingField
                label="Overall Service"
                value={feedbackForm.overallRating}
                onChange={(value) => setFeedbackForm((current) => ({ ...current, overallRating: value }))}
              />
              <RatingField
                label="Technician Service"
                value={feedbackForm.technicianRating}
                onChange={(value) => setFeedbackForm((current) => ({ ...current, technicianRating: value }))}
              />
              <TextareaField
                label="Comments"
                value={feedbackForm.comments}
                onChange={(value) => setFeedbackForm((current) => ({ ...current, comments: value }))}
              />
              <PrimaryButton icon={Send} fullWidth>
                Submit Feedback
              </PrimaryButton>
            </form>
          </Panel>

          <ReceiptPanel
            icon={CheckCircle2}
            title={feedbackReceipt ? 'Feedback Submitted' : 'Feedback Record'}
            body={
              feedbackReceipt
                ? `Rating ${feedbackReceipt.overallRating}/5, resolved: ${feedbackReceipt.resolved ? 'Yes' : 'No'}`
                : 'Completed jobs generate tokenized feedback links after field work is closed.'
            }
          />
        </div>
      )}
    </SectionShell>
  );
}

function SideNav<T extends string>({
  items,
  activeId,
  onChange,
}: {
  items: Array<{ id: T; label: string; icon: LucideIcon }>;
  activeId: T;
  onChange: (id: T) => void;
}) {
  return (
    <>
      <aside className="sticky top-24 hidden h-fit w-56 shrink-0 rounded-lg border border-slate-200 bg-white p-2 shadow-sm lg:block">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className={`mb-1 flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-semibold transition ${
                activeId === item.id
                  ? 'bg-kibs-green/15 text-kibs-deepGreen'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
              onClick={() => onChange(item.id)}
              type="button"
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-flow-col overflow-x-auto border-t border-slate-200 bg-white p-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] lg:hidden">
        {items.slice(0, 5).map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className={`min-w-20 rounded-md px-2 py-2 text-xs font-semibold ${
                activeId === item.id ? 'bg-kibs-green/15 text-kibs-deepGreen' : 'text-slate-500'
              }`}
              onClick={() => onChange(item.id)}
              type="button"
            >
              <Icon className="mx-auto mb-1 h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}

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
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-kibs-deepGreen">{eyebrow}</p>
          <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">{title}</h1>
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
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-md bg-kibs-green/15 p-2 text-kibs-deepGreen">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
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
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className={`rounded-md p-2 ${toneClass(tone, 'soft')}`}>
          <Icon className="h-5 w-5" />
        </span>
        <ChevronRight className="h-4 w-4 text-slate-300" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </article>
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
      className={`w-full rounded-lg border bg-white p-4 text-left shadow-sm transition hover:border-kibs-green ${
        selected ? 'border-kibs-deepGreen ring-2 ring-kibs-green/20' : 'border-slate-200'
      }`}
      onClick={onSelect}
      type="button"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={job.priority === 'urgent' ? 'urgent' : 'info'}>{job.priority}</StatusPill>
            <span className="text-xs font-bold text-slate-500">{job.jobNumber}</span>
          </div>
          <h3 className="mt-2 text-base font-bold text-slate-950">{job.title}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {client?.name} - {site?.name}
          </p>
        </div>
        <StatusPill tone={job.status === 'completed' ? 'success' : 'warning'}>
          {statusLabels[job.status]}
        </StatusPill>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
        <span>{jobTypeLabels[job.jobType]}</span>
        <span>{job.serviceType}</span>
        {job.scheduledDate && <span>{formatDate(job.scheduledDate)}</span>}
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
    <Panel title="Job Details" icon={FileText}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill tone="neutral">{job.jobNumber}</StatusPill>
        <StatusPill tone={job.priority === 'urgent' ? 'urgent' : 'info'}>{job.priority}</StatusPill>
        <StatusPill tone={job.status === 'completed' ? 'success' : 'warning'}>
          {statusLabels[job.status]}
        </StatusPill>
      </div>

      <div className="mt-4">
        <h2 className="text-2xl font-black text-slate-950">{job.title}</h2>
        <p className="mt-2 text-sm text-slate-600">{job.description}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-md bg-slate-50 p-3">
          <p className={labelClass}>Client and Site</p>
          <h3 className="mt-2 text-lg font-bold text-slate-950">{getClient(job.clientId)?.name}</h3>
          <InfoLine icon={MapPin}>{getSite(job.siteId)?.address}</InfoLine>
          <InfoLine icon={Phone}>{getSite(job.siteId)?.contactPhone}</InfoLine>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className={labelClass}>Assignment</p>
          <div className="mt-2 space-y-2">
            {job.assignedTechnicianIds.length > 0 ? (
              job.assignedTechnicianIds.map((id) => (
                <InfoLine key={id} icon={UserRound}>
                  {getTechnician(id)?.name}
                </InfoLine>
              ))
            ) : (
              <p className="text-sm font-semibold text-kibs-red">Unassigned</p>
            )}
          </div>
          {job.scheduledDate && (
            <InfoLine icon={CalendarDays}>
              {formatDate(job.scheduledDate)} {job.scheduledTime}
            </InfoLine>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <ToolList toolIds={job.requiredToolIds} />
        <EvidenceList title="Images" icon={Camera} job={job} />
      </div>

      <InstalledEquipmentList siteId={job.siteId} />

      <div className="mt-5 rounded-md bg-slate-50 p-3">
        <p className={labelClass}>Status History</p>
        <div className="mt-3 space-y-3">
          {job.statusHistory.map((item, index) => (
            <div key={`${item.status}-${item.at}-${index}`} className="flex gap-3 text-sm">
              <span className="mt-1 h-2 w-2 rounded-full bg-kibs-deepGreen" />
              <div>
                <p className="font-semibold text-slate-900">{statusLabels[item.status]}</p>
                <p className="text-slate-500">
                  {formatDateTime(item.at)} by {item.actor}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {(['assigned', 'in_progress', 'completed'] as JobStatus[]).map((status) => (
          <button
            key={status}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-kibs-green hover:text-kibs-deepGreen"
            onClick={() => updateJobStatus(job.id, status, 'Manager')}
            type="button"
          >
            <ListChecks className="h-4 w-4" />
            {statusLabels[status]}
          </button>
        ))}
      </div>
    </Panel>
  );
}

function ToolList({ toolIds }: { toolIds: string[] }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <Wrench className="h-4 w-4 text-kibs-deepGreen" />
        <p className={labelClass}>Required Tools</p>
      </div>
      <div className="mt-3 space-y-2">
        {toolIds.length > 0 ? (
          toolIds.map((id) => (
            <div key={id} className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-kibs-deepGreen" />
              {tools.find((tool) => tool.id === id)?.name}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No tools selected</p>
        )}
      </div>
    </div>
  );
}

function EvidenceList({
  title,
  icon: Icon,
  job,
  category,
}: {
  title: string;
  icon: LucideIcon;
  job: Job;
  category?: string;
}) {
  const attachments = category
    ? job.attachments.filter((item) => item.category === category)
    : job.attachments;

  return (
    <div className="rounded-md bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-kibs-deepGreen" />
        <p className={labelClass}>{title}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {attachments.length > 0 ? (
          attachments.map((item) => (
            <div key={item.id} className="rounded-md border border-slate-200 bg-white p-3">
              <Camera className="h-5 w-5 text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-500">{item.sizeKb} KB</p>
            </div>
          ))
        ) : (
          <p className="col-span-2 text-sm text-slate-500">No images yet</p>
        )}
      </div>
    </div>
  );
}

function InstalledEquipmentList({ siteId }: { siteId: string }) {
  const equipment = installedEquipment.filter((item) => item.siteId === siteId);

  if (equipment.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 rounded-md bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <PackageCheck className="h-4 w-4 text-kibs-deepGreen" />
        <p className={labelClass}>Existing Installation</p>
      </div>
      <div className="mt-3 divide-y divide-slate-200">
        {equipment.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 py-2 text-sm">
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
    <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase text-kibs-deepGreen">Printable Job Report</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">{job.jobNumber}</h2>
        </div>
        <StatusPill tone="success">{statusLabels[job.status]}</StatusPill>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ReportLine label="Company" value="Kibs Systems Ltd" />
        <ReportLine label="Client" value={getClient(job.clientId)?.name ?? ''} />
        <ReportLine label="Site" value={getSite(job.siteId)?.name ?? ''} />
        <ReportLine label="Job Type" value={jobTypeLabels[job.jobType]} />
        <ReportLine label="System" value={job.serviceType} />
        <ReportLine label="Technician" value={job.assignedTechnicianIds.map((id) => getTechnician(id)?.name).join(', ')} />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <p className={labelClass}>Diagnosis</p>
          <p className="mt-1 text-sm text-slate-700">{job.diagnosis}</p>
        </div>
        <div>
          <p className={labelClass}>Work Performed</p>
          <p className="mt-1 text-sm text-slate-700">{job.workPerformed}</p>
        </div>
      </div>
    </section>
  );
}

function NotificationRow({ item, expanded = false }: { item: NotificationItem; expanded?: boolean }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className={`rounded-md p-2 ${toneClass(item.severity, 'soft')}`}>
          <Bell className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-950">{item.title}</h3>
            {item.unread && <StatusPill tone="urgent">Unread</StatusPill>}
          </div>
          <p className="mt-1 text-sm text-slate-600">{item.body}</p>
          {expanded && (
            <p className="mt-2 text-xs font-semibold uppercase text-slate-400">
              {formatDateTime(item.createdAt)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function PrimaryButton({
  icon: Icon,
  children,
  fullWidth = false,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-kibs-deepGreen px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 ${
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
    <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-bold capitalize ${toneClass(tone, 'pill')}`}>
      {children}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function ReportLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 text-sm">
      <span className="font-semibold text-slate-600">{label}</span>
      <span className="text-right font-bold text-slate-950">{value}</span>
    </div>
  );
}

function InfoLine({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <p className="mt-2 flex items-center gap-2 text-sm text-slate-700">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      <span>{children}</span>
    </p>
  );
}

function TextField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
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

function TextareaField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <textarea
        className={`${inputClass} mt-1 min-h-28 resize-y`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  format = titleCase,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  format?: (value: string) => string;
}) {
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

function PhotoPicker({
  label,
  count,
  onChange,
}: {
  label: string;
  count: number;
  onChange: (count: number) => void;
}) {
  return (
    <label className="block rounded-md border border-dashed border-slate-300 bg-white p-3">
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <UploadCloud className="h-4 w-4" />
        {label}
      </span>
      <input
        className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-kibs-green/15 file:px-3 file:py-2 file:text-sm file:font-bold file:text-kibs-deepGreen"
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => onChange(event.target.files?.length ?? 0)}
      />
      <p className="mt-2 text-xs font-semibold text-slate-500">{count} selected</p>
    </label>
  );
}

function RatingField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <div className="mt-2 flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            className={`flex h-11 w-11 items-center justify-center rounded-md border text-sm font-bold ${
              rating <= value
                ? 'border-amber-400 bg-amber-50 text-amber-600'
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

function ReceiptPanel({
  icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  const Icon = icon;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <span className="inline-flex rounded-md bg-kibs-green/15 p-3 text-kibs-deepGreen">
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-2xl font-black text-slate-950">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{body}</p>
      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <MiniStat label="Status" value="Captured" />
        <MiniStat label="Alert" value="Created" />
        <MiniStat label="Photos" value="Compressed" />
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
  if (value === 'all') {
    return 'All';
  }

  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toneClass(tone: Tone, variant: 'soft' | 'pill') {
  const classes: Record<Tone, Record<'soft' | 'pill', string>> = {
    neutral: {
      soft: 'bg-slate-100 text-slate-600',
      pill: 'bg-slate-100 text-slate-700',
    },
    success: {
      soft: 'bg-green-100 text-green-700',
      pill: 'bg-green-100 text-green-700',
    },
    warning: {
      soft: 'bg-amber-100 text-amber-700',
      pill: 'bg-amber-100 text-amber-700',
    },
    urgent: {
      soft: 'bg-red-100 text-kibs-red',
      pill: 'bg-red-100 text-kibs-red',
    },
    info: {
      soft: 'bg-sky-100 text-sky-700',
      pill: 'bg-sky-100 text-sky-700',
    },
  };

  return classes[tone][variant];
}

export default App;
