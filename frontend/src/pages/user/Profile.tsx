import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/home/Navbar';
import { HomeFooter } from '@/components/home/HomeFooter';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser, logoutUser } from '@/store/slices/authSlice';
import { userApi } from '@/api/user';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Use at least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const STRENGTH = [
  { label: 'Too weak', color: 'bg-red-500' },
  { label: 'Weak', color: 'bg-orange-500' },
  { label: 'Fair', color: 'bg-amber-500' },
  { label: 'Good', color: 'bg-lime-500' },
  { label: 'Strong', color: 'bg-emerald-500' },
];

function getStrength(pw: string) {
  let score = 0;
  if (pw.length > 0) score = 1;
  if (pw.length >= 8) score = 2;
  if (pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw)) score = 3;
  if (pw.length >= 8 && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score = 4;
  return score;
}

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        className="h-11 rounded-xl bg-white pr-10 pl-9"
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        onClick={() => setVisible((s) => !s)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-foreground"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

const fieldRow = 'space-y-2';
const fieldWrap = 'h-11 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-blue-500/40';

export default function Profile() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [saving, setSaving] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      city: user?.address?.city ?? '',
      state: user?.address?.state ?? '',
      zip: user?.address?.zip ?? '',
      country: user?.address?.country ?? '',
      address: user?.address?.street ?? '',
    },
  });

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });
  const newPassword = passwordForm.watch('newPassword') ?? '';
  const strength = newPassword ? getStrength(newPassword) : 0;

  const onSaveProfile = async (values: ProfileForm) => {
    setSaving(true);
    try {
      await userApi.updateProfile({
        name: values.name,
        address: {
          street: values.address,
          city: values.city,
          state: values.state,
          zip: values.zip,
          country: values.country,
        },
      });
      toast.success('Profile updated');
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (values: PasswordForm) => {
    try {
      await userApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password changed');
      passwordForm.reset();
    } catch {
      // toast handled by interceptor
    }
  };

  const onSignOut = async () => {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const initial = (user?.name ?? 'U').charAt(0).toUpperCase();
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="container pb-16">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 px-6 py-10 text-white shadow-2xl shadow-blue-600/20 sm:px-10 lg:px-14">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-15" />
          <div className="pointer-events-none absolute inset-0">
            <div className="animate-blob-float absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
            <div
              className="animate-blob-float absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl"
              style={{ animationDelay: '-6s' }}
            />
          </div>

          <div className="relative">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 to-orange-500 text-3xl font-extrabold text-white shadow-xl ring-4 ring-white/30">
                  {initial}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                      {user?.name ?? 'Member'}
                    </h1>
                    <Badge className="border-white/25 bg-white/15 text-white backdrop-blur">
                      {user?.role === 'admin' ? 'Administrator' : 'Member'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-white/85">{user?.email}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/75">
                    <CalendarDays className="h-4 w-4" />
                    Member since {memberSince}
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="ghost"
                className="w-fit rounded-full border border-white/25 bg-white/10 px-5 text-white backdrop-blur hover:bg-white/20 hover:text-white"
              >
                <Link to="/shop">
                  Back to store <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium backdrop-blur">
                <BadgeCheck className="h-4 w-4" /> Verified account
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium backdrop-blur">
                <ShieldCheck className="h-4 w-4" /> Secure &amp; encrypted
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium backdrop-blur">
                <ShoppingBag className="h-4 w-4" /> Loyal shopper
              </span>
            </div>
          </div>
        </section>

        <Tabs
          defaultValue="profile"
          orientation="vertical"
          className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]"
        >
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <TabsList className="flex h-auto w-full flex-col items-stretch gap-1.5 rounded-2xl border border-white/70 bg-white/70 p-2 shadow-sm backdrop-blur">
              <TabsTrigger
                value="profile"
                className="justify-start gap-2.5 rounded-xl px-3.5 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <User className="h-4 w-4" /> Personal details
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="justify-start gap-2.5 rounded-xl px-3.5 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <ShieldCheck className="h-4 w-4" /> Password &amp; security
              </TabsTrigger>
            </TabsList>

            <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Quick links
              </p>
              <div className="mt-3 space-y-1">
                <Link
                  to="/my-orders"
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                >
                  <Package className="h-4 w-4" /> My orders
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                >
                  <ShoppingBag className="h-4 w-4" /> Shopping cart
                </Link>
                <div className="rounded-xl bg-slate-50/80 px-2 py-2.5 text-sm text-slate-500">
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="truncate">{user?.email}</span>
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-3 w-full rounded-xl border-slate-200 text-slate-600 hover:text-destructive"
                onClick={onSignOut}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </aside>

          <div className="min-w-0">
            <TabsContent value="profile" className="mt-0">
              <div className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 text-blue-600">
                    <User className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Personal details</h2>
                    <p className="text-sm text-slate-500">
                      Update your name and default shipping address.
                    </p>
                  </div>
                </div>

                <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-5">
                  <div className={cn(fieldRow)}>
                    <Label htmlFor="profile-email" className="text-sm font-semibold">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="profile-email"
                        value={user?.email ?? ''}
                        disabled
                        className={cn(fieldWrap, 'bg-slate-50 pl-9 text-slate-500')}
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      Email is used for sign in and cannot be changed.
                    </p>
                  </div>

                  <div className={cn(fieldRow)}>
                    <Label htmlFor="profile-name" className="text-sm font-semibold">
                      Full name
                    </Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="profile-name"
                        placeholder="Jane Doe"
                        className={cn(fieldWrap, 'pl-9')}
                        {...profileForm.register('name')}
                      />
                    </div>
                    {profileForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-800">Shipping address</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label htmlFor="profile-street" className="text-sm font-semibold">
                          Street
                        </Label>
                        <Input
                          id="profile-street"
                          placeholder="123 Main St"
                          className={cn(fieldWrap, 'mt-2')}
                          {...profileForm.register('address')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="profile-city" className="text-sm font-semibold">
                          City
                        </Label>
                        <Input
                          id="profile-city"
                          placeholder="New York"
                          className={cn(fieldWrap, 'mt-2')}
                          {...profileForm.register('city')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="profile-state" className="text-sm font-semibold">
                          State
                        </Label>
                        <Input
                          id="profile-state"
                          placeholder="NY"
                          className={cn(fieldWrap, 'mt-2')}
                          {...profileForm.register('state')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="profile-zip" className="text-sm font-semibold">
                          ZIP code
                        </Label>
                        <Input
                          id="profile-zip"
                          placeholder="10001"
                          className={cn(fieldWrap, 'mt-2')}
                          {...profileForm.register('zip')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="profile-country" className="text-sm font-semibold">
                          Country
                        </Label>
                        <Input
                          id="profile-country"
                          placeholder="United States"
                          className={cn(fieldWrap, 'mt-2')}
                          {...profileForm.register('country')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                    <Button
                      type="submit"
                      className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-7 shadow-lg shadow-blue-600/25 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-600/40"
                      disabled={saving}
                    >
                      {saving ? 'Saving…' : 'Save changes'}
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <div className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600">
                    <KeyRound className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Password &amp; security</h2>
                    <p className="text-sm text-slate-500">
                      Choose a strong, unique password to keep your account secure.
                    </p>
                  </div>
                </div>

                <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-5">
                  <div className={cn(fieldRow, 'grid gap-4 lg:grid-cols-2')}>
                    <div>
                      <Label htmlFor="current-password" className="text-sm font-semibold">
                        Current password
                      </Label>
                      <div className="mt-2">
                        <PasswordInput
                          value={passwordForm.watch('currentPassword') ?? ''}
                          onChange={passwordForm.register('currentPassword').onChange}
                          placeholder="Enter your current password"
                        />
                      </div>
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="mt-1.5 text-sm text-destructive">
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={cn(fieldRow, 'grid gap-4 lg:grid-cols-2')}>
                    <div>
                      <Label htmlFor="new-password" className="text-sm font-semibold">
                        New password
                      </Label>
                      <div className="mt-2">
                        <PasswordInput
                          value={newPassword}
                          onChange={passwordForm.register('newPassword').onChange}
                          placeholder="At least 8 characters"
                        />
                      </div>
                      {newPassword && (
                        <div className="mt-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((bar) => (
                              <div
                                key={bar}
                                className={cn(
                                  'h-1 flex-1 rounded-full transition-colors',
                                  bar <= strength ? STRENGTH[strength].color : 'bg-slate-100'
                                )}
                              />
                            ))}
                          </div>
                          <p className="mt-1.5 text-xs text-slate-500">
                            Password strength:{' '}
                            <span className="font-medium text-slate-800">
                              {STRENGTH[strength].label}
                            </span>
                          </p>
                        </div>
                      )}
                      {passwordForm.formState.errors.newPassword && (
                        <p className="mt-1.5 text-sm text-destructive">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirm-password" className="text-sm font-semibold">
                        Confirm new password
                      </Label>
                      <div className="mt-2">
                        <PasswordInput
                          value={passwordForm.watch('confirm') ?? ''}
                          onChange={passwordForm.register('confirm').onChange}
                          placeholder="Re-enter your new password"
                        />
                      </div>
                      {passwordForm.formState.errors.confirm && (
                        <p className="mt-1.5 text-sm text-destructive">
                          {passwordForm.formState.errors.confirm.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                    <Button
                      type="submit"
                      className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-7 shadow-lg shadow-blue-600/25 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-600/40"
                    >
                      Update password
                    </Button>
                  </div>
                </form>

                <div className="mt-6 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4 text-sm text-amber-800">
                  <span className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      Use a password you don&apos;t use for other sites. Avoid sharing it and never
                      send it by email.
                    </span>
                  </span>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
      <HomeFooter />
    </div>
  );
}