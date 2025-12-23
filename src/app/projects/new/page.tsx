'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Plus } from 'lucide-react';

interface OrganizationData {
  id: string;
  name: string;
  industry: string | null;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewOrg, setShowNewOrg] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organization_id: '',
    newOrgName: '',
    newOrgIndustry: '',
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  async function fetchOrganizations() {
    const { data } = await supabase
      .from('organizations')
      .select('id, name, industry')
      .order('name');
    setOrganizations((data || []) as OrganizationData[]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      let orgId = formData.organization_id;

      if (showNewOrg && formData.newOrgName) {
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: formData.newOrgName,
            industry: formData.newOrgIndustry || null,
          })
          .select('id')
          .single();

        if (orgError) throw orgError;
        orgId = (newOrg as { id: string }).id;
      }

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: formData.name,
          description: formData.description || null,
          organization_id: orgId || null,
          status: 'discovery',
        })
        .select('id')
        .single();

      if (projectError) throw projectError;

      router.push(`/projects/${(project as { id: string }).id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/projects" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={20} />
        Back to projects
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">New Project</h1>
      <p className="text-gray-600 mb-8">Create a new client engagement</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Project Name *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Process Automation Discovery"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the engagement..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization / Client
          </label>
          
          {!showNewOrg ? (
            <>
              <select
                value={formData.organization_id}
                onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select organization (optional)</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} {org.industry && `(${org.industry})`}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewOrg(true)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus size={14} />
                Add new organization
              </button>
            </>
          ) : (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <label htmlFor="newOrgName" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  id="newOrgName"
                  value={formData.newOrgName}
                  onChange={(e) => setFormData({ ...formData, newOrgName: e.target.value })}
                  placeholder="e.g., Acme Corp"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="newOrgIndustry" className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  id="newOrgIndustry"
                  value={formData.newOrgIndustry}
                  onChange={(e) => setFormData({ ...formData, newOrgIndustry: e.target.value })}
                  placeholder="e.g., Healthcare, Finance, Technology"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowNewOrg(false);
                  setFormData({ ...formData, newOrgName: '', newOrgIndustry: '' });
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel - use existing organization
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={loading || !formData.name}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
          <Link href="/projects" className="px-6 py-2 text-gray-600 hover:text-gray-900">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
