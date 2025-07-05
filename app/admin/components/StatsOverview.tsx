'use client';

import { 
  UsersIcon, 
  ChatBubbleLeftRightIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  TrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StatsOverviewProps {
  stats: any;
  isLoading: boolean;
}

export default function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Gagal memuat statistik</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Pengguna',
      value: stats.totalUsers,
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pengguna Aktif',
      value: stats.activeUsers,
      icon: TrendingUpIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Pesan',
      value: stats.totalMessages,
      icon: ChatBubbleLeftRightIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Pengguna Banned',
      value: stats.bannedUsers,
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  // Chart data for daily messages
  const chartData = {
    labels: stats.dailyStats?.map((item: any) => {
      const date = new Date(item.date);
      return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'Pesan per Hari',
        data: stats.dailyStats?.map((item: any) => item.messages) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Aktivitas Pesan 7 Hari Terakhir',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Grafik Aktivitas
          </h3>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Users */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pengguna Terbaru
          </h3>
          <div className="space-y-3">
            {stats.recentUsers?.slice(0, 5).map((user: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {user.first_name?.charAt(0) || user.username?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.first_name || user.username || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {user.id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(user.join_date).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">Tidak ada data</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <ShieldCheckIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Admin</p>
          <p className="text-xl font-bold text-gray-900">{stats.adminUsers}</p>
        </div>
        
        <div className="card text-center">
          <ChatBubbleLeftRightIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Pesan Hari Ini</p>
          <p className="text-xl font-bold text-gray-900">{stats.todayMessages}</p>
        </div>
        
        <div className="card text-center">
          <ClockIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Uptime</p>
          <p className="text-xl font-bold text-gray-900">99.9%</p>
        </div>
      </div>
    </div>
  );
}