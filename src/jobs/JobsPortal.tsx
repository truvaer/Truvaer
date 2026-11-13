import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  CheckCircle2,
  Plus,
  X,
  Share2,
  Award,
  AlertTriangle,
  Send,
  Layers,
  Sparkles,
  ShieldCheck,
  Plane,
  Coins,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { formatDateDDMMYYYY } from '../utils/dateFormat';
import { JobListing, RegularUser, BusinessProfile, PlatformModuleControl } from '../types';

interface JobsPortalProps {
  currentUser: RegularUser | null;
  currentBusiness: BusinessProfile | null;
  isAdmin?: boolean;
  onOpenAuth?: () => void;
  onOpenWallet?: () => void;
}

export const JobsPortal: React.FC<JobsPortalProps> = ({
  currentUser,
  currentBusiness,
  isAdmin = false,
  onOpenAuth,
  onOpenWallet,
}) => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleType, setSelectedRoleType] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);

  // Application & Posting modals
  const [showPostModal, setShowPostModal] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Post new job form
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobRoleType, setNewJobRoleType] = useState<JobListing['role_type']>('First Officer');
  const [newJobLocation, setNewJobLocation] = useState('Dubai (DXB / DWC)');
  const [newJobCountry, setNewJobCountry] = useState('AE');
  const [newJobExp, setNewJobExp] = useState('3+ Years');
  const [newJobSalary, setNewJobSalary] = useState('AED 28,000 - 35,000 / month');
  const [newJobDesc, setNewJobDesc] = useState('');
  const [newJobTags, setNewJobTags] = useState('ATPL, Type Rated, Multi-Engine');

  // Module Status & Circuit Breaker Check
  const [moduleControl, setModuleControl] = useState<PlatformModuleControl | null>(null);
  const isGlobalCrisis = db.getGlobalCrisisMode();

  const loadData = () => {
    const allLive = db.getJobs();
    setJobs([...allLive]);
    const controls = db.getPlatformModuleControls();
    const jm = controls.find((c) => c.id === 'jobs_portal') || null;
    setModuleControl(jm);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastNotice({ type, message });
    setTimeout(() => setToastNotice(null), 4500);
  };

  const handleApply = (job: JobListing) => {
    if (!currentUser) {
      showToast('Please log in as an Aviator (Standard User) to apply.', 'error');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (moduleControl?.status === 'READ_ONLY' || isGlobalCrisis) {
      showToast('System Notice: Applications are temporarily queued in Read-Only protection mode.', 'error');
      return;
    }

    setApplyingJobId(job.id);
    const res = db.applyToJob(job.id, currentUser.user_id);
    setApplyingJobId(null);

    if (res.success) {
      showToast(res.message, 'success');
      loadData();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness && !isAdmin) {
      showToast('Only registered business operators or platform admins can post vacancies.', 'error');
      return;
    }

    if (!newJobTitle.trim() || !newJobDesc.trim()) {
      showToast('Please provide a job title and description.', 'error');
      return;
    }

    const bizId = currentBusiness?.business_id || 'biz_corporate_user';
    const tagArray = newJobTags.split(',').map((t) => t.trim()).filter(Boolean);

    const res = db.submitJobPost(bizId, {
      title: newJobTitle.trim(),
      role_type: newJobRoleType,
      location: newJobLocation.trim(),
      country: newJobCountry,
      experience_years: newJobExp.trim(),
      salary_range: newJobSalary.trim(),
      description: newJobDesc.trim(),
      tags: tagArray.length > 0 ? tagArray : ['Aviation Recruits', 'Verified'],
      company_name: currentBusiness?.organization_name || 'TruvAer Corporate Aviation Ltd',
      expiration_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    });

    if (res.success) {
      if (isAdmin && res.job) {
        db.adminVerifyJob(res.job.id, 'approve');
        showToast('Vacancy published and approved instantly by Administrator.', 'success');
      } else {
        showToast(res.message, 'success');
      }
      setShowPostModal(false);
      setNewJobTitle('');
      setNewJobDesc('');
      loadData();
    } else {
      showToast(res.message, 'error');
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchRole = selectedRoleType === 'All' || job.role_type === selectedRoleType;
    const matchCountry = selectedCountry === 'All' || job.country === selectedCountry;

    return matchSearch && matchRole && matchCountry;
  });

  const isMaintenance = moduleControl?.status === 'MAINTENANCE';
  const isReadOnly = moduleControl?.status === 'READ_ONLY';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notice */}
      {toastNotice && (
        <div
          className={`fixed top-16 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold border transition-all ${
            toastNotice.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          {toastNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastNotice.message}</span>
        </div>
      )}

      {/* Emergency Crisis / Maintenance Mode Banner if Active */}
      {(isMaintenance || isReadOnly || isGlobalCrisis) && (
        <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-200 shadow-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold flex items-center space-x-2">
                <span>Controlled Operational Mode Active</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {isMaintenance ? 'MAINTENANCE' : 'READ-ONLY'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {isMaintenance
                  ? 'This module is undergoing scheduled security recalibration. Job postings and applications are safely paused.'
                  : 'System is running in protected read-only mode. Vacancy searches are active; submissions are temporarily queued.'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-amber-400 font-bold shrink-0">Security Circuit Active</span>
        </div>
      )}

      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/50 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-600/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    TruvAer Aviation Careers &amp; Jobs Hub
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Stage 1 Active
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Verified cockpit crew, licensed AME line engineers, air operations dispatchers &amp; executive aviation personnel.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {(currentBusiness || isAdmin) && (
              <button
                onClick={() => setShowPostModal(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-600/25 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Post Vacancy (30–100 Cr)</span>
              </button>
            )}
            <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{filteredJobs.length} Live Openings</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-5 mt-5 border-t border-slate-800/80">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, operator, skills, or tags (e.g. ATPL, B777, CFI)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedRoleType}
              onChange={(e) => setSelectedRoleType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Aviation Roles</option>
              <option value="Chief Flight Instructor">Chief Flight Instructor (CFI)</option>
              <option value="First Officer">First Officer (Cockpit)</option>
              <option value="Avionics Specialist">Avionics Maintenance Specialist</option>
              <option value="Cabin Crew">Cabin Crew / VIP Concierge</option>
              <option value="Flight Operations Coordinator">Flight Operations Coordinator</option>
              <option value="Software Engineer">Aviation Software Engineer</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Regional Hubs</option>
              <option value="AE">UAE / Middle East (DXB / DWC)</option>
              <option value="IN">India Hubs (BOM / DEL / BLR)</option>
              <option value="UK">United Kingdom (LHR / LTN)</option>
              <option value="DE">European Hubs (MUC / FRA)</option>
              <option value="US">North America (MIA / JFK)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Jobs Listing Grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3 shadow-lg">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No aviation vacancies match your filter</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your role or hub filter, or clear search queries to view all live verified openings.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedRoleType('All');
              setSelectedCountry('All');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const hasApplied =
              currentUser &&
              job.applied_users &&
              job.applied_users.some((u) => u.user_id === currentUser.user_id);

            return (
              <div
                key={job.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {job.role_type}
                        </span>
                        {job.is_pinned && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Featured</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug">{job.title}</h3>
                      <div className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.company_name}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-emerald-400 font-mono">{job.salary_range}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{job.experience_years} Experience</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <div className="flex items-center space-x-1 text-[11px] text-slate-300 mr-2 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                      <MapPin className="w-3 h-3 text-sky-400" />
                      <span>{job.location}</span>
                    </div>
                    {job.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <div className="text-[10px] text-slate-500 font-mono">
                    Posted: {formatDateDDMMYYYY(job.published_date)} • Expires: {formatDateDDMMYYYY(job.expiration_date)}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold cursor-pointer transition-colors"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => handleApply(job)}
                      disabled={Boolean(hasApplied) || applyingJobId === job.id}
                      className={`px-4 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer ${
                        hasApplied
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:scale-95'
                      }`}
                    >
                      {hasApplied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Applied</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Apply Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {selectedJob.role_type}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{selectedJob.title}</h2>
                <p className="text-xs text-sky-400 font-semibold">{selectedJob.company_name}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Hub Location</div>
                <div className="text-xs font-semibold text-white mt-0.5">{selectedJob.location}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Compensation</div>
                <div className="text-xs font-semibold text-emerald-400 font-mono mt-0.5">{selectedJob.salary_range}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Experience</div>
                <div className="text-xs font-semibold text-white mt-0.5">{selectedJob.experience_years}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
                <div className="text-xs font-semibold text-sky-400 mt-0.5">{selectedJob.status}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Position Overview &amp; Responsibilities</h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                {selectedJob.description}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Mandatory Qualifications &amp; Endorsements</h4>
              <div className="flex flex-wrap gap-2">
                {selectedJob.tags.map((t, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-mono font-semibold"
                  >
                    ✓ {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                Applicants: {selectedJob.applied_users?.length || 0} registered candidates
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleApply(selectedJob);
                    setSelectedJob(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Vacancy Modal for Business & Admin */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Briefcase className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Post New Aviation Vacancy</h3>
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Title *</label>
                <input
                  type="text"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder="e.g. Captain A320 Type Rated - Mumbai Base"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role Classification</label>
                  <select
                    value={newJobRoleType}
                    onChange={(e) => setNewJobRoleType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Chief Flight Instructor">Chief Flight Instructor (CFI)</option>
                    <option value="First Officer">First Officer</option>
                    <option value="Avionics Specialist">Avionics Maintenance Specialist</option>
                    <option value="Cabin Crew">Cabin Crew / Concierge</option>
                    <option value="Flight Operations Coordinator">Flight Operations Coordinator</option>
                    <option value="Software Engineer">Software Engineer (100 Cr)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hub Location</label>
                  <input
                    type="text"
                    value={newJobLocation}
                    onChange={(e) => setNewJobLocation(e.target.value)}
                    placeholder="e.g. Mumbai (BOM) / Delhi (DEL)"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Compensation Range</label>
                  <input
                    type="text"
                    value={newJobSalary}
                    onChange={(e) => setNewJobSalary(e.target.value)}
                    placeholder="e.g. ₹4,50,000 - 6,00,000 / month"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Experience Required</label>
                  <input
                    type="text"
                    value={newJobExp}
                    onChange={(e) => setNewJobExp(e.target.value)}
                    placeholder="e.g. 5+ Years, 2,000 hrs PIC"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Description &amp; Duties *</label>
                <textarea
                  value={newJobDesc}
                  onChange={(e) => setNewJobDesc(e.target.value)}
                  rows={3}
                  placeholder="Detail the operational duties, flight route schedules, and required regulatory certificates..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={newJobTags}
                  onChange={(e) => setNewJobTags(e.target.value)}
                  placeholder="e.g. ATPL, Type Rated A320, DGCA Class 1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[11px] text-slate-300">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>
                    Cost: <strong>{newJobRoleType === 'Software Engineer' ? '100' : '30'} Corporate Credits</strong>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Wallet Balance: {(currentBusiness?.corporate_wallet?.credit_balance ?? 5000).toLocaleString()} Cr
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  Confirm &amp; Post Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
