import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Terminal, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const { resetPassword, error, clearError } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setLocalError('Reset token is missing from the URL parameters');
      return;
    }

    if (!password.trim() || !confirmPassword.trim()) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setLocalError(null);
    clearError();

    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to reset password.');
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

        {/* Reset Password Card */}
        <Card className="border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold tracking-wide">Reset Password</CardTitle>
            <CardDescription>Establish a new secure password for your workspace profile</CardDescription>
          </CardHeader>
          <CardContent>
            {!token ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
                <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold">Missing Token:</span> The password reset link is invalid or incomplete. Please request a new recovery link.
                </div>
              </div>
            ) : success ? (
              <div className="flex flex-col items-center gap-4 text-center py-4 animate-fade-in">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 size={24} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-semibold text-sm text-zinc-100">Password Changed</h3>
                  <p className="text-xs text-zinc-400 px-4">
                    Your password has been successfully updated. Redirecting you to the sign-in page...
                  </p>
                </div>
              </div>
            ) : (
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
                  label="New Password"
                  type="password"
                  placeholder="Enter at least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  glowColor="purple"
                  autoFocus
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  glowColor="purple"
                />

                <Button type="submit" className="w-full mt-2" isLoading={loading}>
                  Reset Password
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="justify-center">
            <span className="text-xs text-zinc-500">
              Return to{' '}
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
