export interface ChatEventMap {
  'chat:message': (data: { content: string }, callback: (response: ChatResponse<ChatMessage>) => void) => void;
  'chat:history': (callback: (response: ChatResponse<ChatMessage[]>) => void) => void;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

export interface ChatResponse<T> {
  success?: boolean;
  error?: string;
  message?: T;
  messages?: T[];
}
