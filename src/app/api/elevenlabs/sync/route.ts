import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize clients directly to avoid type issues
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY!;
const interviewAgentId = process.env.ELEVENLABS_INTERVIEW_AGENT_ID!;

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// ElevenLabs API helpers
async function fetchElevenLabs(endpoint: string) {
  const response = await fetch(`${ELEVENLABS_BASE_URL}${endpoint}`, {
    headers: {
      'xi-api-key': elevenLabsApiKey,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status}`);
  }
  
  return response.json();
}

async function getConversations(agentId: string) {
  const data = await fetchElevenLabs(`/convai/conversations?agent_id=${agentId}`);
  return data.conversations || [];
}

async function getConversation(conversationId: string) {
  return fetchElevenLabs(`/convai/conversations/${conversationId}`);
}

function formatTranscript(transcript: Array<{ role: string; message: string }>): string {
  if (!transcript || transcript.length === 0) return '';
  
  return transcript
    .map((msg) => {
      const speaker = msg.role === 'agent' ? 'Interviewer' : 'Stakeholder';
      return `${speaker}: ${msg.message}`;
    })
    .join('\n\n');
}

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }
    
    if (!elevenLabsApiKey || !interviewAgentId) {
      return NextResponse.json(
        { error: 'ElevenLabs not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all conversations from ElevenLabs
    const conversations = await getConversations(interviewAgentId);

    // Get existing conversation IDs from Supabase
    const { data: existingInterviews, error: fetchError } = await supabase
      .from('interviews')
      .select('elevenlabs_conversation_id')
      .not('elevenlabs_conversation_id', 'is', null);

    if (fetchError) {
      console.error('Error fetching existing interviews:', fetchError);
    }

    // Create set of existing IDs
    const existingIds = new Set<string>();
    if (existingInterviews) {
      for (const interview of existingInterviews) {
        const convId = (interview as { elevenlabs_conversation_id: string | null }).elevenlabs_conversation_id;
        if (convId) {
          existingIds.add(convId);
        }
      }
    }

    // Find new conversations
    const newConversations = conversations.filter(
      (c: { conversation_id: string }) => !existingIds.has(c.conversation_id)
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
        const fullConv = await getConversation(conv.conversation_id);
        const transcriptText = formatTranscript(fullConv.transcript || []);

        // Create new interview record
        const { error: insertError } = await supabase
          .from('interviews')
          .insert({
            elevenlabs_conversation_id: conv.conversation_id,
            elevenlabs_agent_id: interviewAgentId,
            transcript_raw: fullConv.transcript,
            transcript_text: transcriptText,
            status: 'transcribed',
            interview_type: 'discovery',
            started_at: conv.start_time || null,
            ended_at: fullConv.end_time || null,
          });

        if (insertError) {
          results.errors.push(`Failed to insert ${conv.conversation_id}: ${insertError.message}`);
        } else {
          results.synced++;
        }
      } catch (error) {
        results.errors.push(`Failed to sync ${conv.conversation_id}: ${error}`);
      }
    }

    // Update any existing interviews that are missing transcripts
    const { data: incompleteInterviews } = await supabase
      .from('interviews')
      .select('id, elevenlabs_conversation_id')
      .not('elevenlabs_conversation_id', 'is', null)
      .is('transcript_text', null);

    if (incompleteInterviews) {
      for (const interview of incompleteInterviews) {
        const rec = interview as { id: string; elevenlabs_conversation_id: string | null };
        if (!rec.elevenlabs_conversation_id) continue;
        
        try {
          const fullConv = await getConversation(rec.elevenlabs_conversation_id);
          const transcriptText = formatTranscript(fullConv.transcript || []);

          const { error: updateError } = await supabase
            .from('interviews')
            .update({
              transcript_raw: fullConv.transcript,
              transcript_text: transcriptText,
              status: 'transcribed',
            })
            .eq('id', rec.id);

          if (!updateError) {
            results.updated++;
          }
        } catch (error) {
          results.errors.push(`Failed to update ${rec.id}: ${error}`);
        }
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
    if (!elevenLabsApiKey || !interviewAgentId) {
      return NextResponse.json(
        { error: 'ElevenLabs not configured' },
        { status: 500 }
      );
    }

    const conversations = await getConversations(interviewAgentId);
    const interviewUrl = `https://elevenlabs.io/app/talk-to?agent_id=${interviewAgentId}`;

    return NextResponse.json({
      agentId: interviewAgentId,
      totalConversations: conversations.length,
      interviewUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ElevenLabs status', details: String(error) },
      { status: 500 }
    );
  }
}
