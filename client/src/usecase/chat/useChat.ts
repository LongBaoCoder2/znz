import { useEffect, useState } from 'react';
import { ChatService } from './chat.service';
import { ChatMessage } from './types';

export const useChat = (chatService: ChatService) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (chatService) {
      const handleNewMessage = (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
      };
  
      chatService.addMessageListener(handleNewMessage);
      loadChatHistory();
  
      return () => {
        chatService.removeMessageListener(handleNewMessage);
      };
    }
  }, [chatService]);

  const loadChatHistory = async () => {
    setLoading(true);
    try {
      const response = await chatService.getChatHistory();
      if (response.success && response.messages) {
        setMessages(response.messages);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    try {
      const response = await chatService.sendMessage(content);
      if (response.success && response.message) {
        // @ts-ignore
        setMessages(prev => [...prev, response.message]);
        return true;
      } else if (response.error) {
        setError(response.error);
        return false;
      }
    } catch (err) {
      setError('Failed to send message');
      return false;
    }
    return false;
  };

  return {
    messages,
    error,
    loading,
    sendMessage
  };
};
