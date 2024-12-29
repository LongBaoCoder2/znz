import { Socket } from "socket.io-client";
import { ChatMessage, ChatResponse } from "./types";

export class ChatService {
  private socket: Socket;
  private messageListeners: ((message: ChatMessage) => void)[] = [];

  constructor(socket: Socket) {
    this.socket = socket;
    this.setupListeners();
  }

  private setupListeners() {
    this.socket.on('chat:message', (message: ChatMessage) => {
      this.messageListeners.forEach(listener => listener(message));
    });
  }

  public addMessageListener(listener: (message: ChatMessage) => void) {
    this.messageListeners.push(listener);
  }

  public removeMessageListener(listener: (message: ChatMessage) => void) {
    const index = this.messageListeners.indexOf(listener);
    if (index > -1) {
      this.messageListeners.splice(index, 1);
    }
  }

  public async sendMessage(content: string): Promise<ChatResponse<ChatMessage>> {
    return new Promise((resolve) => {
      this.socket.emit('chat:message', { content }, (response: ChatResponse<ChatMessage>) => {
        resolve(response);
      });
    });
  }

  public async getChatHistory(): Promise<ChatResponse<ChatMessage>> {
    return new Promise((resolve) => {
      this.socket.emit('chat:history', (response: ChatResponse<ChatMessage>) => {
        resolve(response);
      });
    });
  }

  public dispose() {
    this.messageListeners = [];
    this.socket.off('chat:message');
  }
}
