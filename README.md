# Consulting Automation Dashboard

A Next.js web dashboard for managing your AI-powered consulting workflow.

## Features

- **Project Board** - Kanban-style view of all projects by status
- **Human Checkpoints** - Approve findings, PRDs, and QA with one click
- **ElevenLabs Sync** - Pull interview transcripts automatically
- **Status Tracking** - Visual progress through the workflow
- **Real-time Updates** - Powered by Supabase

## Quick Start

### 1. Install Dependencies

```bash
cd dashboard
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```bash
# Copy the example
cp .env.example .env.local
```

Then edit `.env.local` with your actual keys:

```bash
# Supabase (get from Supabase dashboard > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://sjgtggywbsdgnfvcqxqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_INTERVIEW_AGENT_ID=agent_0701kcjkqf7vehwvk0cj59h1b6r7
```

**Where to find your Supabase keys:**
1. Go to https://supabase.com/dashboard/project/sjgtggywbsdgnfvcqxqs
2. Click "Settings" (gear icon)
3. Click "API"
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY`

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### Creating a Project

1. Click "New Project" on the dashboard or projects page
2. Enter project name and optionally create/select an organization
3. Project starts in "Discovery" status

### Scheduling Interviews

1. Go to your project
2. Click "Schedule Interview"
3. Share the interview URL with stakeholders
4. They complete the voice interview via ElevenLabs

### Syncing Transcripts

1. Go to Settings
2. Click "Sync Transcripts"
3. Transcripts are pulled from ElevenLabs and saved to Supabase

### Approval Workflow

When a project reaches a review stage (Review Findings, Review PRD, Review QA):
1. A yellow banner appears on the project page
2. Review the content
3. Click the "Approve" button to advance to the next stage

## Project Structure

```
dashboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   └── elevenlabs/    # ElevenLabs sync endpoint
│   │   ├── projects/          # Project pages
│   │   │   ├── [id]/          # Project detail
│   │   │   └── new/           # New project form
│   │   ├── settings/          # Settings page
│   │   ├── layout.tsx         # Root layout with sidebar
│   │   └── page.tsx           # Dashboard home
│   ├── components/            # Reusable components
│   ├── lib/                   # Utilities
│   │   ├── supabase.ts       # Supabase client
│   │   └── elevenlabs.ts     # ElevenLabs client
│   └── types/                 # TypeScript types
│       └── database.ts       # Database schema types
├── package.json
└── README.md
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy

### Other Platforms

The app is a standard Next.js application and can be deployed to:
- Netlify
- Railway
- Render
- Any platform supporting Node.js

## Troubleshooting

### "ELEVENLABS_API_KEY not configured"
Make sure your `.env.local` file exists and contains the `ELEVENLABS_API_KEY`.

### "Failed to fetch projects"
Check that your Supabase keys are correct and the database schema has been applied.

### Transcripts not appearing
1. Verify the ElevenLabs API key has Conversational AI access
2. Check that interviews have been completed (not just scheduled)
3. Run the sync from Settings page

## Next Steps

After setting up the dashboard:
1. Create your first project
2. Share the interview URL with a test stakeholder
3. Complete a test interview
4. Sync transcripts
5. Run analysis (via Claude Code with the Transcript Analysis agent)
