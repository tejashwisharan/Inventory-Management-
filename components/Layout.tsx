import React from 'react';
import { LayoutDashboard, Package, TrendingUp, Settings, Menu, Zap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Package className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold text-slate-800">Nexus OS</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activePage === 'dashboard'} 
            onClick={() => onNavigate('dashboard')} 
          />
          <SidebarItem 
            icon={Package} 
            label="Inventory" 
            active={activePage === 'inventory' || activePage.startsWith('product')} 
            onClick={() => onNavigate('inventory')} 
          />
          <SidebarItem 
            icon={TrendingUp} 
            label="Forecasting" 
            active={activePage === 'forecasting'} 
            onClick={() => onNavigate('forecasting')} 
          />
          <SidebarItem 
            icon={Zap} 
            label="AI Analyst" 
            active={activePage === 'ai-analyst'} 
            onClick={() => onNavigate('ai-analyst')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
             <div className="flex items-center space-x-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-slate-500">SYSTEM HEALTHY</span>
             </div>
             <p className="text-xs text-slate-400">Database v2.4.1 connected</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header - Mobile Only */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <span className="font-bold text-lg text-slate-800">Nexus OS</span>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
            <Menu size={24} />
          </button>
        </header>

         {/* Mobile Menu Overlay */}
         {mobileMenuOpen && (
            <div className="absolute inset-0 z-50 bg-white p-4 md:hidden">
                <button onClick={() => setMobileMenuOpen(false)} className="mb-4 text-slate-500">Close</button>
                <nav className="space-y-4">
                    <button onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }} className="block text-xl font-medium">Dashboard</button>
                    <button onClick={() => { onNavigate('inventory'); setMobileMenuOpen(false); }} className="block text-xl font-medium">Inventory</button>
                    <button onClick={() => { onNavigate('forecasting'); setMobileMenuOpen(false); }} className="block text-xl font-medium">Forecasting</button>
                    <button onClick={() => { onNavigate('ai-analyst'); setMobileMenuOpen(false); }} className="block text-xl font-medium">AI Analyst</button>
                </nav>
            </div>
         )}

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
