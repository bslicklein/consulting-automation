import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { createElevenLabsClient } from '@/lib/elevenlabs';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const elevenlabs = createElevenLabsClient();
    
    const agentId = process.env.ELEVENLABS_INTERVIEW_AGENT_ID;
    
    if (!agentId) {
      return NextResponse.json(
        { error: 'ELEVENLABS_INTERVIEW_AGENT_ID not configured' },
        { status: 500 }
      );
    }

    // Fetch all conversations from ElevenLabs
    const { conversations } = await elevenlabs.listConversations(agentId);

    // Get existing conversation IDs from Supabase
    const { data: existingInterviews } = await supabase
      .from('interviews')
      .select('elevenlabs_conversation_id')
      .not('elevenlabs_conversation_id', 'is', null);

    const existingIds = new Set(
      existingInterviews?.map(i => i.elevenlabs_conversation_id) || []
    );

    // Find new conversations
    const newConversations = conversations.filter(
      c => !existingIds.has(c.conversation_id)
    );

    const results = {
      synced: 0,
      updated: 0,
      errors: [] as string[],
    };

    // Process each new conversation
    for (const conv of newConversations) {
      try {
        // Fetch full conversation with transcript
        const fullConv = await elevenlabs.getConversation(conv.conversation_id);
        const transcriptText = await elevenlabs.getTranscriptText(conv.conversation_id);

        // Check if there's an existing interview waiting for this conversation
        const { data: pendingInterview } = await supabase
          .from('interviews')
          .select('*')
          .eq('elevenlabs_agent_id', agentId)
          .is('elevenlabs_conversation_id', null)
          .eq('status', 'scheduled')
          .order('scheduled_at', { ascending: true })
          .limit(1)
          .single();

        if (pendingInterview) {
          // Update existing interview with transcript
          await supabase
            .from('interviews')
            .update({
              elevenlabs_conversation_id: conv.conversation_id,
              transcript_raw: fullConv.transcript,
              transcript_text: transcriptText,
              status: 'transcribed',
              started_at: conv.start_time,
              ended_at: fullConv.end_time,
            })
            .eq('id', pendingInterview.id);

          results.updated++;
        } else {
          // Create new interview record (unlinked to a project for now)
          await supabase
            .from('interviews')
            .insert({
              elevenlabs_conversation_id: conv.conversation_id,
              elevenlabs_agent_id: agentId,
              transcript_raw: fullConv.transcript,
              transcript_text: transcriptText,
              status: 'transcribed',
              interview_type: 'discovery',
              started_at: conv.start_time,
              ended_at: fullConv.end_time,
            });

          results.synced++;
        }
      } catch (error) {
        results.errors.push(`Failed to sync ${conv.conversation_id}: ${error}`);
      }
    }

    // Also update any existing interviews that are missing transcripts
    const { data: incompleteInterviews } = await supabase
      .from('interviews')
      .select('*')
      .not('elevenlabs_conversation_id', 'is', null)
      .is('transcript_text', null);

    for (const interview of incompleteInterviews || []) {
      try {
        const transcriptText = await elevenlabs.getTranscriptText(
          interview.elevenlabs_conversation_id!
        );
        const fullConv = await elevenlabs.getConversation(
          interview.elevenlabs_conversation_id!
        );

        await supabase
          .from('interviews')
          .update({
            transcript_raw: fullConv.transcript,
            transcript_text: transcriptText,
            status: 'transcribed',
          })
          .eq('id', interview.id);

        results.updated++;
      } catch (error) {
        results.errors.push(`Failed to update ${interview.id}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${results.synced} new, updated ${results.updated} existing`,
      ...results,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync with ElevenLabs', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to check sync status
export async function GET() {
  try {
    const elevenlabs = createElevenLabsClient();
    const agentId = process.env.ELEVENLABS_INTERVIEW_AGENT_ID;

    if (!agentId) {
      return NextResponse.json(
        { error: 'ELEVENLABS_INTERVIEW_AGENT_ID not configured' },
        { status: 500 }
      );
    }

    const { conversations } = await elevenlabs.listConversations(agentId);

    return NextResponse.json({
      agentId,
      totalConversations: conversations.length,
      interviewUrl: elevenlabs.getInterviewUrl(agentId),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ElevenLabs status', details: String(error) },
      { status: 500 }
    );
  }
}
