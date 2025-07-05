'use client';

import { useState } from 'react';
import { UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface LoginFormProps {
  onLogin: (token: string, user: any) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [telegramId, setTelegramId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId }),
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.token, data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <div className="card animate-fade-in">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600">
              Chat Anonim Indonesia Bot
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="telegramId" className="block text-sm font-medium text-gray-700 mb-2">
                Telegram ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="telegramId"
                  type="text"
                  required
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Masukkan Telegram ID Anda"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Dapatkan ID Telegram Anda dari{' '}
                <a 
                  href="https://t.me/userinfobot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  @userinfobot
                </a>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Memverifikasi...
                </>
              ) : (
                'Masuk ke Panel Admin'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Hanya admin dan owner bot yang dapat mengakses panel ini
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}