// ElevenLabs Conversational AI API Client

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

interface ElevenLabsMessage {
  role: 'user' | 'agent';
  message: string;
  timestamp?: string;
}

interface ElevenLabsConversation {
  conversation_id: string;
  agent_id: string;
  status: string;
  transcript: ElevenLabsMessage[];
  metadata?: Record<string, any>;
  start_time?: string;
  end_time?: string;
}

interface ElevenLabsConversationList {
  conversations: Array<{
    conversation_id: string;
    agent_id: string;
    status: string;
    start_time: string;
  }>;
}

export class ElevenLabsClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${ELEVENLABS_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // List all conversations for an agent
  async listConversations(agentId?: string): Promise<ElevenLabsConversationList> {
    const params = agentId ? `?agent_id=${agentId}` : '';
    return this.fetch<ElevenLabsConversationList>(`/convai/conversations${params}`);
  }

  // Get a specific conversation with transcript
  async getConversation(conversationId: string): Promise<ElevenLabsConversation> {
    return this.fetch<ElevenLabsConversation>(`/convai/conversations/${conversationId}`);
  }

  // Get transcript as formatted text
  async getTranscriptText(conversationId: string): Promise<string> {
    const conversation = await this.getConversation(conversationId);
    
    if (!conversation.transcript || conversation.transcript.length === 0) {
      return '';
    }

    return conversation.transcript
      .map((msg) => {
        const speaker = msg.role === 'agent' ? 'Interviewer' : 'Stakeholder';
        return `${speaker}: ${msg.message}`;
      })
      .join('\n\n');
  }

  // Get shareable interview URL
  getInterviewUrl(agentId: string): string {
    return `https://elevenlabs.io/app/talk-to?agent_id=${agentId}`;
  }
}

// Factory function for server-side use
export function createElevenLabsClient(): ElevenLabsClient {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable not set');
  }
  return new ElevenLabsClient(apiKey);
}
