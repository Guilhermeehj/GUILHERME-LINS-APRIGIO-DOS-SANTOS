import React, { useState, useEffect } from 'react';
import { MessageSquare, Image as ImageIcon, Music, Calculator, Menu } from 'lucide-react';
import { Chat } from './components/Chat';
import { ImageGen } from './components/ImageGen';
import { MusicTheory } from './components/MusicTheory';
import { InventoryCalculator } from './components/InventoryCalculator';

// Augment window for the AI Studio key selection
declare global {
  interface AIStudio {
    openSelectKey: () => Promise<void>;
    hasSelectedApiKey: () => Promise<boolean>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

enum Tab {
  CHAT = 'Chat',
  IMAGE = 'Image Studio',
  MUSIC = 'Music Theory',
  CALCULATOR = 'Red Calc'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CHAT);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.CHAT: return <Chat />;
      case Tab.IMAGE: return <ImageGen />;
      case Tab.MUSIC: return <MusicTheory />;
      case Tab.CALCULATOR: return <InventoryCalculator />;
      default: return <Chat />;
    }
  };

  const NavItem = ({ tab, icon: Icon }: { tab: Tab; icon: React.ElementType }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full md:w-auto ${
        activeTab === tab 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{tab}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="p-6 border-b border-slate-800">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                MuseAI
            </h1>
            <p className="text-xs text-slate-500 mt-1">Creative Suite</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            <NavItem tab={Tab.CHAT} icon={MessageSquare} />
            <NavItem tab={Tab.IMAGE} icon={ImageIcon} />
            <NavItem tab={Tab.MUSIC} icon={Music} />
            <NavItem tab={Tab.CALCULATOR} icon={Calculator} />
        </nav>
        <div className="p-4 border-t border-slate-800 text-xs text-slate-600 text-center">
            Powered by Gemini Pro
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
            <span className="font-bold text-lg text-indigo-400">MuseAI</span>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300">
                <Menu size={24} />
            </button>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-slate-900 border-b border-slate-800 z-50 p-4 space-y-2 shadow-2xl">
                <NavItem tab={Tab.CHAT} icon={MessageSquare} />
                <NavItem tab={Tab.IMAGE} icon={ImageIcon} />
                <NavItem tab={Tab.MUSIC} icon={Music} />
                <NavItem tab={Tab.CALCULATOR} icon={Calculator} />
            </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden p-4 md:p-6 bg-slate-950 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />
            <div className="relative h-full z-10">
                {renderContent()}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;