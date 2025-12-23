import Link from 'next/link';
import { 
  FolderKanban, 
  MessageSquare, 
  Lightbulb, 
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

// This would normally fetch from Supabase
// For now, showing the UI structure
async function getStats() {
  // TODO: Replace with actual Supabase queries
  return {
    activeProjects: 0,
    pendingInterviews: 0,
    findings: 0,
    completedTasks: 0,
    pendingApprovals: 0
  };
}

async function getRecentProjects() {
  // TODO: Replace with actual Supabase query
  return [];
}

async function getPendingApprovals() {
  // TODO: Replace with actual Supabase query
  return [];
}

export default async function Dashboard() {
  const stats = await getStats();
  const recentProjects = await getRecentProjects();
  const pendingApprovals = await getPendingApprovals();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your consulting automation platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={<FolderKanban className="text-blue-600" />}
          color="blue"
        />
        <StatCard
          title="Pending Interviews"
          value={stats.pendingInterviews}
          icon={<MessageSquare className="text-purple-600" />}
          color="purple"
        />
        <StatCard
          title="Findings"
          value={stats.findings}
          icon={<Lightbulb className="text-yellow-600" />}
          color="yellow"
        />
        <StatCard
          title="Completed Tasks"
          value={stats.completedTasks}
          icon={<CheckCircle className="text-green-600" />}
          color="green"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={<AlertCircle className="text-red-600" />}
          color="red"
          highlight={stats.pendingApprovals > 0}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Approvals */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
            <span className="text-sm text-gray-500">Action Required</span>
          </div>
          
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="mx-auto mb-2 text-green-500" size={32} />
              <p>No pending approvals</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Approval items would go here */}
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <Link href="/projects" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          
          {recentProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FolderKanban className="mx-auto mb-2" size={32} />
              <p>No projects yet</p>
              <Link href="/projects/new" className="text-blue-600 hover:text-blue-700 text-sm">
                Create your first project
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Project items would go here */}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            title="New Project"
            description="Start a new client engagement"
            href="/projects/new"
            color="blue"
          />
          <QuickAction
            title="Schedule Interview"
            description="Set up a stakeholder interview"
            href="/interviews/new"
            color="purple"
          />
          <QuickAction
            title="Sync Transcripts"
            description="Pull latest from ElevenLabs"
            href="/settings/sync"
            color="green"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  color,
  highlight = false 
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${highlight ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  title,
  description,
  href,
  color
}: {
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  return (
    <Link 
      href={href}
      className={`block p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-${color}-400 hover:bg-${color}-50 transition-colors`}
    >
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </Link>
  );
}
