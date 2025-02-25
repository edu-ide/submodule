import React from 'react';
import ChatBot from './ChatBot';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      {children}
      <ChatBot />
      <style>{`
        .layout {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default Layout; 