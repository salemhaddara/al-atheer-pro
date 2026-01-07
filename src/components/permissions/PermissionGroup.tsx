'use client';

import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import type { PermissionGroupProps } from './types';

export function PermissionGroup({
    group,
    permissions,
    selectedPermissionIds,
    onTogglePermission,
    onToggleGroup,
    direction,
}: PermissionGroupProps) {
    const allSelected = permissions.every((p) => selectedPermissionIds.includes(p.id));
    const someSelected = permissions.some((p) => selectedPermissionIds.includes(p.id));
    const selectedCount = permissions.filter((p) => selectedPermissionIds.includes(p.id)).length;

    return (
        <div className="mb-4 last:mb-0">
            <div
                className={`flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded ${direction === 'rtl' ? 'flex-row-reverse' : ''
                    }`}
            >
                <Checkbox
                    id={`group-${group}`}
                    checked={allSelected}
                    onCheckedChange={() => onToggleGroup(permissions)}
                />
                <Label htmlFor={`group-${group}`} className="font-medium cursor-pointer capitalize">
                    {group}
                    {someSelected && !allSelected && (
                        <span className="text-xs text-gray-500 ml-1">({selectedCount} selected)</span>
                    )}
                </Label>
                <Badge variant="outline" className="ml-auto">
                    {selectedCount} / {permissions.length}
                </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 ml-6">
                {permissions.map((permission) => (
                    <div
                        key={permission.id}
                        className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}
                    >
                        <Checkbox
                            id={`perm-${permission.id}`}
                            checked={selectedPermissionIds.includes(permission.id)}
                            onCheckedChange={() => onTogglePermission(permission.id)}
                        />
                        <Label htmlFor={`perm-${permission.id}`} className="text-sm cursor-pointer">
                            {permission.name}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
}





