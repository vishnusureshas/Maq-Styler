import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Mail, ShoppingBag } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/api/auth';

const forgotSchema = z.object({
  email: z.string().email('Valid email required'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (values: ForgotForm) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(values.email);
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center text-center">
          <span
            className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/30"
            aria-hidden="true"
          >
            <Mail className="h-7 w-7" />
          </span>
          <h1 className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Check your email
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            If an account exists for that address, we&apos;ve sent a password reset link. It may
            take a moment to arrive.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/25 transition-all hover:from-blue-700 hover:to-indigo-700"
          >
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="mb-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">ShopCart</span>
        </div>
        <h1 className="mt-7 text-2xl font-semibold tracking-tight sm:text-3xl">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-9"
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/25 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-600/40"
          disabled={loading}
        >
          {loading ? (
            'Sending…'
          ) : (
            <>
              <KeyRound className="h-4 w-4" /> Send reset link
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 space-y-2 text-center text-sm">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Remembered it? Sign in
        </Link>
        <p className="text-muted-foreground">
          No account?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}