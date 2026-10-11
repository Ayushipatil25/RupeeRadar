import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardShell } from './pages/DashboardShell';
import { TransactionsPage } from './pages/TransactionsPage';
import { SavingsPage } from './pages/SavingsPage';
import { BillsPage } from './pages/BillsPage';
import { FutureCastPage } from './pages/FutureCastPage';

export function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  const getPageInfo = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Financial Overview',
          subtitle: 'Here’s your financial overview.',
        };
      case 'futurecast':
        return {
          title: 'FutureCast Decision Simulator',
          subtitle: 'Predict the financial ripple effect of purchases before spending',
        };
      case 'transactions':
        return {
          title: 'Transactions & Spending',
          subtitle: 'Detailed ledger and expense categorization',
        };
      case 'savings':
        return {
          title: 'Savings Goals',
          subtitle: 'Locked emergency cushions and milestone targets',
        };
      case 'commitments':
        return {
          title: 'Bills & Subscriptions',
          subtitle: 'Fixed recurring commitments and due day tracker',
        };
      default:
        return {
          title: 'RupeeRadar',
          subtitle: '30-Day Budget Intelligence',
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex min-h-screen bg-[#0B0F0E] text-[#F2F5F0]">
      {/* Desktop Navigation */}
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} subtitle={subtitle} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardShell onNavigateToTab={setCurrentTab} />
          )}

          {currentTab === 'futurecast' && (
            <FutureCastPage onNavigateToTab={setCurrentTab} />
          )}

          {currentTab === 'transactions' && <TransactionsPage />}

          {currentTab === 'savings' && <SavingsPage />}

          {currentTab === 'commitments' && <BillsPage />}
        </main>

        {/* Mobile Navigation */}
        <MobileNav currentTab={currentTab} onTabChange={setCurrentTab} />
      </div>
    </div>
  );
}

export default App;
