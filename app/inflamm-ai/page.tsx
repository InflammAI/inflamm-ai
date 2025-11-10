'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { WalletGate } from './components/WalletGate/WalletGate';
import { VyTapScreen } from './modules/vytap/VyTapScreen';
import { VitalsyncScreen } from './modules/vitalsync/VitalsyncScreen';
import { ChatScreen } from './modules/chat/ChatScreen';
import { SciCastScreen } from './modules/scicast/SciCastScreen';
import { BlogScreen } from './modules/blog/BlogScreen';
import { SolanaWalletProvider } from './providers/SolanaWalletProvider';
import { NeuralBackground } from './components/Background/NeuralBackground';
import './styles/tokens.css';

export default function InflammAIPage() {
  const [activeModule, setActiveModule] = useState('vytap');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const renderModule = () => {
    switch (activeModule) {
      case 'vytap':
        return (
          <WalletGate>
            <VyTapScreen />
          </WalletGate>
        );
      case 'vitalsync':
        return (
          <WalletGate>
            <VitalsyncScreen />
          </WalletGate>
        );
      case 'chat':
        return (
          <WalletGate>
            <ChatScreen />
          </WalletGate>
        );
      case 'scicast':
        return (
          <WalletGate>
            <SciCastScreen />
          </WalletGate>
        );
      case 'blog':
        return (
          <WalletGate>
            <BlogScreen />
          </WalletGate>
        );
      default:
        return (
          <WalletGate>
            <VyTapScreen />
          </WalletGate>
        );
    }
  };

  return (
    <SolanaWalletProvider>
      <NeuralBackground />
      <div className="flex h-screen bg-[var(--bg)] overflow-hidden relative">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar
            activeModule={activeModule}
            onNavigate={setActiveModule}
            collapsed={sidebarCollapsed}
          />
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && showMobileSidebar && (
          <>
            <div
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setShowMobileSidebar(false)}
            />
            <div className="fixed left-0 top-0 bottom-0 z-50">
              <Sidebar
                activeModule={activeModule}
                onNavigate={(module) => {
                  setActiveModule(module);
                  setShowMobileSidebar(false);
                }}
                collapsed={false}
              />
            </div>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          <Header
            onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
            sidebarCollapsed={sidebarCollapsed}
          />
          
          <main className="flex-1 overflow-y-auto relative z-10">
            {renderModule()}
          </main>

          {/* Mobile bottom navigation */}
          {isMobile && (
            <nav className="fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-gray-800 z-30">
              <div className="flex justify-around h-16">
                {[
                  { id: 'vytap', label: 'VyTap', icon: '❤️' },
                  { id: 'vitalsync', label: 'Vitals', icon: '💓' },
                  { id: 'chat', label: 'Chat', icon: '💬' },
                  { id: 'scicast', label: 'SciCast', icon: '📊' },
                  { id: 'blog', label: 'Blog', icon: '📝' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    className={`flex flex-col items-center justify-center flex-1 transition-colors ${
                      activeModule === item.id
                        ? 'text-[var(--accent-orange)]'
                        : 'text-[var(--muted)]'
                    }`}
                    style={{ minHeight: 'var(--touch-target-min)' }}
                  >
                    <span className="text-xl mb-1">{item.icon}</span>
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          )}
        </div>
      </div>
    </SolanaWalletProvider>
  );
}
