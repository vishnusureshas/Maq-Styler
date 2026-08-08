import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';
import { userApi } from '@/api/user';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(2, 'Name required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

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

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-2xl font-bold">My profile</h1>
      <Tabs defaultValue="details" className="max-w-3xl">
        <TabsList>
          <TabsTrigger value="details">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <form
            onSubmit={profileForm.handleSubmit(onSaveProfile)}
            className="space-y-4 rounded-lg border p-6"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input {...profileForm.register('name')} />
              {profileForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {profileForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Street</Label>
                <Input {...profileForm.register('address')} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input {...profileForm.register('city')} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input {...profileForm.register('state')} />
              </div>
              <div className="space-y-2">
                <Label>ZIP</Label>
                <Input {...profileForm.register('zip')} />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input {...profileForm.register('country')} />
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="security">
          <form
            onSubmit={passwordForm.handleSubmit(onChangePassword)}
            className="space-y-4 rounded-lg border p-6"
          >
            <div className="space-y-2">
              <Label>Current password</Label>
              <Input type="password" {...passwordForm.register('currentPassword')} />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>New password</Label>
              <Input type="password" {...passwordForm.register('newPassword')} />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Confirm new password</Label>
              <Input type="password" {...passwordForm.register('confirm')} />
              {passwordForm.formState.errors.confirm && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.confirm.message}
                </p>
              )}
            </div>
            <Button type="submit">Change password</Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}