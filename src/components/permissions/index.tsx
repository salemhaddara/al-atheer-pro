'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRoles, useRoleMutations, usePermissionMutations } from '@/hooks/useRoles';
import { Loading } from '../Loading';
import { PermissionsHeader } from './PermissionsHeader';
import { PermissionsStats } from './PermissionsStats';
import { RolesTable } from './RolesTable';
import { RoleFormDialog } from './RoleFormDialog';
import { ViewRoleDialog } from './ViewRoleDialog';
import { ManagePermissionsDialog } from './ManagePermissionsDialog';
import { AssignUsersDialog } from './AssignUsersDialog';
import type { Role } from '@/lib/roles-api';
import type { RoleFormData, PermissionsStats as Stats } from './types';

export function Permissions() {
    const { t, direction } = useLanguage();
    const { roles, loading: rolesLoading, refetch: refetchRoles } = useRoles(50);
    const { create, update, remove, loading: mutationLoading } = useRoleMutations();
    const { sync: syncPermissions, loading: permissionSyncLoading } = usePermissionMutations();

    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
    const [isAssignUsersDialogOpen, setIsAssignUsersDialogOpen] = useState(false);

    const [formData, setFormData] = useState<RoleFormData>({
        name: '',
        slug: '',
        description: '',
        is_active: true,
    });

    // Statistics
    const stats: Stats = useMemo(() => {
        return {
            totalUsers: 0, // Placeholder - would need separate API call
            definedRoles: roles.length,
            activeRoles: roles.filter((r) => r.is_active).length,
            suspendedUsers: 0, // Placeholder - would need separate API call
        };
    }, [roles]);

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            is_active: true,
        });
    };

    // Handle create role
    const handleCreate = async () => {
        const result = await create({
            name: formData.name,
            slug: formData.slug || undefined,
            description: formData.description || undefined,
            is_active: formData.is_active,
        });

        if (result.success) {
            setIsCreateDialogOpen(false);
            resetForm();
            refetchRoles();
        }
    };

    // Handle update role
    const handleUpdate = async () => {
        if (!selectedRole) return;

        const result = await update(selectedRole.id, {
            name: formData.name,
            slug: formData.slug || undefined,
            description: formData.description || undefined,
            is_active: formData.is_active,
        });

        if (result.success) {
            setIsEditDialogOpen(false);
            resetForm();
            setSelectedRole(null);
            refetchRoles();
        }
    };

    // Handle delete role
    const handleDelete = async (role: Role) => {
        if (
            !confirm(t('permissions.roles.confirmDelete') || `Are you sure you want to delete "${role.name}"?`)
        ) {
            return;
        }

        const result = await remove(role.id);
        if (result.success) {
            refetchRoles();
        }
    };

    // Handle view role
    const handleView = (role: Role) => {
        setSelectedRole(role);
        setIsViewDialogOpen(true);
    };

    // Handle edit role
    const handleEdit = (role: Role) => {
        setSelectedRole(role);
        setFormData({
            name: role.name,
            slug: role.slug,
            description: role.description || '',
            is_active: role.is_active,
        });
        setIsEditDialogOpen(true);
    };

    // Handle manage permissions
    const handleManagePermissions = (role: Role) => {
        setSelectedRole(role);
        setIsPermissionsDialogOpen(true);
    };

    // Handle assign users
    const handleAssignUsers = (role: Role) => {
        setSelectedRole(role);
        setIsAssignUsersDialogOpen(true);
    };

    // Handle save permissions
    const handleSavePermissions = async (roleId: number, permissionIds: number[]) => {
        const result = await syncPermissions(roleId, permissionIds);
        if (result.success) {
            setIsPermissionsDialogOpen(false);
            setSelectedRole(null);
            refetchRoles();
        }
    };

    const isLoading = rolesLoading;

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="space-y-6" dir={direction}>
            <PermissionsHeader />
            <PermissionsStats stats={stats} />

            <RolesTable
                roles={roles}
                onCreateClick={() => {
                    resetForm();
                    setIsCreateDialogOpen(true);
                }}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onManagePermissions={handleManagePermissions}
                onAssignUsers={handleAssignUsers}
            />

            {/* Create Role Dialog */}
            <RoleFormDialog
                mode="create"
                isOpen={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                formData={formData}
                onFormDataChange={setFormData}
                onSubmit={handleCreate}
                loading={mutationLoading}
            />

            {/* Edit Role Dialog */}
            <RoleFormDialog
                mode="edit"
                role={selectedRole}
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                formData={formData}
                onFormDataChange={setFormData}
                onSubmit={handleUpdate}
                loading={mutationLoading}
            />

            {/* View Role Dialog */}
            <ViewRoleDialog role={selectedRole} isOpen={isViewDialogOpen} onClose={() => setIsViewDialogOpen(false)} />

            {/* Manage Permissions Dialog */}
            <ManagePermissionsDialog
                role={selectedRole}
                isOpen={isPermissionsDialogOpen}
                onClose={() => {
                    setIsPermissionsDialogOpen(false);
                    setSelectedRole(null);
                }}
                onSave={handleSavePermissions}
                loading={permissionSyncLoading}
            />

            {/* Assign Users Dialog */}
            <AssignUsersDialog
                role={selectedRole}
                isOpen={isAssignUsersDialogOpen}
                onClose={() => {
                    setIsAssignUsersDialogOpen(false);
                    setSelectedRole(null);
                }}
            />
        </div>
    );
}

