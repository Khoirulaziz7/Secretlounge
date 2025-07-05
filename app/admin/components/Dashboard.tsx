'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  UsersIcon, 
  SpeakerWaveIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import StatsOverview from './StatsOverview';
import UsersManagement from './UsersManagement';
import BroadcastPanel from './BroadcastPanel';
import SettingsPanel from './SettingsPanel';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { id: 'stats', name: 'Statistik', icon: ChartBarIcon },
    { id: 'users', name: 'Pengguna', icon: UsersIcon },
    { id: 'broadcast', name: 'Broadcast', icon: SpeakerWaveIcon },
    { id: 'settings', name: 'Pengaturan', icon: Cog6ToothIcon },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <StatsOverview stats={stats} isLoading={isLoading} />;
      case 'users':
        return <UsersManagement user={user} />;
      case 'broadcast':
        return <BroadcastPanel user={user} />;
      case 'settings':
        return <SettingsPanel user={user} />;
      default:
        return <StatsOverview stats={stats} isLoading={isLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  Admin Panel
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600">
                    {user.first_name?.charAt(0) || user.username?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.first_name || user.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.is_owner ? 'Owner' : 'Admin'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}