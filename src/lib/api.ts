/**
 * API utility for making secure HTTP requests
 * Handles authentication, error handling, and multilingual support
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiError {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
    success: true;
    message: string;
    data: T;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

/**
 * Get the current language from cookies or localStorage
 */
function getLanguage(): string {
    if (typeof window === 'undefined') return 'en';

    // Try to get from cookie first (server-side preference)
    const cookies = document.cookie.split(';');
    const langCookie = cookies.find(c => c.trim().startsWith('language='));
    if (langCookie) {
        const lang = langCookie.split('=')[1]?.trim();
        if (lang === 'ar' || lang === 'en') return lang;
    }

    // Fallback to localStorage
    const stored = localStorage.getItem('language');
    return stored === 'ar' ? 'ar' : 'en';
}

/**
 * Get authentication token from secure storage
 */
export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
        // In production, tokens should be stored in httpOnly cookies
        // For now, we'll use a secure localStorage approach with encryption
        const token = localStorage.getItem('auth_token');
        return token;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
}

/**
 * Store authentication token securely
 */
export function setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem('auth_token', token);
    } catch (error) {
        console.error('Error storing auth token:', error);
    }
}

/**
 * Remove authentication token
 */
export function removeAuthToken(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
    } catch (error) {
        console.error('Error removing auth token:', error);
    }
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResult<T>> {
    const language = getLanguage();
    const token = getAuthToken();

    // Properly construct URL with query parameters
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${API_BASE_URL}${endpoint}${separator}lang=${language}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': language,
        ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include', // Include cookies for CSRF protection
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Request failed',
                errors: data.errors,
            };
        }

        return data as ApiResponse<T>;
    } catch (error) {
        console.error('API request error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Network error occurred',
        };
    }
}

/**
 * Make an authenticated API request with FormData (for file uploads)
 */
export async function apiRequestFormData<T>(
    endpoint: string,
    formData: FormData,
    method: 'POST' | 'PUT' | 'PATCH' = 'POST'
): Promise<ApiResult<T>> {
    const language = getLanguage();
    const token = getAuthToken();

    // Properly construct URL with query parameters
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${API_BASE_URL}${endpoint}${separator}lang=${language}`;

    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Accept-Language': language,
    };

    // Add authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Note: Don't set Content-Type header - browser will set it automatically with boundary for FormData

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: formData,
            credentials: 'include', // Include cookies for CSRF protection
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Request failed',
                errors: data.errors,
            };
        }

        return data as ApiResponse<T>;
    } catch (error) {
        console.error('API request error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Network error occurred',
        };
    }
}

/**
 * Login API call
 */
export interface LoginRequest {
    identifier: string; // Email, username, or phone number
    password: string;
    device_token?: string | null;
}

export interface LoginResponse {
    user: {
        id: number;
        first_name: string;
        middle_name: string | null;
        last_name: string;
        full_name: string;
        username: string;
        email: string;
        phone_number: string | null;
        email_verified_at: string | null;
        phone_number_verified_at: string | null;
        is_verified: boolean;
        is_banned: boolean;
        ban_cause: string | null;
        last_login_at: string | null;
        is_system_owner_admin: boolean;
        profile_url: string | null;
        created_at: string;
        updated_at: string;
    };
    token: string;
}

export async function login(credentials: LoginRequest): Promise<ApiResult<LoginResponse>> {
    return apiRequest<LoginResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
}

/**
 * Institution API calls
 */
export interface Institution {
    id: number;
    name_ar: string;
    name_en: string;
    activity_ar: string;
    activity_en: string;
    phone_number: string;
    secondary_phone_number?: string | null;
    email: string;
    website?: string | null;
    address?: string | null;
    country: string;
    tax_number?: string | null;
    business_registry?: string | null;
    system_type: 'restaurant' | 'retail';
    default_currency?: string | null;
    notes?: string | null;
    logo_url?: string | null;
    branches_count?: number;
    employees_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface InstitutionListResponse {
    data: {
        institutions: Institution[];
        current_page?: number;
        per_page?: number;
        total?: number;
        last_page?: number;
    };
}

export interface CreateInstitutionRequest {
    name_ar: string;
    name_en: string;
    activity_ar: string;
    activity_en: string;
    phone_number: string;
    secondary_phone_number?: string;
    email: string;
    website?: string;
    address?: string;
    country: string;
    tax_number?: string;
    business_registry?: string;
    system_type: 'restaurant' | 'retail';
    default_currency?: string;
    notes?: string;
    admin_user_id: number;
    logo?: File;
}

export interface InstitutionResponse {
    institution: Institution;
}

export interface InstitutionStatistics {
    total_institutions: number;
    total_branches: number;
    total_employees: number;
    total_revenue: number;
}

export interface InstitutionStatisticsResponse {
    statistics: InstitutionStatistics;
}

/**
 * Get institutions statistics
 */
export async function getInstitutionStatistics(): Promise<ApiResult<InstitutionStatisticsResponse>> {
    return apiRequest<InstitutionStatisticsResponse>('/api/v1/institutions/statistics', {
        method: 'GET',
    });
}

/**
 * Get list of institutions
 */
export async function getInstitutions(params?: { per_page?: number; system_type?: string; country?: string }): Promise<ApiResult<InstitutionListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.system_type) queryParams.append('system_type', params.system_type);
    if (params?.country) queryParams.append('country', params.country);

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/institutions${queryString ? `?${queryString}` : ''}`;

    return apiRequest<InstitutionListResponse>(endpoint, {
        method: 'GET',
    });
}

/**
 * Create a new institution
 */
export async function createInstitution(data: CreateInstitutionRequest, logoFile?: File): Promise<ApiResult<InstitutionResponse>> {
    if (logoFile) {
        const formData = new FormData();
        formData.append('name_ar', data.name_ar);
        formData.append('name_en', data.name_en);
        formData.append('activity_ar', data.activity_ar);
        formData.append('activity_en', data.activity_en);
        formData.append('phone_number', data.phone_number);
        formData.append('email', data.email);
        formData.append('country', data.country);
        formData.append('system_type', data.system_type);
        formData.append('admin_user_id', String(data.admin_user_id));
        if (data.secondary_phone_number) formData.append('secondary_phone_number', data.secondary_phone_number);
        if (data.website) formData.append('website', data.website);
        if (data.address) formData.append('address', data.address);
        if (data.tax_number) formData.append('tax_number', data.tax_number);
        if (data.business_registry) formData.append('business_registry', data.business_registry);
        if (data.default_currency) formData.append('default_currency', data.default_currency);
        if (data.notes) formData.append('notes', data.notes);
        formData.append('logo', logoFile);
        return apiRequestFormData<InstitutionResponse>('/api/v1/institutions', formData, 'POST');
    }
    return apiRequest<InstitutionResponse>('/api/v1/institutions', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Get a single institution by ID
 */
export async function getInstitution(id: number): Promise<ApiResult<InstitutionResponse>> {
    return apiRequest<InstitutionResponse>(`/api/v1/institutions/${id}`, {
        method: 'GET',
    });
}

/**
 * Update an institution
 */
export async function updateInstitution(id: number, data: Partial<CreateInstitutionRequest>, logoFile?: File): Promise<ApiResult<InstitutionResponse>> {
    const formData = new FormData();
    if (data.name_ar) formData.append('name_ar', data.name_ar);
    if (data.name_en) formData.append('name_en', data.name_en);
    if (data.activity_ar) formData.append('activity_ar', data.activity_ar);
    if (data.activity_en) formData.append('activity_en', data.activity_en);
    if (data.phone_number) formData.append('phone_number', data.phone_number);
    if (data.secondary_phone_number !== undefined) formData.append('secondary_phone_number', data.secondary_phone_number || '');
    if (data.email) formData.append('email', data.email);
    if (data.website !== undefined) formData.append('website', data.website || '');
    if (data.address !== undefined) formData.append('address', data.address || '');
    if (data.country) formData.append('country', data.country);
    if (data.tax_number !== undefined) formData.append('tax_number', data.tax_number || '');
    if (data.business_registry !== undefined) formData.append('business_registry', data.business_registry || '');
    if (data.system_type) formData.append('system_type', data.system_type);
    if (data.default_currency !== undefined) formData.append('default_currency', data.default_currency || '');
    if (data.notes !== undefined) formData.append('notes', data.notes || '');
    if (logoFile) {
        formData.append('logo', logoFile);
    }
    formData.append('_method', 'PUT');
    return apiRequestFormData<InstitutionResponse>(`/api/v1/institutions/${id}`, formData, 'POST');
}

/**
 * Delete an institution
 */
export async function deleteInstitution(id: number): Promise<ApiResult<void>> {
    return apiRequest<void>(`/api/v1/institutions/${id}`, {
        method: 'DELETE',
    });
}

/**
 * Branch API calls
 */
export interface Branch {
    id: number;
    name_ar: string;
    name_en: string;
    institution_id: number;
    location_name_ar: string;
    location_name_en: string;
    is_main: boolean;
    is_active: boolean;
    phone_number: string | null;
    email: string | null;
    institution?: Institution;
    created_at?: string;
    updated_at?: string;
}

export interface BranchListResponse {
    branches: {
        data: Branch[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

export interface CreateBranchRequest {
    name_ar: string;
    name_en: string;
    institution_id: number;
    location_name_ar: string;
    location_name_en: string;
    is_main?: boolean;
    phone_number?: string;
    email?: string;
    is_active?: boolean;
}

export interface BranchResponse {
    branch: Branch;
}

/**
 * Get list of branches
 */
export async function getBranches(params?: { per_page?: number; institution_id?: number; is_active?: boolean; is_main?: boolean }): Promise<ApiResult<BranchListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.institution_id) queryParams.append('institution_id', params.institution_id.toString());
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.is_main !== undefined) queryParams.append('is_main', params.is_main.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/branches${queryString ? `?${queryString}` : ''}`;

    return apiRequest<BranchListResponse>(endpoint, {
        method: 'GET',
    });
}

/**
 * Create a new branch
 */
export async function createBranch(data: CreateBranchRequest): Promise<ApiResult<BranchResponse>> {
    return apiRequest<BranchResponse>('/api/v1/branches', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Get a single branch by ID
 */
export async function getBranch(id: number): Promise<ApiResult<BranchResponse>> {
    return apiRequest<BranchResponse>(`/api/v1/branches/${id}`, {
        method: 'GET',
    });
}

/**
 * Update an existing branch
 */
export async function updateBranch(id: number, data: Partial<CreateBranchRequest>): Promise<ApiResult<BranchResponse>> {
    return apiRequest<BranchResponse>(`/api/v1/branches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a branch
 */
export async function deleteBranch(id: number): Promise<ApiResult<void>> {
    return apiRequest<void>(`/api/v1/branches/${id}`, {
        method: 'DELETE',
    });
}

/**
 * Institution Employee API calls
 */
export interface InstitutionEmployee {
    id: number;
    user_id: number;
    institution_role_id: number;
    institution_id?: number;
    position?: string;
    department?: string;
    salary?: number;
    join_date?: string;
    status?: string;
    shift_id?: string | null;
    assigned_warehouse_id?: number | null;
    user?: User;
    institution_role?: {
        id: number;
        name_ar: string;
        name_en: string;
    };
    created_at?: string;
    updated_at?: string;
}

export interface InstitutionEmployeeListResponse {
    employees: InstitutionEmployee[];
}

export interface InstitutionEmployeeResponse {
    employee: InstitutionEmployee;
}

export interface CreateInstitutionEmployeeRequest {
    user_id: number;
    institution_role_id: number;
    position: string;
    department: string;
    salary: number;
    join_date: string;
    status?: string | null;
    shift_id?: string | null;
    assigned_warehouse_id?: number | null;
}

/**
 * Get list of employees for an institution
 */
export async function getInstitutionEmployees(institutionId: number): Promise<ApiResult<InstitutionEmployeeListResponse>> {
    return apiRequest<InstitutionEmployeeListResponse>(`/api/v1/institutions/${institutionId}/employees`, {
        method: 'GET',
    });
}

/**
 * Create (assign) a new employee to an institution
 */
export async function createInstitutionEmployee(
    institutionId: number,
    data: CreateInstitutionEmployeeRequest
): Promise<ApiResult<InstitutionEmployeeResponse>> {
    return apiRequest<InstitutionEmployeeResponse>(`/api/v1/institutions/${institutionId}/employees`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Institution Role API calls
 */
export interface InstitutionRole {
    id: number;
    institution_id: number;
    name_en: string;
    name_ar: string;
}

export interface InstitutionRoleListResponse {
    roles: InstitutionRole[];
}

export async function getInstitutionRoles(institutionId: number): Promise<ApiResult<InstitutionRoleListResponse>> {
    return apiRequest<InstitutionRoleListResponse>(`/api/v1/institutions/${institutionId}/roles`, {
        method: 'GET',
    });
}

/**
 * User API calls
 */
export interface User {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    full_name: string;
    username: string;
    email: string;
    phone_number: string | null;
    is_system_owner_admin: boolean;
    is_banned: boolean;
    roles?: Array<{
        id: number;
        name: string;
        slug: string;
        description?: string;
        is_system: boolean;
        is_active: boolean;
        pivot?: {
            assigned_at: string;
            assigned_by: number | null;
        };
    }>;
}

export interface UserListResponse {
    users: {
        data: User[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

/**
 * Get list of users (for admin selection)
 */
export async function getUsers(params?: { per_page?: number; search?: string }): Promise<ApiResult<{ users: User[] }>> {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin/users${queryString ? `?${queryString}` : ''}`;

    const result = await apiRequest<UserListResponse>(endpoint, {
        method: 'GET',
    });

    if (result.success) {
        // Extract users array from paginated response
        const usersData = result.data.users;
        const usersList = usersData?.data || (Array.isArray(usersData) ? usersData : []);

        return {
            success: true,
            message: result.message,
            data: { users: usersList }
        };
    }

    return result;
}

/**
 * Warehouse API calls
 */
export interface Warehouse {
    id: number;
    name_ar: string;
    name_en: string;
    branch_id: number;
    location_ar: string;
    location_en: string;
    capacity: number;
    is_active: boolean;
    is_default: boolean;
    notes?: string | null;
    branch?: Branch;
    created_at?: string;
    updated_at?: string;
}

export interface WarehouseListResponse {
    warehouses: {
        data: Warehouse[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

export interface CreateWarehouseRequest {
    name_ar: string;
    name_en: string;
    branch_id: number;
    location_ar: string;
    location_en: string;
    capacity: number;
    is_active?: boolean;
    is_default?: boolean;
    notes?: string;
}

export interface WarehouseResponse {
    warehouse: Warehouse;
}

/**
 * Get list of warehouses
 */
export async function getWarehouses(params?: { per_page?: number; branch_id?: number; is_active?: boolean; is_default?: boolean }): Promise<ApiResult<WarehouseListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.branch_id) queryParams.append('branch_id', params.branch_id.toString());
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.is_default !== undefined) queryParams.append('is_default', params.is_default.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/warehouses${queryString ? `?${queryString}` : ''}`;

    return apiRequest<WarehouseListResponse>(endpoint, {
        method: 'GET',
    });
}

/**
 * Create a new warehouse
 */
export async function createWarehouse(data: CreateWarehouseRequest): Promise<ApiResult<WarehouseResponse>> {
    return apiRequest<WarehouseResponse>('/api/v1/warehouses', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Get a single warehouse by ID
 */
export async function getWarehouse(id: number): Promise<ApiResult<WarehouseResponse>> {
    return apiRequest<WarehouseResponse>(`/api/v1/warehouses/${id}`, {
        method: 'GET',
    });
}

/**
 * Update an existing warehouse
 */
export async function updateWarehouse(id: number, data: Partial<CreateWarehouseRequest>): Promise<ApiResult<WarehouseResponse>> {
    return apiRequest<WarehouseResponse>(`/api/v1/warehouses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a warehouse
 */
export async function deleteWarehouse(id: number): Promise<ApiResult<void>> {
    return apiRequest<void>(`/api/v1/warehouses/${id}`, {
        method: 'DELETE',
    });
}

/**
 * Warehouse Storage API calls
 */
export interface WarehouseStorage {
    id: number;
    name_ar: string;
    name_en: string;
    capacity: number;
    warehouse_id: number;
    shelves?: WarehouseStorageShelf[];
    created_at?: string;
    updated_at?: string;
}

export interface WarehouseStorageListResponse {
    storages: WarehouseStorage[];
}

export interface CreateWarehouseStorageRequest {
    name_ar: string;
    name_en: string;
    capacity: number;
}

export interface WarehouseStorageResponse {
    storage: WarehouseStorage;
}

/**
 * Get list of storages for a warehouse
 */
export async function getWarehouseStorages(warehouseId: number): Promise<ApiResult<WarehouseStorageListResponse>> {
    return apiRequest<WarehouseStorageListResponse>(`/api/v1/warehouses/${warehouseId}/storages`, {
        method: 'GET',
    });
}

/**
 * Create a new warehouse storage
 */
export async function createWarehouseStorage(warehouseId: number, data: CreateWarehouseStorageRequest): Promise<ApiResult<WarehouseStorageResponse>> {
    return apiRequest<WarehouseStorageResponse>(`/api/v1/warehouses/${warehouseId}/storages`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Get a single warehouse storage by ID
 */
export async function getWarehouseStorage(warehouseId: number, storageId: number): Promise<ApiResult<WarehouseStorageResponse>> {
    return apiRequest<WarehouseStorageResponse>(`/api/v1/warehouses/${warehouseId}/storages/${storageId}`, {
        method: 'GET',
    });
}

/**
 * Update a warehouse storage
 */
export async function updateWarehouseStorage(warehouseId: number, storageId: number, data: Partial<CreateWarehouseStorageRequest>): Promise<ApiResult<WarehouseStorageResponse>> {
    return apiRequest<WarehouseStorageResponse>(`/api/v1/warehouses/${warehouseId}/storages/${storageId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a warehouse storage
 */
export async function deleteWarehouseStorage(warehouseId: number, storageId: number): Promise<ApiResult<void>> {
    return apiRequest<void>(`/api/v1/warehouses/${warehouseId}/storages/${storageId}`, {
        method: 'DELETE',
    });
}

/**
 * Warehouse Storage Shelf API calls
 */
export interface WarehouseStorageShelf {
    id: number;
    code: string;
    capacity: number;
    level: number | null;
    is_active: boolean;
    warehouse_storage_id: number;
    warehouseStorage?: WarehouseStorage;
    created_at?: string;
    updated_at?: string;
}

export interface WarehouseStorageShelfListResponse {
    shelves: WarehouseStorageShelf[];
}

export interface CreateWarehouseStorageShelfRequest {
    code: string;
    capacity: number;
    level?: number | null;
    is_active?: boolean;
}

export interface WarehouseStorageShelfResponse {
    shelf: WarehouseStorageShelf;
}

/**
 * Get list of shelves for a warehouse storage
 */
export async function getWarehouseStorageShelves(warehouseId: number, storageId: number): Promise<ApiResult<WarehouseStorageShelfListResponse>> {
    return apiRequest<WarehouseStorageShelfListResponse>(`/api/v1/warehouses/${warehouseId}/storages/${storageId}/shelves`, {
        method: 'GET',
    });
}

/**
 * Create a new warehouse storage shelf
 */
export async function createWarehouseStorageShelf(warehouseId: number, storageId: number, data: CreateWarehouseStorageShelfRequest): Promise<ApiResult<WarehouseStorageShelfResponse>> {
    return apiRequest<WarehouseStorageShelfResponse>(`/api/v1/warehouses/${warehouseId}/storages/${storageId}/shelves`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Get a single warehouse storage shelf by ID
 */
export async function getWarehouseStorageShelf(warehouseId: number, storageId: number, shelfId: number): Promise<ApiResult<WarehouseStorageShelfResponse>> {
    return apiRequest<WarehouseStorageShelfResponse>(`/api/v1/warehouses/${warehouseId}/storages/${storageId}/shelves/${shelfId}`, {
        method: 'GET',
    });
}

/**
 * Update a warehouse storage shelf
 */
export async function updateWarehouseStorageShelf(warehouseId: number, storageId: number, shelfId: number, data: Partial<CreateWarehouseStorageShelfRequest>): Promise<ApiResult<WarehouseStorageShelfResponse>> {
    return apiRequest<WarehouseStorageShelfResponse>(`/api/v1/warehouses/${warehouseId}/storages/${storageId}/shelves/${shelfId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a warehouse storage shelf
 */
export async function deleteWarehouseStorageShelf(warehouseId: number, storageId: number, shelfId: number): Promise<ApiResult<void>> {
    return apiRequest<void>(`/api/v1/warehouses/${warehouseId}/storages/${storageId}/shelves/${shelfId}`, {
        method: 'DELETE',
    });
}

/**
 * Safe API calls
 */
export interface Safe {
    id: number;
    name_ar: string;
    name_en: string;
    branch_id: number;
    is_active: boolean;
    current_balance: number;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    branch?: Branch;
}

export interface SafeResponse {
    safe: Safe;
}

export interface SafesResponse {
    safes: {
        data: Safe[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface CreateSafeRequest {
    name_ar: string;
    name_en: string;
    branch_id: number;
    is_active?: boolean;
    current_balance?: number;
    notes?: string;
}

/**
 * Get all safes
 */
export async function getSafes(params?: { per_page?: number; branch_id?: number; is_active?: boolean }): Promise<ApiResult<SafesResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.branch_id) queryParams.append('branch_id', params.branch_id.toString());
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

    const queryString = queryParams.toString();
    return apiRequest<SafesResponse>(`/api/v1/safes${queryString ? `?${queryString}` : ''}`);
}

/**
 * Get a single safe by ID
 */
export async function getSafe(id: number): Promise<ApiResult<SafeResponse>> {
    return apiRequest<SafeResponse>(`/api/v1/safes/${id}`);
}

/**
 * Create a new safe
 */
export async function createSafe(data: CreateSafeRequest): Promise<ApiResult<SafeResponse>> {
    return apiRequest<SafeResponse>('/api/v1/safes', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Update an existing safe
 */
export async function updateSafe(id: number, data: Partial<CreateSafeRequest>): Promise<ApiResult<SafeResponse>> {
    return apiRequest<SafeResponse>(`/api/v1/safes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a safe
 */
export async function deleteSafe(id: number): Promise<ApiResult<void>> {
    return apiRequest<void>(`/api/v1/safes/${id}`, {
        method: 'DELETE',
    });
}

/**
 * Settings API calls
 */
export interface Setting {
    id: number;
    key: string;
    value: any;
    type: 'string' | 'integer' | 'boolean' | 'json' | 'text';
    group: string;
    scope: 'system' | 'institution' | 'branch' | 'user';
    label_en?: string | null;
    label_ar?: string | null;
    description_en?: string | null;
    description_ar?: string | null;
    is_encrypted?: boolean;
    institution_id?: number | null;
    branch_id?: number | null;
    user_id?: number | null;
    created_at?: string;
    updated_at?: string;
}

export interface SettingListResponse {
    settings: {
        data: Setting[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

export interface SettingResponse {
    setting: Setting;
}

export interface CreateSettingRequest {
    key: string;
    value?: any;
    type?: 'string' | 'integer' | 'boolean' | 'json' | 'text';
    group?: string;
    label_en?: string;
    label_ar?: string;
    description_en?: string;
    description_ar?: string;
    is_encrypted?: boolean;
    scope: 'system' | 'institution' | 'branch' | 'user';
    institution_id?: number;
    branch_id?: number;
    user_id?: number;
}

export interface UpdateSettingRequest extends Partial<CreateSettingRequest> {
    value?: any;
}

/**
 * Get all settings
 */
export async function getSettings(params?: {
    per_page?: number;
    scope?: 'system' | 'institution' | 'branch' | 'user';
    group?: string;
    institution_id?: number;
    branch_id?: number;
    user_id?: number;
}): Promise<ApiResult<SettingListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.scope) queryParams.append('scope', params.scope);
    if (params?.group) queryParams.append('group', params.group);
    if (params?.institution_id) queryParams.append('institution_id', params.institution_id.toString());
    if (params?.branch_id) queryParams.append('branch_id', params.branch_id.toString());
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/settings${queryString ? `?${queryString}` : ''}`;

    return apiRequest<SettingListResponse>(endpoint, {
        method: 'GET',
    });
}

/**
 * Get a setting by key
 */
export async function getSettingByKey(
    key: string,
    params?: {
        scope?: 'system' | 'institution' | 'branch' | 'user';
        institution_id?: number;
        branch_id?: number;
        user_id?: number;
    }
): Promise<ApiResult<SettingResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.scope) queryParams.append('scope', params.scope);
    if (params?.institution_id) queryParams.append('institution_id', params.institution_id.toString());
    if (params?.branch_id) queryParams.append('branch_id', params.branch_id.toString());
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/settings/key/${key}${queryString ? `?${queryString}` : ''}`;

    return apiRequest<SettingResponse>(endpoint, {
        method: 'GET',
    });
}

/**
 * Get a single setting by ID
 */
export async function getSetting(id: number): Promise<ApiResult<SettingResponse>> {
    return apiRequest<SettingResponse>(`/api/v1/settings/${id}`, {
        method: 'GET',
    });
}

/**
 * Create a new setting
 */
export async function createSetting(data: CreateSettingRequest): Promise<ApiResult<SettingResponse>> {
    return apiRequest<SettingResponse>('/api/v1/settings', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Update an existing setting
 */
export async function updateSetting(id: number, data: UpdateSettingRequest): Promise<ApiResult<SettingResponse>> {
    return apiRequest<SettingResponse>(`/api/v1/settings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a setting
 */
export async function deleteSetting(id: number): Promise<ApiResult<void>> {
    return apiRequest<void>(`/api/v1/settings/${id}`, {
        method: 'DELETE',
    });
}

export interface BatchUpdateSettingsRequest {
    settings: CreateSettingRequest[];
}

export interface BatchUpdateSettingsResponse {
    settings: Setting[];
}

/**
 * Batch update or create multiple settings at once
 */
export async function batchUpdateSettings(data: BatchUpdateSettingsRequest): Promise<ApiResult<BatchUpdateSettingsResponse>> {
    return apiRequest<BatchUpdateSettingsResponse>('/api/v1/settings/batch', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
