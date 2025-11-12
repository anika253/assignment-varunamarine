import { useState } from 'react';
import { RoutesTab } from './adapters/ui/tabs/RoutesTab';
import { CompareTab } from './adapters/ui/tabs/CompareTab';
import { BankingTab } from './adapters/ui/tabs/BankingTab';
import { PoolingTab } from './adapters/ui/tabs/PoolingTab';

const tabs = [
  { id: 'routes', label: 'Routes', component: RoutesTab },
  { id: 'compare', label: 'Compare', component: CompareTab },
  { id: 'banking', label: 'Banking', component: BankingTab },
  { id: 'pooling', label: 'Pooling', component: PoolingTab },
] as const;

type TabId = (typeof tabs)[number]['id'];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('routes');
  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component ?? RoutesTab;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">FuelEU Maritime Compliance</h1>
            <p className="mt-2 text-sm text-slate-300">
              Monitor route emissions, compliance balances, banking, and pooling under FuelEU regulation.
            </p>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-2 px-6 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <ActiveComponent />
      </main>
    </div>
  );
}

export default App;
