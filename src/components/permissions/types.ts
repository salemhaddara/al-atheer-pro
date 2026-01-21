import type { Role, Permission } from '@/lib/roles-api';

export interface RoleFormData {
    name: string;
    slug: string;
    description: string;
    is_active: boolean;
    institution_id?: number | null;
}

export interface PermissionsStats {
    totalUsers: number;
    definedRoles: number;
    activeRoles: number;
    suspendedUsers: number;
}

export interface PermissionGroupProps {
    group: string;
    permissions: Permission[];
    selectedPermissionIds: number[];
    onTogglePermission: (permissionId: number) => void;
    onToggleGroup: (permissions: Permission[]) => void;
    direction: 'ltr' | 'rtl';
}





