'use client';

import { useState, useEffect } from 'react';
import { 
  Cog6ToothIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface SettingsPanelProps {
  user: any;
}

export default function SettingsPanel({ user }: SettingsPanelProps) {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    // Load current settings if needed
    // This would typically fetch from an API
  }, []);

  const handleSaveWelcome = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveStatus('');

    try {
      // This would typically save to an API
      // For now, we'll simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pengaturan Bot</h2>
        <p className="mt-2 text-gray-600">
          Kelola pengaturan dan konfigurasi bot
        </p>
      </div>

      {/* Welcome Message Settings */}
      <div className="card">
        <div className="flex items-center mb-4">
          <DocumentTextIcon className="w-6 h-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Pesan Welcome</h3>
        </div>

        <form onSubmit={handleSaveWelcome} className="space-y-4">
          <div>
            <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 mb-2">
              Pesan Selamat Datang
            </label>
            <textarea
              id="welcomeMessage"
              rows={8}
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="input-field resize-none font-mono text-sm"
              placeholder="Masukkan pesan welcome yang akan ditampilkan kepada pengguna baru..."
            />
            <p className="mt-2 text-sm text-gray-500">
              Mendukung HTML formatting: &lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, &lt;code&gt;code&lt;/code&gt;
            </p>
          </div>

          <div className="flex items-center justify-between">
            {saveStatus && (
              <div className={`text-sm ${saveStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {saveStatus === 'success' ? '✅ Berhasil disimpan' : '❌ Gagal menyimpan'}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Bot Information */}
      <div className="card">
        <div className="flex items-center mb-4">
          <InformationCircleIcon className="w-6 h-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Informasi Bot</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Database</h4>
            <p className="text-sm text-gray-600">
              {process.env.NEXT_PUBLIC_DATABASE_TYPE === 'mongodb' ? 'MongoDB' : 'PostgreSQL'}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Environment</h4>
            <p className="text-sm text-gray-600">
              {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Bot Version</h4>
            <p className="text-sm text-gray-600">v3.0.0</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Last Updated</h4>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Admin Privileges */}
      <div className="card">
        <div className="flex items-center mb-4">
          <ShieldCheckIcon className="w-6 h-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Hak Akses</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Status Akun</h4>
              <p className="text-sm text-gray-600">
                {user.is_owner ? 'Owner Bot' : 'Administrator'}
              </p>
            </div>
            <span className={`badge ${user.is_owner ? 'badge-info' : 'badge-success'}`}>
              {user.is_owner ? 'Owner' : 'Admin'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-1">Kelola Pengguna</h4>
              <p className="text-xs text-gray-600">Ban, unban, dan kelola pengguna</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-1">Broadcast</h4>
              <p className="text-xs text-gray-600">Kirim pesan ke semua pengguna</p>
            </div>
            
            {user.is_owner && (
              <>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Kelola Admin</h4>
                  <p className="text-xs text-blue-600">Promote dan demote admin</p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Pengaturan Bot</h4>
                  <p className="text-xs text-blue-600">Akses penuh ke semua pengaturan</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone (Owner Only) */}
      {user.is_owner && (
        <div className="card border-red-200">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-red-600 text-sm">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-medium text-red-900 mb-2">Reset Bot Data</h4>
              <p className="text-sm text-red-700 mb-3">
                Menghapus semua data pengguna dan pesan. Tindakan ini tidak dapat dibatalkan.
              </p>
              <button className="btn-danger text-sm">
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}