import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Terminal, ShieldAlert, MailCheck } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const { forgotPassword, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setLocalError('Please enter your email address');
      return;
    }

    setLoading(true);
    setLocalError(null);
    clearError();

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to send password reset request.');
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

        {/* Forgot Password Card */}
        <Card className="border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold tracking-wide">Recover Password</CardTitle>
            <CardDescription>We'll dispatch instructions to reset your developer credentials</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col items-center gap-4 text-center py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <MailCheck size={24} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-semibold text-sm text-zinc-100">Recovery Mail Dispatched</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed px-4">
                    If this email matches an active account, we have logged a reset link in the backend console output.
                  </p>
                </div>
                <div className="rounded-lg border border-cyan-500/10 bg-cyan-500/5 p-3 text-[11px] text-cyan-300 max-w-xs">
                  <span className="font-semibold">Dev Note:</span> Check the Go api terminal logs for the simulated password reset URL!
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
                  label="Email Address"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  glowColor="cyan"
                  autoFocus
                />

                <Button type="submit" className="w-full mt-2" isLoading={loading}>
                  Send Recovery Link
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="justify-center">
            <span className="text-xs text-zinc-500">
              Back to{' '}
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
