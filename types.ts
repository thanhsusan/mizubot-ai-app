export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'error';
  timestamp: number;
  isStreaming?: boolean;
}

export interface GroundingChunk {
  web?: {
    uri?: string; // Made optional
    title?: string; // Made optional
  };
  retrievedContext?: {
    uri?: string; // Made optional
    title?: string; // Made optional
  };
  // Add other potential grounding chunk types if needed
}

export type UserRole = 'customer' | 'employee';
