/**
 * Roles and Permissions API
 * Handles all API calls related to roles and permissions management
 */

import { apiRequest, ApiResult } from './api';

// ==================== Types ====================

export interface Permission {
    id: number;
    name: string;
    slug: string;
    description?: string;
    group: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: string;
    slug: string;
    description?: string;
    is_system: boolean;
    is_active: boolean;
    institution_id?: number | null;
    branch_id?: number | null;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
}

export interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    total: number;
    per_page: number;
    last_page: number;
    from: number;
    to: number;
}

export interface RolesListResponse {
    roles: PaginatedResponse<Role>;
}

export interface RoleResponse {
    role: Role;
}

export interface PermissionsListResponse {
    permissions: PaginatedResponse<Permission>;
}

export interface PermissionResponse {
    permission: Permission;
}

export interface PermissionsByGroupResponse {
    permissions: Permission[];
}

export interface CreateRoleRequest {
    name: string;
    slug?: string;
    description?: string;
    is_active?: boolean;
    institution_id?: number | null;
    branch_id?: number | null;
}

export interface UpdateRoleRequest {
    name?: string;
    slug?: string;
    description?: string;
    is_active?: boolean;
    institution_id?: number | null;
    branch_id?: number | null;
}

export interface AssignPermissionsRequest {
    permission_ids: number[];
}

export interface AssignRoleToUserRequest {
    user_id: number;
}

// ==================== Roles API ====================

/**
 * List all roles with pagination
 */
export async function listRoles(perPage: number = 15): Promise<ApiResult<RolesListResponse>> {
    return apiRequest<RolesListResponse>(`/api/v1/admin/roles?per_page=${perPage}`);
}

/**
 * Get a single role by ID
 */
export async function getRole(id: number): Promise<ApiResult<RoleResponse>> {
    return apiRequest<RoleResponse>(`/api/v1/admin/roles/${id}`);
}

/**
 * Create a new role
 */
export async function createRole(data: CreateRoleRequest): Promise<ApiResult<RoleResponse>> {
    return apiRequest<RoleResponse>('/api/v1/admin/roles', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Update an existing role
 */
export async function updateRole(id: number, data: UpdateRoleRequest): Promise<ApiResult<RoleResponse>> {
    return apiRequest<RoleResponse>(`/api/v1/admin/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a role
 */
export async function deleteRole(id: number): Promise<ApiResult<{ message: string }>> {
    return apiRequest<{ message: string }>(`/api/v1/admin/roles/${id}`, {
        method: 'DELETE',
    });
}

/**
 * Assign permissions to a role
 */
export async function assignPermissionsToRole(
    roleId: number,
    permissionIds: number[]
): Promise<ApiResult<RoleResponse>> {
    return apiRequest<RoleResponse>(`/api/v1/admin/roles/${roleId}/permissions`, {
        method: 'POST',
        body: JSON.stringify({ permission_ids: permissionIds }),
    });
}

/**
 * Revoke permissions from a role
 */
export async function revokePermissionsFromRole(
    roleId: number,
    permissionIds: number[]
): Promise<ApiResult<RoleResponse>> {
    return apiRequest<RoleResponse>(`/api/v1/admin/roles/${roleId}/permissions`, {
        method: 'DELETE',
        body: JSON.stringify({ permission_ids: permissionIds }),
    });
}

/**
 * Sync permissions for a role (replaces all existing permissions)
 */
export async function syncPermissionsForRole(
    roleId: number,
    permissionIds: number[]
): Promise<ApiResult<RoleResponse>> {
    return apiRequest<RoleResponse>(`/api/v1/admin/roles/${roleId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permission_ids: permissionIds }),
    });
}

/**
 * Assign a role to a user
 */
export async function assignRoleToUser(
    roleId: number,
    userId: number
): Promise<ApiResult<{ user: { id: number; email: string; roles: Role[] } }>> {
    return apiRequest<{ user: { id: number; email: string; roles: Role[] } }>(
        `/api/v1/admin/roles/${roleId}/assign-user`,
        {
            method: 'POST',
            body: JSON.stringify({ user_id: userId }),
        }
    );
}

/**
 * Revoke a role from a user
 */
export async function revokeRoleFromUser(
    roleId: number,
    userId: number
): Promise<ApiResult<{ user: { id: number; email: string; roles: Role[] } }>> {
    return apiRequest<{ user: { id: number; email: string; roles: Role[] } }>(
        `/api/v1/admin/roles/${roleId}/revoke-user`,
        {
            method: 'DELETE',
            body: JSON.stringify({ user_id: userId }),
        }
    );
}

// ==================== Permissions API ====================

/**
 * List all permissions with pagination
 */
export async function listPermissions(perPage: number = 15): Promise<ApiResult<PermissionsListResponse>> {
    return apiRequest<PermissionsListResponse>(`/api/v1/admin/permissions?per_page=${perPage}`);
}

/**
 * Get a single permission by ID
 */
export async function getPermission(id: number): Promise<ApiResult<PermissionResponse>> {
    return apiRequest<PermissionResponse>(`/api/v1/admin/permissions/${id}`);
}

/**
 * Get permissions by group
 */
export async function getPermissionsByGroup(group: string): Promise<ApiResult<PermissionsByGroupResponse>> {
    return apiRequest<PermissionsByGroupResponse>(`/api/v1/admin/permissions/group/${group}`);
}





