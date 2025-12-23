'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft,
  Building2,
  CheckCircle,
  Clock,
  FileText,
  Lightbulb,
  MessageSquare,
  CheckSquare,
  AlertCircle,
  ExternalLink,
  Play,
  Pause
} from 'lucide-react';

const STATUS_FLOW = [
  'discovery',
  'analysis',
  'review_findings',
  'documentation',
  'prd_creation',
  'review_prd',
  'task_breakdown',
  'development',
  'review_qa',
  'user_testing',
  'iteration',
  'completed'
];

const STATUS_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  discovery: { label: 'Discovery', color: 'blue', description: 'Conducting stakeholder interviews' },
  analysis: { label: 'Analysis', color: 'purple', description: 'Analyzing interview transcripts' },
  review_findings: { label: 'Review Findings', color: 'yellow', description: 'Review and approve findings before proceeding' },
  documentation: { label: 'Documentation', color: 'indigo', description: 'Creating findings report and slides' },
  prd_creation: { label: 'PRD Creation', color: 'pink', description: 'Writing product requirements' },
  review_prd: { label: 'Review PRD', color: 'yellow', description: 'Review and approve PRD before development' },
  task_breakdown: { label: 'Task Breakdown', color: 'orange', description: 'Breaking PRD into development tasks' },
  development: { label: 'Development', color: 'cyan', description: 'Building the solution' },
  review_qa: { label: 'Review QA', color: 'yellow', description: 'Review quality before user testing' },
  user_testing: { label: 'User Testing', color: 'teal', description: 'Gathering user feedback' },
  iteration: { label: 'Iteration', color: 'violet', description: 'Implementing improvements based on feedback' },
  completed: { label: 'Completed', color: 'green', description: 'Project successfully completed' },
  on_hold: { label: 'On Hold', color: 'gray', description: 'Project is paused' },
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [findings, setFindings] = useState<any[]>([]);
  const [prds, setPrds] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  async function fetchProjectData() {
    setLoading(true);

    const { data: projectData } = await supabase
      .from('projects')
      .select('*, organization:organizations(name)')
      .eq('id', projectId)
      .single();

    if (projectData) {
      setProject(projectData);
    }

    const [interviewsRes, findingsRes, prdsRes, tasksRes, assetsRes] = await Promise.all([
      supabase.from('interviews').select('id, status, interview_url, stakeholder:stakeholders(name, role)').eq('project_id', projectId),
      supabase.from('findings').select('id, finding_type, title, description, impact_level').eq('project_id', projectId),
      supabase.from('prds').select('id, title, version, status').eq('project_id', projectId),
      supabase.from('tasks').select('id, title, status, task_type').eq('project_id', projectId),
      supabase.from('assets').select('id, name, google_drive_url, figma_url').eq('project_id', projectId),
    ]);

    setInterviews(interviewsRes.data || []);
    setFindings(findingsRes.data || []);
    setPrds(prdsRes.data || []);
    setTasks(tasksRes.data || []);
    setAssets(assetsRes.data || []);
    setLoading(false);
  }

  async function approveFindings() {
    setActionLoading(true);
    await supabase
      .from('projects')
      .update({ 
        findings_approved: true, 
        findings_approved_at: new Date().toISOString(),
        status: 'documentation'
      })
      .eq('id', projectId);
    await fetchProjectData();
    setActionLoading(false);
  }

  async function approvePrd() {
    setActionLoading(true);
    await supabase
      .from('projects')
      .update({ 
        prd_approved: true, 
        prd_approved_at: new Date().toISOString(),
        status: 'task_breakdown'
      })
      .eq('id', projectId);
    await fetchProjectData();
    setActionLoading(false);
  }

  async function approveQa() {
    setActionLoading(true);
    await supabase
      .from('projects')
      .update({ 
        qa_approved: true, 
        qa_approved_at: new Date().toISOString(),
        status: 'user_testing'
      })
      .eq('id', projectId);
    await fetchProjectData();
    setActionLoading(false);
  }

  async function updateStatus(newStatus: string) {
    setActionLoading(true);
    await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', projectId);
    await fetchProjectData();
    setActionLoading(false);
  }

  // Helper to get stakeholder info (handles array from Supabase)
  function getStakeholder(interview: any) {
    if (!interview.stakeholder) return null;
    // Supabase returns single relations as objects, but sometimes as arrays
    if (Array.isArray(interview.stakeholder)) {
      return interview.stakeholder[0] || null;
    }
    return interview.stakeholder;
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Project not found</p>
        <Link href="/projects" className="text-blue-600 hover:text-blue-700">
          Back to projects
        </Link>
      </div>
    );
  }

  const config = STATUS_CONFIG[project.status] || STATUS_CONFIG['discovery'];
  const currentIndex = STATUS_FLOW.indexOf(project.status);
  const isReviewStage = ['review_findings', 'review_prd', 'review_qa'].includes(project.status);

  // Handle organization (could be array or object)
  const orgName = project.organization?.name || (Array.isArray(project.organization) ? project.organization[0]?.name : null);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/projects" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={20} />
          Back to projects
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            {orgName && (
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Building2 size={16} />
                {orgName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {project.status !== 'on_hold' && project.status !== 'completed' && (
              <button
                onClick={() => updateStatus('on_hold')}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Pause size={16} />
                Put on Hold
              </button>
            )}
            {project.status === 'on_hold' && (
              <button
                onClick={() => updateStatus('discovery')}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Play size={16} />
                Resume
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl p-6 mb-6 ${isReviewStage ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-50 border border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isReviewStage && <AlertCircle className="text-yellow-600" size={20} />}
              <span className={`inline-flex items-center rounded-full px-3 py-1 font-medium status-${project.status}`}>
                {config.label}
              </span>
            </div>
            <p className="text-gray-600">{config.description}</p>
          </div>
          
          {project.status === 'review_findings' && (
            <button
              onClick={approveFindings}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle size={20} />
              Approve Findings
            </button>
          )}
          {project.status === 'review_prd' && (
            <button
              onClick={approvePrd}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle size={20} />
              Approve PRD
            </button>
          )}
          {project.status === 'review_qa' && (
            <button
              onClick={approveQa}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle size={20} />
              Approve for User Testing
            </button>
          )}
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Discovery</span>
            <span>Completed</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / STATUS_FLOW.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Interviews */}
          <Section title="Interviews" icon={<MessageSquare size={20} />} count={interviews.length}>
            {interviews.length === 0 ? (
              <EmptyState message="No interviews yet" />
            ) : (
              <div className="space-y-3">
                {interviews.map((interview) => {
                  const stakeholder = getStakeholder(interview);
                  return (
                    <div key={interview.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{stakeholder?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{stakeholder?.role || ''}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          interview.status === 'analyzed' ? 'bg-green-100 text-green-700' :
                          interview.status === 'transcribed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {interview.status}
                        </span>
                        {interview.interview_url && (
                          <a href={interview.interview_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={16} className="text-gray-400 hover:text-blue-600" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Findings */}
          <Section title="Findings" icon={<Lightbulb size={20} />} count={findings.length}>
            {findings.length === 0 ? (
              <EmptyState message="No findings yet. Run analysis on interviews to extract findings." />
            ) : (
              <div className="space-y-3">
                {findings.slice(0, 5).map((finding) => (
                  <div key={finding.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          finding.finding_type === 'pain_point' ? 'bg-red-100 text-red-700' :
                          finding.finding_type === 'opportunity' ? 'bg-green-100 text-green-700' :
                          finding.finding_type === 'automation_candidate' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {(finding.finding_type || '').replace('_', ' ')}
                        </span>
                        <p className="font-medium mt-2">{finding.title}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{finding.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">Impact: {finding.impact_level}/10</span>
                      </div>
                    </div>
                  </div>
                ))}
                {findings.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">+ {findings.length - 5} more findings</p>
                )}
              </div>
            )}
          </Section>

          {/* Tasks */}
          <Section title="Tasks" icon={<CheckSquare size={20} />} count={tasks.length}>
            {tasks.length === 0 ? (
              <EmptyState message="No tasks yet. Create a PRD and break it down into tasks." />
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 8).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        task.status === 'done' ? 'bg-green-500' :
                        task.status === 'in_progress' ? 'bg-yellow-500' :
                        'bg-gray-300'
                      }`} />
                      <span className="text-sm">{task.title}</span>
                    </div>
                    <span className="text-xs text-gray-500">{task.task_type}</span>
                  </div>
                ))}
                {tasks.length > 8 && (
                  <p className="text-sm text-gray-500 text-center">+ {tasks.length - 8} more tasks</p>
                )}
              </div>
            )}
          </Section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Project Info</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Created</dt>
                <dd className="text-sm font-medium">{new Date(project.created_at).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Last Updated</dt>
                <dd className="text-sm font-medium">{new Date(project.updated_at).toLocaleDateString()}</dd>
              </div>
              {project.findings_approved && project.findings_approved_at && (
                <div>
                  <dt className="text-sm text-gray-500">Findings Approved</dt>
                  <dd className="text-sm font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle size={14} />
                    {new Date(project.findings_approved_at).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {project.prd_approved && project.prd_approved_at && (
                <div>
                  <dt className="text-sm text-gray-500">PRD Approved</dt>
                  <dd className="text-sm font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle size={14} />
                    {new Date(project.prd_approved_at).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {project.qa_approved && project.qa_approved_at && (
                <div>
                  <dt className="text-sm text-gray-500">QA Approved</dt>
                  <dd className="text-sm font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle size={14} />
                    {new Date(project.qa_approved_at).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Assets</h3>
            {assets.length === 0 ? (
              <p className="text-sm text-gray-500">No assets generated yet</p>
            ) : (
              <div className="space-y-2">
                {assets.map((asset) => (
                  <a 
                    key={asset.id}
                    href={asset.google_drive_url || asset.figma_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                  >
                    <FileText size={16} className="text-gray-400" />
                    <span className="text-sm">{asset.name}</span>
                    <ExternalLink size={12} className="text-gray-400 ml-auto" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">PRDs</h3>
            {prds.length === 0 ? (
              <p className="text-sm text-gray-500">No PRDs created yet</p>
            ) : (
              <div className="space-y-2">
                {prds.map((prd) => (
                  <div key={prd.id} className="p-2 hover:bg-gray-50 rounded">
                    <p className="text-sm font-medium">{prd.title}</p>
                    <p className="text-xs text-gray-500">v{prd.version} · {prd.status}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, count, children }: { title: string; icon: React.ReactNode; count?: number; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-400">{icon}</span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {count !== undefined && (
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="text-center py-6 text-gray-500 text-sm">{message}</div>;
}
