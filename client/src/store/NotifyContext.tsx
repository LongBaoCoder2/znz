import React, { createContext, useContext, useState } from 'react';

type NotifyType = 'error' | 'success';

interface NotifyContextType {
  showMessage: (title: string, message: string, type: NotifyType) => void;
  hideMessage: () => void;
  title: string;
  isVisible: boolean;
  message: string;
  type: NotifyType;
}

const NotifyContext = createContext<NotifyContextType | undefined>(undefined);

export function NotifyProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotifyType>('success');
  const [title, setTitle] = useState<string>('');

  const showMessage = (title: string, message: string, type: NotifyType) => {
    setTitle(title);
    setMessage(message);
    setType(type);
    setIsVisible(true);
  };

  const hideMessage = () => {
    setIsVisible(false);
  };

  return (
    <NotifyContext.Provider value={{ showMessage, hideMessage, title, isVisible, message, type }}>
      {children}
    </NotifyContext.Provider>
  );
}

export function useNotify() {
  const context = useContext(NotifyContext);
  if (context === undefined) {
    throw new Error('useNotify must be used within a NotifyProvider');
  }
  return context;
}
