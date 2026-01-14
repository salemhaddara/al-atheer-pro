'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, X, UserPlus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getUsers, type User } from '@/lib/api';
import { useRoleAssignment } from '@/hooks/useRoles';
import type { Role } from '@/lib/roles-api';
import { toast } from 'sonner';

interface AssignUsersDialogProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AssignUsersDialog({ role, isOpen, onClose }: AssignUsersDialogProps) {
  const { t, direction } = useLanguage();
  const { assignToUser, revokeFromUser, loading } = useRoleAssignment();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && role) {
      loadUsers();
    } else {
      setUsers([]);
      setFilteredUsers([]);
      setSearchQuery('');
      setSelectedUserId(null);
    }
  }, [isOpen, role]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.email.toLowerCase().includes(query) ||
            user.full_name.toLowerCase().includes(query) ||
            user.username.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const result = await getUsers({ per_page: 100 });
      if (result.success && result.data?.users) {
        setUsers(result.data.users);
        setFilteredUsers(result.data.users);
      } else {
        toast.error(result.message || 'Failed to load users');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading users:', error);
      }
      toast.error(t('permissions.users.loadFailed') || 'Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleAssign = async () => {
    if (!role || !selectedUserId) {
      toast.error(t('permissions.users.selectUser') || 'Please select a user');
      return;
    }

    const result = await assignToUser(role.id, selectedUserId);
    if (result.success) {
      toast.success(
        t('permissions.users.assignedSuccess') || 'Role assigned to user successfully'
      );
      setSelectedUserId(null);
      loadUsers(); // Reload to get updated roles
    }
  };

  const handleRevoke = async (user: User) => {
    if (!role) return;

    if (!confirm(t('permissions.users.confirmRevoke') || 'Are you sure you want to revoke this role from the user?')) {
      return;
    }

    const result = await revokeFromUser(role.id, user.id);
    if (result.success) {
      toast.success(
        t('permissions.users.revokedSuccess') || 'Role revoked from user successfully'
      );
      loadUsers(); // Reload to get updated roles
    }
  };

  if (!role) return null;

  // Get users who have this role
  const usersWithRole = filteredUsers.filter((user) =>
    user.roles?.some((r) => r.id === role.id)
  );

  // Get users who don't have this role
  const usersWithoutRole = filteredUsers.filter(
    (user) => !user.roles?.some((r) => r.id === role.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir={direction}>
        <DialogHeader className={direction === 'rtl' ? 'text-right' : 'text-left'}>
          <DialogTitle>
            {t('permissions.users.assignRole') || 'Assign Role to Users'} - {role.name}
          </DialogTitle>
          <DialogDescription>
            {t('permissions.users.description') || 'Assign or revoke this role from users'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assign New User */}
          <div className="space-y-4">
            <div>
              <Label>{t('permissions.users.assignToUser') || 'Assign to User'}</Label>
              <div className="flex gap-2 mt-2">
                <Select
                  value={selectedUserId ? String(selectedUserId) : ''}
                  onValueChange={(value) => setSelectedUserId(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('permissions.users.selectUser') || 'Select a user'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {usersWithoutRole.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAssign} disabled={!selectedUserId || loading}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {loading
                    ? t('common.loading') || 'Loading...'
                    : t('permissions.users.assign') || 'Assign'}
                </Button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('permissions.users.searchPlaceholder') || 'Search users...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users with this role */}
          {isLoadingUsers ? (
            <div className="text-center py-8 text-gray-500">
              {t('common.loading') || 'Loading users...'}
            </div>
          ) : (
            <>
              {usersWithRole.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t('permissions.users.usersWithRole') || 'Users with this role'} (
                    {usersWithRole.length})
                  </Label>
                  <div className="border rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
                    {usersWithRole.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                      >
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevoke(user)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4 mr-1" />
                          {t('permissions.users.revoke') || 'Revoke'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {usersWithRole.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>
                    {t('permissions.users.noUsersWithRole') ||
                      'No users have this role assigned'}
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              {t('common.close') || 'Close'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

