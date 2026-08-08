import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, LogOut, ShoppingBag, Store, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { APP_NAME } from '@/config/constants';

export default function Logout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    dispatch(logoutUser());
    const t1 = setTimeout(() => setSignedOut(true), 1300);
    const t2 = setTimeout(() => navigate('/login', { replace: true }), 3600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [dispatch, navigate]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-15" />
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-blob-float absolute -left-20 top-10 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
        <div
          className="animate-blob-float absolute -right-16 top-1/3 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          style={{ animationDelay: '-8s' }}
        />
        <div
          className="animate-blob-float absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl"
          style={{ animationDelay: '-4s' }}
        />
      </div>

      <header className="relative flex items-center justify-between px-6 py-6 sm:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-white shadow-lg backdrop-blur">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <span className="text-xl font-extrabold tracking-tight">{APP_NAME}</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" /> Secure sign out
        </span>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-6 pb-16">
        <div className="animate-fade-up flex w-full max-w-md flex-col items-center text-center">
          {!signedOut ? (
            <>
              <div className="relative h-20 w-20">
                <div className="absolute -inset-3 rounded-full bg-white/25 blur-xl" />
                <div className="relative h-full w-full animate-spin rounded-full border-4 border-white/20 border-t-white" />
                <span className="absolute inset-0 grid place-items-center">
                  <LogOut className="h-7 w-7 text-white" />
                </span>
              </div>
              <h1 className="mt-8 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Signing you out…
              </h1>
              <p className="mt-3 text-sm text-white/80">
                Clearing your session securely — just a moment.
              </p>
            </>
          ) : (
            <>
              <span className="relative grid h-20 w-20 place-items-center rounded-full border border-white/30 bg-white/10 backdrop-blur">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </span>
              <h1 className="mt-8 text-3xl font-extrabold tracking-tight sm:text-4xl">
                See you soon!
              </h1>
              <p className="mt-3 text-sm text-white/80">
                You&apos;ve been signed out of {APP_NAME}. Redirecting you to the sign-in page…
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-white text-blue-700 shadow-lg hover:bg-sky-50"
                >
                  <Link to="/login">
                    Back to sign in <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="rounded-full border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
                >
                  <Link to="/">
                    <Store className="mr-1.5 h-4 w-4" /> Return to store
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="relative px-6 py-5 text-center text-xs text-white/60 sm:px-10">
        © {new Date().getFullYear()} {APP_NAME}. You&apos;re now safe to close this window.
      </footer>
    </div>
  );
}