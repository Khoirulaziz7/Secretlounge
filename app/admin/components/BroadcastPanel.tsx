'use client';

import { useState, useEffect } from 'react';
import { 
  SpeakerWaveIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

interface BroadcastPanelProps {
  user: any;
}

export default function BroadcastPanel({ user }: BroadcastPanelProps) {
  const [message, setMessage] = useState('');
  const [delay, setDelay] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);
  const [broadcastsLoading, setBroadcastsLoading] = useState(true);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    setBroadcastsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/broadcast', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBroadcasts(data.broadcasts);
      }
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
    } finally {
      setBroadcastsLoading(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      alert('Pesan tidak boleh kosong');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message, delay }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Broadcast dimulai ke ${data.totalUsers} pengguna`);
        setMessage('');
        setDelay(0);
        fetchBroadcasts(); // Refresh the list
      } else {
        const data = await response.json();
        alert(data.error || 'Gagal mengirim broadcast');
      }
    } catch (error) {
      console.error('Error sending broadcast:', error);
      alert('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'sending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Selesai';
      case 'sending':
        return 'Mengirim';
      case 'failed':
        return 'Gagal';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Broadcast Pesan</h2>
        <p className="mt-2 text-gray-600">
          Kirim pesan ke semua pengguna aktif bot
        </p>
      </div>

      {/* Broadcast Form */}
      <div className="card">
        <div className="flex items-center mb-4">
          <SpeakerWaveIcon className="w-6 h-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Kirim Broadcast Baru</h3>
        </div>

        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Pesan Broadcast
            </label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input-field resize-none"
              placeholder="Tulis pesan yang akan dikirim ke semua pengguna..."
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Pesan akan dikirim dengan format: 📢 Pengumuman: [pesan Anda]
            </p>
          </div>

          <div>
            <label htmlFor="delay" className="block text-sm font-medium text-gray-700 mb-2">
              Delay Antar Pesan (detik)
            </label>
            <input
              type="number"
              id="delay"
              min="0"
              max="10"
              value={delay}
              onChange={(e) => setDelay(parseInt(e.target.value) || 0)}
              className="input-field w-32"
              placeholder="0"
            />
            <p className="mt-1 text-sm text-gray-500">
              Delay untuk menghindari rate limit (0-10 detik)
            </p>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-500">
              <p>⚠️ Pesan akan dikirim ke semua pengguna aktif</p>
              <p>Pastikan pesan sudah benar sebelum mengirim</p>
            </div>
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Mengirim...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                  Kirim Broadcast
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Broadcast History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Riwayat Broadcast
        </h3>

        {broadcastsLoading ? (
          <div className="text-center py-8">
            <div className="loading-spinner mx-auto"></div>
            <p className="mt-2 text-gray-500">Memuat riwayat broadcast...</p>
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="text-center py-8">
            <SpeakerWaveIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada broadcast yang dikirim</p>
          </div>
        ) : (
          <div className="space-y-4">
            {broadcasts.map((broadcast: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {getStatusIcon(broadcast.status)}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {getStatusText(broadcast.status)}
                      </span>
                      <span className="ml-4 text-sm text-gray-500">
                        {new Date(broadcast.sent_at).toLocaleString('id-ID')}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3 line-clamp-3">
                      {broadcast.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Total: {broadcast.total_users}</span>
                      {broadcast.success_count !== undefined && (
                        <>
                          <span>✅ Berhasil: {broadcast.success_count}</span>
                          <span>❌ Gagal: {broadcast.failed_count}</span>
                        </>
                      )}
                      {broadcast.username && (
                        <span>Oleh: {broadcast.first_name || broadcast.username}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}