/**
 * Institution Roles API
 * Handles all API calls related to institution-specific roles management
 */

import { apiRequest, ApiResult } from './api';
import type { Permission } from './roles-api';

// ==================== Types ====================

export interface InstitutionRole {
    id: number;
    institution_id: number;
    name_en: string;
    name_ar: string;
    permissions?: Permission[];
    branches?: Array<{
        id: number;
        name_ar: string;
        name_en: string;
    }>;
    users?: Array<{
        id: number;
        full_name: string;
    }>;
    created_at?: string;
    updated_at?: string;
}

export interface InstitutionEmployee {
    id: number;
    institution_role_id: number;
    user_id: number;
    user: {
        id: number;
        full_name: string;
        email: string;
        username?: string;
    };
    institution_role?: InstitutionRole;
}

export interface InstitutionRolesListResponse {
    roles: InstitutionRole[];
}

export interface InstitutionRoleResponse {
    role: InstitutionRole;
}

export interface InstitutionEmployeesListResponse {
    employees: InstitutionEmployee[];
}

export interface InstitutionEmployeeResponse {
    employee: InstitutionEmployee;
}

export interface CreateInstitutionRoleRequest {
    name_en: string;
    name_ar: string;
}

export interface UpdateInstitutionRoleRequest {
    name_en?: string;
    name_ar?: string;
}

export interface AssignPermissionsRequest {
    permission_ids: number[];
}

export interface AssignEmployeeRequest {
    user_id: number;
    institution_role_id: number;
}

// ==================== Institution Roles API ====================

/**
 * List all roles for a specific institution
 */
export async function listInstitutionRoles(institutionId: number): Promise<ApiResult<InstitutionRolesListResponse>> {
    return apiRequest<InstitutionRolesListResponse>(`/api/v1/institutions/${institutionId}/roles`);
}

/**
 * Get a single institution role by ID
 */
export async function getInstitutionRole(institutionId: number, roleId: number): Promise<ApiResult<InstitutionRoleResponse>> {
    return apiRequest<InstitutionRoleResponse>(`/api/v1/institutions/${institutionId}/roles/${roleId}`);
}

/**
 * Create a new institution role
 */
export async function createInstitutionRole(institutionId: number, data: CreateInstitutionRoleRequest): Promise<ApiResult<InstitutionRoleResponse>> {
    return apiRequest<InstitutionRoleResponse>(`/api/v1/institutions/${institutionId}/roles`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Update an existing institution role
 */
export async function updateInstitutionRole(institutionId: number, roleId: number, data: UpdateInstitutionRoleRequest): Promise<ApiResult<InstitutionRoleResponse>> {
    return apiRequest<InstitutionRoleResponse>(`/api/v1/institutions/${institutionId}/roles/${roleId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * Delete an institution role
 */
export async function deleteInstitutionRole(institutionId: number, roleId: number): Promise<ApiResult<{ message: string }>> {
    return apiRequest<{ message: string }>(`/api/v1/institutions/${institutionId}/roles/${roleId}`, {
        method: 'DELETE',
    });
}

/**
 * Assign permissions to an institution role
 */
export async function assignPermissionsToInstitutionRole(
    institutionId: number,
    roleId: number,
    permissionIds: number[]
): Promise<ApiResult<InstitutionRoleResponse>> {
    return apiRequest<InstitutionRoleResponse>(`/api/v1/institutions/${institutionId}/roles/${roleId}/permissions`, {
        method: 'POST',
        body: JSON.stringify({ permission_ids: permissionIds }),
    });
}

/**
 * Sync permissions for an institution role (replaces all existing permissions)
 */
export async function syncPermissionsForInstitutionRole(
    institutionId: number,
    roleId: number,
    permissionIds: number[]
): Promise<ApiResult<InstitutionRoleResponse>> {
    return apiRequest<InstitutionRoleResponse>(`/api/v1/institutions/${institutionId}/roles/${roleId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permission_ids: permissionIds }),
    });
}

/**
 * Revoke permissions from an institution role
 */
export async function revokePermissionsFromInstitutionRole(
    institutionId: number,
    roleId: number,
    permissionIds: number[]
): Promise<ApiResult<InstitutionRoleResponse>> {
    return apiRequest<InstitutionRoleResponse>(`/api/v1/institutions/${institutionId}/roles/${roleId}/permissions`, {
        method: 'DELETE',
        body: JSON.stringify({ permission_ids: permissionIds }),
    });
}

/**
 * Sync branches for an institution role
 */
export async function syncBranchesForInstitutionRole(
    institutionId: number,
    roleId: number,
    branchIds: number[]
): Promise<ApiResult<InstitutionRoleResponse>> {
    return apiRequest<InstitutionRoleResponse>(`/api/v1/institutions/${institutionId}/roles/${roleId}/branches`, {
        method: 'PUT',
        body: JSON.stringify({ branch_ids: branchIds }),
    });
}

// ==================== Institution Employees API ====================

/**
 * List all employees for a specific institution
 */
export async function listInstitutionEmployees(institutionId: number): Promise<ApiResult<InstitutionEmployeesListResponse>> {
    return apiRequest<InstitutionEmployeesListResponse>(`/api/v1/institutions/${institutionId}/employees`);
}

/**
 * Assign a user to an institution role
 */
export async function assignUserToInstitutionRole(
    institutionId: number,
    userId: number,
    roleId: number
): Promise<ApiResult<InstitutionEmployeeResponse>> {
    return apiRequest<InstitutionEmployeeResponse>(`/api/v1/institutions/${institutionId}/employees`, {
        method: 'POST',
        body: JSON.stringify({
            user_id: userId,
            institution_role_id: roleId,
        }),
    });
}

/**
 * Remove a user from an institution (revokes their institution role)
 */
export async function removeUserFromInstitution(
    institutionId: number,
    userId: number
): Promise<ApiResult<{ message: string }>> {
    return apiRequest<{ message: string }>(`/api/v1/institutions/${institutionId}/employees/${userId}`, {
        method: 'DELETE',
    });
}
