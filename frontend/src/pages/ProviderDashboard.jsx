import { useState } from 'react';
import Slots from './provider/Slots';
import Referrals from './provider/Referrals';
import Events from './provider/Events';
import Analytics from './provider/Analytics';

const TABS = [
  { key: 'slots', label: 'Slots', component: <Slots /> },
  { key: 'referrals', label: 'Referrals', component: <Referrals /> },
  { key: 'events', label: 'Events', component: <Events /> },
  { key: 'analytics', label: 'Analytics', component: <Analytics /> },
];

function ProviderDashboard() {
  const [tab, setTab] = useState('slots');

  return (
    <div className="space-y-6 font-sans bg-background text-text-primary p-4">
      <h1 className="text-2xl font-bold text-slots-accent mb-2">Provider Dashboard</h1>
      <div className="flex gap-2 border-b border-neutral-gray mb-4">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`px-4 py-2 -mb-px border-b-2 font-medium transition-colors ${tab === t.key ? 'border-slots-accent text-slots-accent' : 'border-transparent text-neutral-gray hover:text-slots-accent hover:border-slots-accent-hover'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>
        {TABS.find(t => t.key === tab)?.component}
      </div>
    </div>
  );
}

export default ProviderDashboard;


