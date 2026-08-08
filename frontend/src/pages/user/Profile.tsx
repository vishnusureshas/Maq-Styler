import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';
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
      <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        className="pr-10 pl-9"
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        onClick={() => setVisible((s) => !s)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function Profile() {
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

  const initial = (user?.name ?? 'U').charAt(0).toUpperCase();
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="relative overflow-hidden py-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob-float absolute -top-10 -left-24 h-64 w-64 rounded-full bg-sky-300/40 blur-3xl" />
        <div className="animate-blob-float absolute top-1/3 right-0 h-80 w-80 rounded-full bg-indigo-300/40 blur-3xl [animation-delay:2s]" />
        <div className="animate-blob-float absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl [animation-delay:4s]" />
      </div>

      <div className="container relative z-10">
        <div className="animate-fade-up overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl">
          <div className="animate-gradient-pan h-28 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600" />
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div className="-mt-10 flex items-end gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground shadow-lg ring-4 ring-background">
              {initial}
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">{user?.name}</h1>
                <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                  {user?.role === 'admin' ? 'Administrator' : 'Member'}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {user?.email} · Joined {memberSince}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="profile"
        orientation="vertical"
        className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]"
      >
        <TabsList className="flex w-full flex-col items-stretch gap-1 rounded-xl border border-white/60 bg-white/60 p-2 shadow-lg backdrop-blur-xl lg:sticky lg:top-24 lg:self-start">
          <TabsTrigger value="profile" className="justify-start gap-2.5 px-3 py-2.5">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="justify-start gap-2.5 px-3 py-2.5">
            <ShieldCheck className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <div className="min-w-0">
          <TabsContent value="profile" className="mt-0">
            <Card className="border-white/60 bg-white/70 shadow-xl backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Personal details</CardTitle>
                <CardDescription>
                  Update your name and default shipping address.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={profileForm.handleSubmit(onSaveProfile)}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="profile-email"
                        value={user?.email ?? ''}
                        disabled
                        className="pl-9 text-muted-foreground"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Email is used for sign in and cannot be changed.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Full name</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="profile-name"
                        className="pl-9"
                        placeholder="Jane Doe"
                        {...profileForm.register('name')}
                      />
                    </div>
                    {profileForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">Shipping address</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="profile-street">Street</Label>
                        <Input
                          id="profile-street"
                          placeholder="123 Main St"
                          {...profileForm.register('address')}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="profile-city">City</Label>
                          <Input
                            id="profile-city"
                            placeholder="New York"
                            {...profileForm.register('city')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profile-state">State</Label>
                          <Input
                            id="profile-state"
                            placeholder="NY"
                            {...profileForm.register('state')}
                          />
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="profile-zip">ZIP code</Label>
                          <Input
                            id="profile-zip"
                            placeholder="10001"
                            {...profileForm.register('zip')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profile-country">Country</Label>
                          <Input
                            id="profile-country"
                            placeholder="United States"
                            {...profileForm.register('country')}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t pt-4">
                    <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/25 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-600/40" disabled={saving}>
                      {saving ? 'Saving…' : 'Save changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <Card className="border-white/60 bg-white/70 shadow-xl backdrop-blur-xl">
              <CardHeader>
                <div className="space-y-1.5">
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-primary" />
                    Password & security
                  </CardTitle>
                  <CardDescription>
                    Choose a strong, unique password to keep your account secure.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={passwordForm.handleSubmit(onChangePassword)}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current password</Label>
                    <PasswordInput
                      value={passwordForm.watch('currentPassword') ?? ''}
                      onChange={passwordForm.register('currentPassword').onChange}
                      placeholder="Enter your current password"
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-sm text-destructive">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <PasswordInput
                      value={newPassword}
                      onChange={passwordForm.register('newPassword').onChange}
                      placeholder="At least 8 characters"
                    />
                    {newPassword && (
                      <div className="pt-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((bar) => (
                            <div
                              key={bar}
                              className={cn(
                                'h-1 flex-1 rounded-full transition-colors',
                                bar <= strength
                                  ? STRENGTH[strength].color
                                  : 'bg-muted'
                              )}
                            />
                          ))}
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          Password strength:{' '}
                          <span className="font-medium text-foreground">
                            {STRENGTH[strength].label}
                          </span>
                        </p>
                      </div>
                    )}
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sm text-destructive">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm new password</Label>
                    <PasswordInput
                      value={passwordForm.watch('confirm') ?? ''}
                      onChange={passwordForm.register('confirm').onChange}
                      placeholder="Re-enter your new password"
                    />
                    {passwordForm.formState.errors.confirm && (
                      <p className="text-sm text-destructive">
                        {passwordForm.formState.errors.confirm.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t pt-4">
                    <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/25 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-600/40">Update password</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
      </div>
    </div>
  );
}