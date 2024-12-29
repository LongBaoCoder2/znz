import React, { useState, useRef, useEffect } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { ChatMessage } from '../usecase/chat/types';

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

  return (
    <Container className="p-0 h-100 d-flex flex-column">
      <div className="flex-grow-1 overflow-auto mb-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {messages.map((msg) => (
          <Card 
            key={msg.id}
            className={`mb-2 ${msg.senderId === currentUserId ? 'ms-auto' : 'me-auto'}`}
            style={{ maxWidth: '75%', backgroundColor: msg.senderId === currentUserId ? '#007bff' : '#f8f9fa' }}
          >
            <Card.Body className="p-2">
              <div className="d-flex flex-column">
                <small className="text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                  {msg.senderId === currentUserId ? 'You' : msg.senderName}
                </small>
                <div style={{ 
                  color: msg.senderId === currentUserId ? 'white' : 'black',
                  wordBreak: 'break-word'
                }}>
                  {msg.content}
                </div>
                <small className="text-muted mt-1 align-self-end" style={{ fontSize: '0.7rem' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </small>
              </div>
            </Card.Body>
          </Card>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <Form onSubmit={handleSubmit} className="mt-auto">
        <div className="d-flex">
          <Form.Control
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="me-2"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            Send
          </Button>
        </div>
      </Form>
    </Container>
  );
};
