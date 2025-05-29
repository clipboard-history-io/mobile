import React, { createContext, useContext } from 'react';
import { useClipboardHistory } from './ClipboardService';
import { useAuth } from '~/auth/AuthProvider';

const ClipboardContext = createContext<any>(null);

export const ClipboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {user} = useAuth()
  const clipboard = useClipboardHistory(user);

  return (
    <ClipboardContext.Provider value={clipboard}>{children}</ClipboardContext.Provider>
  );
};

export const useClipboard = () => useContext(ClipboardContext);
