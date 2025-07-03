"use client";
import { createContext, useContext, useState } from 'react';

const UserContext = createContext({ userName: '', setUserName: (name: string) => {} });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState('');
  return (
    <UserContext.Provider value={{ userName, setUserName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
