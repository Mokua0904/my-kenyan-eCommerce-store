import React, { useState } from 'react';
import { BarChart2, TrendingUp, Package, Users } from 'lucide-react';
import AnalyticsOverview  from './AnalyticsOverview';
import AnalyticsSales     from './AnalyticsSales';
import AnalyticsProducts  from './AnalyticsProducts';
import AnalyticsCustomers from './AnalyticsCustomers';

const TABS = [
  { id: 'overview',   label: 'Overview',   icon: BarChart2,  component: AnalyticsOverview  },
  { id: 'sales',      label: 'Sales',      icon: TrendingUp, component: AnalyticsSales     },
  { id: 'products',   label: 'Products',   icon: Package,    component: AnalyticsProducts  },
  { id: 'customers',  label: 'Customers',  icon: Users,      component: AnalyticsCustomers },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component;

  return (
    <div className="w-full bg-[#F4EDE4] min-h-screen p-4 sm:p-6 lg:p-8">
      
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#4E3B2C]">Store Analytics</h1>
        <p className="text-[#7C6652] mt-1">Track your sales, products, and customers in real-time.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm overflow-hidden">
        
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-[#DCC7AA] bg-[#FAF6F0]">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all
                  border-b-2 
                  ${active 
                    ? 'border-[#A6754D] text-[#A6754D] bg-white' 
                    : 'border-transparent text-[#7C6652] hover:text-[#4E3B2C] hover:bg-[#F4EDE4]'
                  }
                `}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="text-center py-12 text-[#7C6652]">
              <p>Select a tab to view analytics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}