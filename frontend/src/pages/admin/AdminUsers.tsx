import { useEffect, useState } from 'react';
import { Trash2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUsers, updateUser, deleteUser, selectAdminUsers } from '@/store/slices/adminSlice';
import type { User } from '@/types/user';
import { toast } from 'sonner';

export default function AdminUsers() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAdminUsers);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const activeCount = users.filter((u) => u.isActive).length;

  const onRoleChange = (id: string, role: 'user' | 'admin') => {
    dispatch(updateUser({ id, role })).unwrap().catch(() => {});
  };

  const onToggleActive = (user: User) => {
    dispatch(updateUser({ id: user._id, isActive: !user.isActive }))
      .unwrap()
      .then(() => toast.success(user.isActive ? 'User deactivated' : 'User activated'))
      .catch(() => {});
  };

  const onDelete = (user: User) => {
    setConfirmId(null);
    dispatch(deleteUser(user._id))
      .unwrap()
      .then(() => toast.success('User deleted'))
      .catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {users.length} total · {activeCount} active
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Joined</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b last:border-0 hover:bg-slate-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5 font-medium">
                      {user.role === 'admin' ? (
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                      {user.name}
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{user.email}</td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <Select
                      value={user.role}
                      onValueChange={(v) => onRoleChange(user._id, v as 'user' | 'admin')}
                    >
                      <SelectTrigger className="h-8 w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-4">
                    {user.isActive ? (
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleActive(user)}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      {confirmId === user._id ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(user)}
                          onMouseLeave={() => setConfirmId(null)}
                        >
                          Confirm?
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setConfirmId(user._id)}
                          aria-label="Delete user"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}