/**
 * Custom hooks for permissions data fetching
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
    listPermissions,
    getPermission,
    getPermissionsByGroup,
    type Permission,
} from '@/lib/roles-api';
import { useLanguage } from '@/contexts/LanguageContext';

// ==================== Permissions List Hook ====================

export function usePermissions(perPage: number = 100) {
    const { t } = useLanguage();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total: 0,
        per_page: perPage,
        last_page: 1,
    });

    const fetchPermissions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await listPermissions(perPage);
            if (result.success) {
                setPermissions(result.data.permissions.data);
                setPagination({
                    current_page: result.data.permissions.current_page,
                    total: result.data.permissions.total,
                    per_page: result.data.permissions.per_page,
                    last_page: result.data.permissions.last_page,
                });
            } else {
                setError(result.message);
                toast.error(result.message || t('permissions.errors.loadPermissionsFailed'));
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load permissions';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [perPage, t]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    // Group permissions by their group property
    const groupedPermissions = useMemo(() => {
        return permissions.reduce((acc, permission) => {
            const group = permission.group || 'other';
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(permission);
            return acc;
        }, {} as Record<string, Permission[]>);
    }, [permissions]);

    return {
        permissions,
        groupedPermissions,
        loading,
        error,
        pagination,
        refetch: fetchPermissions,
    };
}

// ==================== Single Permission Hook ====================

export function usePermission(permissionId: number | null) {
    const { t } = useLanguage();
    const [permission, setPermission] = useState<Permission | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPermission = useCallback(async () => {
        if (!permissionId) {
            setPermission(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await getPermission(permissionId);
            if (result.success) {
                setPermission(result.data.permission);
            } else {
                setError(result.message);
                toast.error(result.message || t('permissions.errors.loadPermissionFailed'));
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load permission';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [permissionId, t]);

    useEffect(() => {
        fetchPermission();
    }, [fetchPermission]);

    return {
        permission,
        loading,
        error,
        refetch: fetchPermission,
    };
}

// ==================== Permissions by Group Hook ====================

export function usePermissionsByGroup(group: string | null) {
    const { t } = useLanguage();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPermissions = useCallback(async () => {
        if (!group) {
            setPermissions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await getPermissionsByGroup(group);
            if (result.success) {
                setPermissions(result.data.permissions);
            } else {
                setError(result.message);
                toast.error(result.message || t('permissions.errors.loadPermissionsFailed'));
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load permissions';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [group, t]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    return {
        permissions,
        loading,
        error,
        refetch: fetchPermissions,
    };
}

