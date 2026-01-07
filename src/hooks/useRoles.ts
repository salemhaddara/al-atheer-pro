/**
 * Custom hooks for roles and permissions management
 * Provides data fetching, caching, and mutation capabilities
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
    listRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    assignPermissionsToRole,
    revokePermissionsFromRole,
    syncPermissionsForRole,
    assignRoleToUser,
    revokeRoleFromUser,
    type Role,
    type CreateRoleRequest,
    type UpdateRoleRequest,
} from '@/lib/roles-api';
import { useLanguage } from '@/contexts/LanguageContext';

// ==================== Roles List Hook ====================

export function useRoles(perPage: number = 15) {
    const { t } = useLanguage();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total: 0,
        per_page: perPage,
        last_page: 1,
    });

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await listRoles(perPage);
            if (result.success) {
                setRoles(result.data.roles.data);
                setPagination({
                    current_page: result.data.roles.current_page,
                    total: result.data.roles.total,
                    per_page: result.data.roles.per_page,
                    last_page: result.data.roles.last_page,
                });
            } else {
                setError(result.message);
                toast.error(result.message || t('permissions.errors.loadRolesFailed'));
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load roles';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [perPage, t]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    return {
        roles,
        loading,
        error,
        pagination,
        refetch: fetchRoles,
    };
}

// ==================== Single Role Hook ====================

export function useRole(roleId: number | null) {
    const { t } = useLanguage();
    const [role, setRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRole = useCallback(async () => {
        if (!roleId) {
            setRole(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await getRole(roleId);
            if (result.success) {
                setRole(result.data.role);
            } else {
                setError(result.message);
                toast.error(result.message || t('permissions.errors.loadRoleFailed'));
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load role';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [roleId, t]);

    useEffect(() => {
        fetchRole();
    }, [fetchRole]);

    return {
        role,
        loading,
        error,
        refetch: fetchRole,
    };
}

// ==================== Role Mutations Hook ====================

export function useRoleMutations() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    const create = useCallback(async (data: CreateRoleRequest) => {
        setLoading(true);
        try {
            const result = await createRole(data);
            if (result.success) {
                toast.success(result.message || t('permissions.roles.roleCreated'));
                return { success: true, role: result.data.role };
            } else {
                const errorMessage = result.errors
                    ? Object.values(result.errors).flat().join(', ')
                    : result.message;
                toast.error(errorMessage || t('permissions.errors.createRoleFailed'));
                return { success: false, error: errorMessage };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create role';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [t]);

    const update = useCallback(async (id: number, data: UpdateRoleRequest) => {
        setLoading(true);
        try {
            const result = await updateRole(id, data);
            if (result.success) {
                toast.success(result.message || t('permissions.roles.roleUpdated'));
                return { success: true, role: result.data.role };
            } else {
                const errorMessage = result.errors
                    ? Object.values(result.errors).flat().join(', ')
                    : result.message;
                toast.error(errorMessage || t('permissions.errors.updateRoleFailed'));
                return { success: false, error: errorMessage };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update role';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [t]);

    const remove = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const result = await deleteRole(id);
            if (result.success) {
                toast.success(result.message || t('permissions.roles.roleDeleted'));
                return { success: true };
            } else {
                toast.error(result.message || t('permissions.errors.deleteRoleFailed'));
                return { success: false, error: result.message };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete role';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [t]);

    return {
        create,
        update,
        remove,
        loading,
    };
}

// ==================== Permission Management Hook ====================

export function usePermissionMutations() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    const assign = useCallback(async (roleId: number, permissionIds: number[]) => {
        setLoading(true);
        try {
            const result = await assignPermissionsToRole(roleId, permissionIds);
            if (result.success) {
                toast.success(result.message || t('permissions.permissions.assigned'));
                return { success: true, role: result.data.role };
            } else {
                toast.error(result.message || t('permissions.errors.assignPermissionsFailed'));
                return { success: false, error: result.message };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to assign permissions';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [t]);

    const revoke = useCallback(async (roleId: number, permissionIds: number[]) => {
        setLoading(true);
        try {
            const result = await revokePermissionsFromRole(roleId, permissionIds);
            if (result.success) {
                toast.success(result.message || t('permissions.permissions.revoked'));
                return { success: true, role: result.data.role };
            } else {
                toast.error(result.message || t('permissions.errors.revokePermissionsFailed'));
                return { success: false, error: result.message };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to revoke permissions';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [t]);

    const sync = useCallback(async (roleId: number, permissionIds: number[]) => {
        setLoading(true);
        try {
            const result = await syncPermissionsForRole(roleId, permissionIds);
            if (result.success) {
                toast.success(result.message || t('permissions.permissions.synced'));
                return { success: true, role: result.data.role };
            } else {
                toast.error(result.message || t('permissions.errors.syncPermissionsFailed'));
                return { success: false, error: result.message };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to sync permissions';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [t]);

    return {
        assign,
        revoke,
        sync,
        loading,
    };
}

// ==================== Role Assignment Hook ====================

export function useRoleAssignment() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    const assignToUser = useCallback(async (roleId: number, userId: number) => {
        setLoading(true);
        try {
            const result = await assignRoleToUser(roleId, userId);
            if (result.success) {
                toast.success(result.message || t('permissions.roles.assignedToUser'));
                return { success: true, user: result.data.user };
            } else {
                toast.error(result.message || t('permissions.errors.assignRoleToUserFailed'));
                return { success: false, error: result.message };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to assign role to user';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [t]);

    const revokeFromUser = useCallback(async (roleId: number, userId: number) => {
        setLoading(true);
        try {
            const result = await revokeRoleFromUser(roleId, userId);
            if (result.success) {
                toast.success(result.message || t('permissions.roles.revokedFromUser'));
                return { success: true, user: result.data.user };
            } else {
                toast.error(result.message || t('permissions.errors.revokeRoleFromUserFailed'));
                return { success: false, error: result.message };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to revoke role from user';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [t]);

    return {
        assignToUser,
        revokeFromUser,
        loading,
    };
}





