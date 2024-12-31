import React, { useState, useRef, useEffect } from 'react';
import { Container, Form } from 'react-bootstrap';
import { ChatMessage } from '../usecase/chat/types';
import { PersonCircle, ChatDots, Paperclip, Send } from 'react-bootstrap-icons';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => Promise<boolean>;
  currentUserId: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, currentUserId }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const success = await onSendMessage(newMessage);
      if (success) {
        setNewMessage('');
      }
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Container className="d-flex flex-column h-100 p-0" style={{ backgroundColor: '#1F2335' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center px-3 py-2" style={{ backgroundColor: '#161929' }}>
        <span className="fw-medium fs-5 text-white">Chats</span>
        <ChatDots size={24} color="white" />
      </div>

      {/* Messages Container */}
      <div className="flex-grow-1 overflow-auto px-3 py-2" style={{ maxHeight: 'calc(100vh - 140px)' }}>
        {messages.map((msg) => (
          <div key={msg.id} className="d-flex mb-3 align-items-center">
            <PersonCircle size={35} className="me-2" color="white" />
            <div className="d-flex align-items-center" style={{ flex: 1 }}>
              <div 
                className="py-2 px-3 m-1" 
                style={{ 
                  backgroundColor: '#161929',
                  color: 'white',
                  flex: 1,
                  borderRadius: '16px'
                }}
              >
                <div className="mb-1" style={{ fontSize: '10px', color: '#6c757d' }}>
                  {msg.senderId === currentUserId ? 'You' : msg.senderName}
                </div>
                <div style={{ wordBreak: 'break-word', fontSize: '15px' }}>
                  {msg.content}
                </div>
              </div>
              <span className="ms-2" style={{ fontSize: '10px', color: '#6c757d' }}>
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3">
        <Form onSubmit={handleSubmit}>
          <div 
            className="d-flex align-items-center" 
            style={{ 
              backgroundColor: '#1C1F2E',
              borderRadius: '30px',
              padding: '6px 8px 6px 16px'
            }}
          >
            <Paperclip 
              size={24} 
              color="#6c757d" 
              // className="me-3" 
              style={{ cursor: 'pointer' }} 
            />
            <Form.Control
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="border-0 bg-transparent text-white"
              style={{ 
                boxShadow: 'none',
                fontSize: '16px',
              }}
            />
            <div 
              onClick={handleSubmit}
              style={{ 
                cursor: 'pointer',
                backgroundColor: '#1A71FF',
                minWidth: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // marginLeft: '16px'
              }}
            >
              <Send size={18} color="white" />
            </div>
          </div>
        </Form>
      </div>
    </Container>
  );
};