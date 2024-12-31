import { useEffect, useState } from 'react';
import '../styles/chat-notification.css';

interface ChatNotificationProps {
  user: string;
  message: string;
  onClose: () => void;
  onClick: () => void;
}

export const ChatNotification = ({ user, message, onClose, onClick }: ChatNotificationProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 3000);

    return () => clearTimeout(timeout);
  }, [onClose]);

  const handleClick = () => {
    onClick();
    onClose();
  };

  return (
    <div 
      className={`chat-notification ${isExiting ? 'exit' : ''}`}
      onClick={handleClick}
    >
      <div className="chat-notification-content">
        <div className="chat-notification-user">{user}</div>
        <div className="chat-notification-message">{message}</div>
      </div>
    </div>
  );
};

export const ChatNotificationContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="chat-notification-container">
      {children}
    </div>
  );
};
