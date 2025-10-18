import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Starfield } from './Starfield';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(username, password);

    if (success) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGH0O+9gTYIHm7A7+OZSBAMRJ3a762gWBIOS6fn6r1nHQk9muD0vHYpBjiM0/DIhjgIGm2+7eGYSRAMP57Y662dWhMOSKXl6cJtJAc8lt/zvHwvBzaL0fPGizYIHGu9796VTAsMPJ3Z661hXBIOSKXl6MNxKAc6lN7yvncrBzaL0fPGjDgIHGq9796ZThENRp3Z661lXBIOSKXl6MR0Kgc6lN7xvXgrBzaL0fPGizUIHGu9796YTRANRp7Z661lXBIOSKXl6MNxKgc6lN7xvnYrBzaL0fPGjDYIHGu9796ZTRANRp3Z661lXBIOSKXl6MNxKgc6lN7xvnYrBzaL0fPGjDYIHGu9796ZTRANRp3Z661lXBIOSKXl6MNxKgc6lN7xvnYrBzaL0fPGjDYIHGu9796ZTRANRp3Z661lXBIOSKXl6MNxKgc6lN7xvnYrBzaL0fPGjDYIHGu9796ZTRANRp3Z661lXBIOSKXl6MNxKgc6lN7xvnYrBzaL0fPGjDYIHGu9796ZTRANRp3Z661lXBIOSKXl6MNxKgc6lN7xvnYrBzaL0fPGjDYIHGu9796ZTRANRp3Z661lXBIOSKXl6MNxKgc6lN7xvnYrBzaL0fPGjDYIHGu9796ZTRANRp3Z661lXBIOSKXl6MNxKg==');
      audio.play().catch(() => {});

      setTimeout(() => {
        onLoginSuccess();
      }, 300);
    } else {
      setError('Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-black" />
      <Starfield />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
                Mystery Chat
              </h1>
              <p className="text-pink-200 text-sm">A Portal to Know Me</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white/90 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent transition-all"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent transition-all"
                  placeholder="Enter password"
                  required
                />
              </div>

              {error && (
                <div className="text-red-300 text-sm text-center bg-red-500/20 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Enter Portal'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
