import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Terminal, ShieldAlert } from 'lucide-react';

export const Register: React.FC = () => {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    setLoading(true);
    setLocalError(null);
    clearError();

    try {
      await register(username, email, password);
      navigate('/');
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
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

        {/* Register Card */}
        <Card className="border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold tracking-wide">Create Workspace</CardTitle>
            <CardDescription>Setup your profile to begin tracking systems & notes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Errors */}
              {(localError || error) && (
                <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
                  <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Error:</span> {localError || error}
                  </div>
                </div>
              )}

              <Input
                label="Username"
                placeholder="Choose a username (e.g. devops_hero)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                glowColor="cyan"
              />

              <Input
                label="Email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                glowColor="cyan"
              />

              <Input
                label="Password"
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                glowColor="purple"
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                glowColor="purple"
              />

              <Button type="submit" className="w-full mt-2" isLoading={loading}>
                Create Account
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <span className="text-xs text-zinc-500">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-400 hover:underline">
                Sign in
              </Link>
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
