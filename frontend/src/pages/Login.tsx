import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Terminal, ShieldAlert } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLocalError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setLocalError(null);
    clearError();

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setLocalError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const selectPreset = (uname: string) => {
    setUsername(uname);
    setPassword('password123'); // Preset password
  };

  return (
    <div className="min-h-screen bg-bg-cosmic bg-grid-dots flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-6">
        
        {/* Brand/Logo */}
        <div className="flex items-center gap-3 justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <Terminal className="text-white" size={24} />
          </div>
          <span className="font-bold text-2xl tracking-widest text-white">
            DAEMON<span className="text-cyan-400">BOARD</span>
          </span>
        </div>

        {/* Login Card */}
        <Card className="border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold tracking-wide">Welcome Back</CardTitle>
            <CardDescription>Sign in to monitor infrastructure and study roadmaps</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Errors */}
              {(localError || error) && (
                <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
                  <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Access Denied:</span> {localError || error}
                  </div>
                </div>
              )}

              <Input
                label="Username"
                placeholder="Enter your username (e.g. alex)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                glowColor="cyan"
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                glowColor="purple"
              />

              <Button type="submit" className="w-full mt-2" isLoading={loading}>
                Sign In
              </Button>
            </form>

            {/* Presets to test mock mode */}
            <div className="mt-6 border-t border-zinc-800/60 pt-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2 text-center">
                Or Quick-Login Preset Account (Mock Mode)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => selectPreset('alex')}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-500/30 text-[10px] font-semibold text-zinc-300 transition text-center cursor-pointer"
                >
                  Alex (Junior)
                </button>
                <button
                  onClick={() => selectPreset('sarah')}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-purple-500/30 text-[10px] font-semibold text-zinc-300 transition text-center cursor-pointer"
                >
                  Sarah (DevOps)
                </button>
                <button
                  onClick={() => selectPreset('admin')}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 text-[10px] font-semibold text-zinc-300 transition text-center cursor-pointer"
                >
                  Admin
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-center">
            <span className="text-xs text-zinc-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-cyan-400 hover:underline">
                Create one
              </Link>
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
