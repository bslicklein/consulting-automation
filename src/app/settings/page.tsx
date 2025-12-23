'use client';

import { useState } from 'react';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export default function SettingsPage() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [elevenLabsStatus, setElevenLabsStatus] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  async function checkElevenLabsStatus() {
    try {
      const response = await fetch('/api/elevenlabs/sync');
      const data = await response.json();
      setElevenLabsStatus(data);
    } catch (error) {
      setElevenLabsStatus({ error: 'Failed to check status' });
    }
  }

  async function syncTranscripts() {
    setSyncing(true);
    setSyncResult(null);
    
    try {
      const response = await fetch('/api/elevenlabs/sync', {
        method: 'POST',
      });
      const data = await response.json();
      setSyncResult(data);
    } catch (error) {
      setSyncResult({ error: 'Failed to sync' });
    } finally {
      setSyncing(false);
    }
  }

  async function copyInterviewUrl() {
    if (elevenLabsStatus?.interviewUrl) {
      await navigator.clipboard.writeText(elevenLabsStatus.interviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-600 mb-8">Configure integrations and sync data</p>

      <div className="space-y-6">
        {/* ElevenLabs Integration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ElevenLabs Integration</h2>
          
          <div className="space-y-4">
            {/* Status Check */}
            <div>
              <button
                onClick={checkElevenLabsStatus}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Check Connection Status
              </button>
              
              {elevenLabsStatus && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  {elevenLabsStatus.error ? (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle size={20} />
                      <span>{elevenLabsStatus.error}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={20} />
                        <span>Connected to ElevenLabs</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Agent ID: <code className="bg-gray-200 px-1 rounded">{elevenLabsStatus.agentId}</code>
                      </p>
                      <p className="text-sm text-gray-600">
                        Total Conversations: {elevenLabsStatus.totalConversations}
                      </p>
                      
                      {/* Interview URL */}
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-2">Interview Link (share with stakeholders):</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={elevenLabsStatus.interviewUrl}
                            className="flex-1 text-sm px-3 py-2 bg-white border border-blue-200 rounded"
                          />
                          <button
                            onClick={copyInterviewUrl}
                            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                          >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                          <a
                            href={elevenLabsStatus.interviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 border border-blue-300 text-blue-600 rounded hover:bg-blue-50"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sync Button */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium text-gray-900 mb-2">Sync Transcripts</h3>
              <p className="text-sm text-gray-600 mb-4">
                Pull the latest interview transcripts from ElevenLabs and save them to your database.
              </p>
              
              <button
                onClick={syncTranscripts}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing...' : 'Sync Transcripts'}
              </button>

              {syncResult && (
                <div className={`mt-4 p-4 rounded-lg ${syncResult.error ? 'bg-red-50' : 'bg-green-50'}`}>
                  {syncResult.error ? (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle size={20} />
                      <span>{syncResult.error}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={20} />
                        <span>{syncResult.message}</span>
                      </div>
                      {syncResult.errors?.length > 0 && (
                        <div className="text-sm text-yellow-700">
                          <p>Warnings:</p>
                          <ul className="list-disc list-inside">
                            {syncResult.errors.map((err: string, i: number) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Environment Variables Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Environment Variables</h2>
          <p className="text-sm text-gray-600 mb-4">
            Make sure these are set in your <code className="bg-gray-100 px-1 rounded">.env.local</code> file:
          </p>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sjgtggywbsdgnfvcqxqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# ElevenLabs
ELEVENLABS_API_KEY=your_api_key
ELEVENLABS_INTERVIEW_AGENT_ID=agent_0701kcjkqf7vehwvk0cj59h1b6r7`}</pre>
          </div>
        </div>

        {/* Supabase Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Supabase Dashboard</h2>
          <p className="text-sm text-gray-600 mb-4">
            Access your Supabase project directly:
          </p>
          <a
            href="https://supabase.com/dashboard/project/sjgtggywbsdgnfvcqxqs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ExternalLink size={20} />
            Open Supabase Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
