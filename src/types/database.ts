// Database types for Supabase

export type ProjectStatus =
  | 'discovery'
  | 'analysis'
  | 'review_findings'
  | 'documentation'
  | 'prd_creation'
  | 'review_prd'
  | 'task_breakdown'
  | 'development'
  | 'review_qa'
  | 'user_testing'
  | 'iteration'
  | 'completed'
  | 'on_hold';

export type InterviewStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'transcribed'
  | 'analyzed';

export type TaskStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'done';

export type TaskType =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'api'
  | 'ui_design'
  | 'qa'
  | 'analytics'
  | 'integration';

export type FindingType =
  | 'pain_point'
  | 'opportunity'
  | 'process_gap'
  | 'automation_candidate'
  | 'integration_need'
  | 'user_request';

export type SolutionType =
  | 'existing_tool'
  | 'custom_build'
  | 'integration'
  | 'automation'
  | 'process_change';

export type AssetType =
  | 'findings_report'
  | 'slide_deck'
  | 'prd'
  | 'wireframe'
  | 'prototype'
  | 'code'
  | 'design';

export interface Organization {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  organization_id: string | null;
  name: string;
  description: string | null;
  status: ProjectStatus;
  findings_approved: boolean;
  findings_approved_at: string | null;
  prd_approved: boolean;
  prd_approved_at: string | null;
  qa_approved: boolean;
  qa_approved_at: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  organization?: Organization;
}

export interface Stakeholder {
  id: string;
  organization_id: string | null;
  name: string;
  role: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  interview_priority: number;
  notes: string | null;
  created_at: string;
}

export interface Interview {
  id: string;
  project_id: string | null;
  stakeholder_id: string | null;
  elevenlabs_conversation_id: string | null;
  elevenlabs_agent_id: string | null;
  interview_url: string | null;
  interview_type: string | null;
  status: InterviewStatus;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  transcript_raw: any | null;
  transcript_text: string | null;
  analysis_summary: string | null;
  key_quotes: any | null;
  created_at: string;
  updated_at: string;
  stakeholder?: Stakeholder;
}

export interface Finding {
  id: string;
  project_id: string | null;
  interview_id: string | null;
  finding_type: FindingType;
  title: string;
  description: string;
  impact_level: number;
  frequency: number;
  supporting_quotes: any | null;
  affected_stakeholders: any | null;
  business_area: string | null;
  process_name: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Solution {
  id: string;
  project_id: string | null;
  finding_id: string | null;
  solution_type: SolutionType;
  name: string;
  description: string;
  vendor_name: string | null;
  vendor_url: string | null;
  estimated_cost: string | null;
  complexity_level: number | null;
  estimated_hours: number | null;
  priority_score: number;
  roi_estimate: string | null;
  research_notes: string | null;
  pros: any | null;
  cons: any | null;
  alternatives: any | null;
  created_at: string;
  updated_at: string;
}

export interface PRD {
  id: string;
  project_id: string | null;
  solution_id: string | null;
  title: string;
  version: number;
  status: string;
  executive_summary: string | null;
  problem_statement: string | null;
  goals_and_metrics: any | null;
  user_stories: any | null;
  functional_requirements: any | null;
  technical_requirements: any | null;
  non_functional_requirements: any | null;
  user_flows: any | null;
  dependencies_and_risks: any | null;
  launch_plan: any | null;
  full_content: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  prd_id: string | null;
  project_id: string | null;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  task_type: TaskType;
  status: TaskStatus;
  story_points: number | null;
  estimated_hours: number | null;
  depends_on: string[] | null;
  blocks: string[] | null;
  sprint_number: number | null;
  priority: number;
  acceptance_criteria: any | null;
  linear_issue_id: string | null;
  linear_issue_url: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  project_id: string | null;
  asset_type: AssetType;
  name: string;
  description: string | null;
  file_path: string | null;
  google_drive_id: string | null;
  google_drive_url: string | null;
  figma_file_id: string | null;
  figma_url: string | null;
  version: number;
  previous_version_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserTest {
  id: string;
  project_id: string | null;
  prd_id: string | null;
  elevenlabs_conversation_id: string | null;
  elevenlabs_agent_id: string | null;
  test_url: string | null;
  tester_name: string | null;
  tester_email: string | null;
  status: string;
  transcript_text: string | null;
  feedback_summary: string | null;
  issues_found: any | null;
  suggestions: any | null;
  satisfaction_score: number | null;
  scheduled_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface FeedbackItem {
  id: string;
  user_test_id: string | null;
  project_id: string | null;
  feedback_type: string | null;
  severity: string | null;
  title: string;
  description: string | null;
  resulted_in_task_id: string | null;
  resulted_in_prd_update: boolean;
  created_at: string;
}

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Partial<Organization>;
        Update: Partial<Organization>;
      };
      projects: {
        Row: Project;
        Insert: Partial<Project>;
        Update: Partial<Project>;
      };
      stakeholders: {
        Row: Stakeholder;
        Insert: Partial<Stakeholder>;
        Update: Partial<Stakeholder>;
      };
      interviews: {
        Row: Interview;
        Insert: Partial<Interview>;
        Update: Partial<Interview>;
      };
      findings: {
        Row: Finding;
        Insert: Partial<Finding>;
        Update: Partial<Finding>;
      };
      solutions: {
        Row: Solution;
        Insert: Partial<Solution>;
        Update: Partial<Solution>;
      };
      prds: {
        Row: PRD;
        Insert: Partial<PRD>;
        Update: Partial<PRD>;
      };
      tasks: {
        Row: Task;
        Insert: Partial<Task>;
        Update: Partial<Task>;
      };
      assets: {
        Row: Asset;
        Insert: Partial<Asset>;
        Update: Partial<Asset>;
      };
      user_tests: {
        Row: UserTest;
        Insert: Partial<UserTest>;
        Update: Partial<UserTest>;
      };
      feedback_items: {
        Row: FeedbackItem;
        Insert: Partial<FeedbackItem>;
        Update: Partial<FeedbackItem>;
      };
    };
  };
}
