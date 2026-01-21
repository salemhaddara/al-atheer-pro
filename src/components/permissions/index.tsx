'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRoles, useRoleMutations, usePermissionMutations } from '@/hooks/useRoles';
import { getInstitutions, type Institution } from '@/lib/api';
import {
    listInstitutionRoles,
    createInstitutionRole,
    deleteInstitutionRole,
    syncPermissionsForInstitutionRole,
    type InstitutionRole,
} from '@/lib/institution-roles-api';
import { Loading } from '../Loading';
import { PermissionsHeader } from './PermissionsHeader';
import { PermissionsStats } from './PermissionsStats';
import { RolesTable } from './RolesTable';
import { InstitutionRoleFormDialog } from './InstitutionRoleFormDialog';
import { RoleFormDialog } from './RoleFormDialog';
import { ViewRoleDialog } from './ViewRoleDialog';
import { ManagePermissionsDialog } from './ManagePermissionsDialog';
import { AssignUsersDialog } from './AssignUsersDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Label } from '../ui/label';
import type { Role } from '@/lib/roles-api';
import type { RoleFormData, PermissionsStats as Stats } from './types';

export function Permissions() {
    const { t, direction } = useLanguage();
    const { roles, loading: rolesLoading, refetch: refetchRoles } = useRoles(50);
    const { create, update, remove, loading: mutationLoading } = useRoleMutations();
    const { sync: syncPermissions, loading: permissionSyncLoading } = usePermissionMutations();

    const [activeTab, setActiveTab] = useState<'global' | 'institution'>('global');
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | null>(null);
    const [institutionsLoading, setInstitutionsLoading] = useState(false);

    // Institution roles state
    const [institutionRoles, setInstitutionRoles] = useState<InstitutionRole[]>([]);
    const [institutionRolesLoading, setInstitutionRolesLoading] = useState(false);

    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [selectedInstitutionRole, setSelectedInstitutionRole] = useState<InstitutionRole | null>(null);
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

    // Fetch institutions when component mounts
    useEffect(() => {
        const fetchInstitutions = async () => {
            setInstitutionsLoading(true);
            const result = await getInstitutions({ per_page: 100 });
            if (result.success) {
                setInstitutions(result.data.institutions.data);
            }
            setInstitutionsLoading(false);
        };
        fetchInstitutions();
    }, []);

    // Fetch institution roles when institution is selected
    useEffect(() => {
        if (selectedInstitutionId && activeTab === 'institution') {
            fetchInstitutionRoles();
        }
    }, [selectedInstitutionId, activeTab]);

    const fetchInstitutionRoles = async () => {
        if (!selectedInstitutionId) return;

        setInstitutionRolesLoading(true);
        const result = await listInstitutionRoles(selectedInstitutionId);
        if (result.success) {
            setInstitutionRoles(result.data.roles);
        }
        setInstitutionRolesLoading(false);
    };

    // Filter roles based on active tab
    const filteredRoles = useMemo(() => {
        if (activeTab === 'global') {
            // Global roles: roles without institution_id
            return roles.filter((r) => !r.institution_id);
        }
        // For institution tab, we use institutionRoles state instead
        return [];
    }, [roles, activeTab]);

    // Convert institution roles to Role format for the table
    const displayRoles = useMemo(() => {
        if (activeTab === 'global') {
            return filteredRoles;
        } else {
            // Convert InstitutionRole to Role format
            return institutionRoles.map((ir): Role => ({
                id: ir.id,
                name: direction === 'rtl' ? ir.name_ar : ir.name_en,
                slug: `institution-role-${ir.id}`,
                description: '',
                is_system: false,
                is_active: true,
                institution_id: ir.institution_id,
                branch_id: null,
                permissions: ir.permissions || [],
                created_at: ir.created_at || '',
                updated_at: ir.updated_at || '',
            }));
        }
    }, [activeTab, filteredRoles, institutionRoles, direction]);

    // Statistics
    const stats: Stats = useMemo(() => {
        return {
            totalUsers: 0,
            definedRoles: displayRoles.length,
            activeRoles: displayRoles.filter((r) => r.is_active).length,
            suspendedUsers: 0,
        };
    }, [displayRoles]);

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            is_active: true,
        });
    };

    // Handle create role (Global)
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

    // Handle create institution role
    const handleCreateInstitutionRole = async (name_en: string, name_ar: string) => {
        if (!selectedInstitutionId) return;

        const result = await createInstitutionRole(selectedInstitutionId, {
            name_en,
            name_ar,
        });

        if (result.success) {
            setIsCreateDialogOpen(false);
            fetchInstitutionRoles();
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
        if (activeTab === 'institution' && selectedInstitutionId) {
            // Delete institution role
            if (!confirm(t('permissions.roles.confirmDelete') || `Are you sure you want to delete "${role.name}"?`)) {
                return;
            }

            const result = await deleteInstitutionRole(selectedInstitutionId, role.id);
            if (result.success) {
                fetchInstitutionRoles();
            }
        } else {
            // Delete global role
            if (!confirm(t('permissions.roles.confirmDelete') || `Are you sure you want to delete "${role.name}"?`)) {
                return;
            }

            const result = await remove(role.id);
            if (result.success) {
                refetchRoles();
            }
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
        if (activeTab === 'institution' && selectedInstitutionId) {
            // Sync permissions for institution role
            const result = await syncPermissionsForInstitutionRole(selectedInstitutionId, roleId, permissionIds);
            if (result.success) {
                setIsPermissionsDialogOpen(false);
                setSelectedRole(null);
                fetchInstitutionRoles();
            }
        } else {
            // Sync permissions for global role
            const result = await syncPermissions(roleId, permissionIds);
            if (result.success) {
                setIsPermissionsDialogOpen(false);
                setSelectedRole(null);
                refetchRoles();
            }
        }
    };

    // Handle tab change
    const handleTabChange = (value: string) => {
        setActiveTab(value as 'global' | 'institution');
        if (value === 'global') {
            setSelectedInstitutionId(null);
        }
    };

    const isLoading = rolesLoading || institutionsLoading;

    if (isLoading && roles.length === 0) {
        return <Loading />;
    }

    return (
        <div className="space-y-6" dir={direction}>
            <PermissionsHeader />
            <PermissionsStats stats={stats} />

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList>
                    <TabsTrigger value="global">{t('permissions.tabs.globalRoles')}</TabsTrigger>
                    <TabsTrigger value="institution">{t('permissions.tabs.institutionRoles')}</TabsTrigger>
                </TabsList>

                {/* Global Roles Tab */}
                <TabsContent value="global" className="mt-6">
                    <RolesTable
                        roles={displayRoles}
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
                </TabsContent>

                {/* Institution Roles Tab */}
                <TabsContent value="institution" className="mt-6 space-y-4">
                    {/* Institution Selector */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                        <Label className="mb-2 block">
                            {t('permissions.institutionRoles.selectInstitution')}
                        </Label>
                        <select
                            className="w-full md:w-96 px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                            value={selectedInstitutionId || ''}
                            onChange={(e) => setSelectedInstitutionId(e.target.value ? Number(e.target.value) : null)}
                        >
                            <option value="">
                                {t('permissions.institutionRoles.selectInstitutionPlaceholder')}
                            </option>
                            {institutions.map((inst) => (
                                <option key={inst.id} value={inst.id}>
                                    {direction === 'rtl' ? inst.name_ar : inst.name_en}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Roles Table or Empty State */}
                    {selectedInstitutionId ? (
                        institutionRolesLoading ? (
                            <Loading />
                        ) : (
                            <RolesTable
                                roles={displayRoles}
                                onCreateClick={() => setIsCreateDialogOpen(true)}
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onManagePermissions={handleManagePermissions}
                                onAssignUsers={handleAssignUsers}
                            />
                        )
                    ) : (
                        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg border text-center">
                            <h3 className="text-lg font-semibold mb-2">
                                {t('permissions.institutionRoles.noInstitutionSelected')}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {t('permissions.institutionRoles.selectInstitutionMessage')}
                            </p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Create/Edit Dialogs based on active tab */}
            {activeTab === 'global' ? (
                <>
                    <RoleFormDialog
                        mode="create"
                        isOpen={isCreateDialogOpen}
                        onOpenChange={setIsCreateDialogOpen}
                        formData={formData}
                        onFormDataChange={setFormData}
                        onSubmit={handleCreate}
                        loading={mutationLoading}
                    />

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
                </>
            ) : (
                <InstitutionRoleFormDialog
                    isOpen={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    onSubmit={handleCreateInstitutionRole}
                    loading={institutionRolesLoading}
                />
            )}

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
                institutionId={activeTab === 'institution' ? selectedInstitutionId : null}
            />
        </div>
    );
}
