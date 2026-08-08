import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/api/auth';

export default function VerifyEmail() {
  const { token = '' } = useParams();
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    authApi
      .verifyEmail(token)
      .then(() => active && setState('success'))
      .catch((err) => {
        if (!active) return;
        setState('error');
        setMessage((err as { message?: string })?.message || 'Verification failed. The link may be invalid or expired.');
      });
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-10">
      <div className="w-full max-w-md space-y-4 rounded-lg border p-8 text-center shadow-sm">
        {state === 'loading' && <p className="text-muted-foreground">Verifying your email…</p>}
        {state === 'success' && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <h1 className="text-xl font-bold">Email verified</h1>
            <p className="text-sm text-muted-foreground">
              Your email address has been verified successfully.
            </p>
            <Button asChild className="w-full">
              <Link to="/login">Continue to sign in</Link>
            </Button>
          </>
        )}
        {state === 'error' && (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="text-xl font-bold">Verification failed</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Link to="/login" className="inline-block text-sm text-primary hover:underline">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}