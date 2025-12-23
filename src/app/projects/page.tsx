'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Plus, 
  Search,
  LayoutGrid,
  List,
  ChevronRight,
  Clock,
  AlertCircle
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  discovery: { label: 'Discovery', color: 'blue', description: 'Conducting interviews' },
  analysis: { label: 'Analysis', color: 'purple', description: 'Analyzing transcripts' },
  review_findings: { label: 'Review Findings', color: 'yellow', description: 'Awaiting your approval' },
  documentation: { label: 'Documentation', color: 'indigo', description: 'Creating reports' },
  prd_creation: { label: 'PRD Creation', color: 'pink', description: 'Writing requirements' },
  review_prd: { label: 'Review PRD', color: 'yellow', description: 'Awaiting your approval' },
  task_breakdown: { label: 'Task Breakdown', color: 'orange', description: 'Creating tasks' },
  development: { label: 'Development', color: 'cyan', description: 'Building solution' },
  review_qa: { label: 'Review QA', color: 'yellow', description: 'Awaiting your approval' },
  user_testing: { label: 'User Testing', color: 'teal', description: 'Gathering feedback' },
  iteration: { label: 'Iteration', color: 'violet', description: 'Implementing improvements' },
  completed: { label: 'Completed', color: 'green', description: 'Project finished' },
  on_hold: { label: 'On Hold', color: 'gray', description: 'Paused' },
};

const BOARD_COLUMNS = [
  { id: 'discovery', label: 'Discovery', statuses: ['discovery', 'analysis'] },
  { id: 'review', label: 'Review', statuses: ['review_findings', 'review_prd', 'review_qa'] },
  { id: 'build', label: 'Build', statuses: ['documentation', 'prd_creation', 'task_breakdown', 'development'] },
  { id: 'test', label: 'Test', statuses: ['user_testing', 'iteration'] },
  { id: 'done', label: 'Done', statuses: ['completed', 'on_hold'] },
];

interface ProjectData {
  id: string;
  name: string;
  status: string;
  updated_at: string;
  organization: { name: string } | null;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, status, updated_at, organization:organizations(name)')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects((data || []) as ProjectData[]);
    }
    setLoading(false);
  }

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.organization?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProjectsForColumn = (column: typeof BOARD_COLUMNS[0]) => {
    return filteredProjects.filter(p => column.statuses.includes(p.status));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">{projects.length} total projects</p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Project
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('board')}
            className={`p-2 rounded ${viewMode === 'board' ? 'bg-white shadow-sm' : ''}`}
          >
            <LayoutGrid size={20} className={viewMode === 'board' ? 'text-blue-600' : 'text-gray-500'} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
          >
            <List size={20} className={viewMode === 'list' ? 'text-blue-600' : 'text-gray-500'} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading projects...</p>
        </div>
      ) : viewMode === 'board' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {BOARD_COLUMNS.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-72">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700">{column.label}</h3>
                  <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                    {getProjectsForColumn(column).length}
                  </span>
                </div>
                <div className="space-y-3">
                  {getProjectsForColumn(column).map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                  {getProjectsForColumn(column).length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No projects
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Project</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Organization</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Updated</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/projects/${project.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {project.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {project.organization?.name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/projects/${project.id}`}>
                      <ChevronRight className="text-gray-400" size={20} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProjects.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No projects found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectData }) {
  const config = STATUS_CONFIG[project.status] || STATUS_CONFIG['discovery'];
  const isReview = ['review_findings', 'review_prd', 'review_qa'].includes(project.status);

  return (
    <Link href={`/projects/${project.id}`}>
      <div className={`bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow ${isReview ? 'border-yellow-300' : 'border-gray-200'}`}>
        {isReview && (
          <div className="flex items-center gap-1 text-yellow-600 text-xs mb-2">
            <AlertCircle size={12} />
            <span>Needs your approval</span>
          </div>
        )}
        <h4 className="font-medium text-gray-900 mb-1">{project.name}</h4>
        {project.organization && (
          <p className="text-sm text-gray-500 mb-2">{project.organization.name}</p>
        )}
        <div className="flex items-center justify-between">
          <StatusBadge status={project.status} size="sm" />
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={12} />
            {new Date(project.updated_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['discovery'];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium status-${status} ${sizeClasses}`}>
      {config.label}
    </span>
  );
}
