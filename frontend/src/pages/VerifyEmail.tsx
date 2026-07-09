import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Terminal, ShieldAlert, ShieldCheck } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const { verifyEmail, error, clearError } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [localError, setLocalError] = useState<string | null>(null);
  const verifyAttempted = useRef(false);

  useEffect(() => {
    const executeVerification = async () => {
      if (verifyAttempted.current) return;
      verifyAttempted.current = true;

      if (!token) {
        setStatus('error');
        setLocalError('Verification token is missing from the request URL');
        return;
      }

      setStatus('loading');
      setLocalError(null);
      clearError();

      try {
        await verifyEmail(token);
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setLocalError(err.message || 'Verification failed. The token may be expired or invalid.');
      }
    };

    executeVerification();
  }, [token, verifyEmail, clearError]);

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

        {/* Verification Card */}
        <Card className="border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold tracking-wide">Account Verification</CardTitle>
            <CardDescription>Confirming email validity for secure telemetry access</CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'loading' && (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-purple-500 animate-spin" />
                </div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest animate-pulse">
                  Validating verification token...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center gap-4 text-center py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <ShieldCheck size={24} className="animate-bounce" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-semibold text-sm text-zinc-100">Verification Successful</h3>
                  <p className="text-xs text-zinc-400 px-4">
                    Your developer profile is verified. You now have full access to roadmaps, telemetry monitoring, and dashboard features.
                  </p>
                </div>
                <Button onClick={() => navigate('/')} className="w-full mt-4">
                  Go to Dashboard
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col gap-4 text-center py-2">
                <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300 text-left">
                  <ShieldAlert size={18} className="mt-0.5 shrink-0 text-rose-400" />
                  <div>
                    <span className="font-bold">Verification Error:</span> {localError || error}
                  </div>
                </div>
                <p className="text-xs text-zinc-500 px-2 mt-1">
                  You can register a new account or try requesting another verification mail trigger if the token has expired.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button variant="ghost" onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                  <Button variant="primary" onClick={() => navigate('/register')}>
                    Register
                  </Button>
                </div>
              </div>
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
