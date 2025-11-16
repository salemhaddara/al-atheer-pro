import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Shield, Plus, Users, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

export function Permissions() {
  const { t, direction } = useLanguage();

  const [roles, setRoles] = useState([
    {
      id: '1',
      nameKey: 'permissions.roles.predefined.systemAdmin.name',
      descriptionKey: 'permissions.roles.predefined.systemAdmin.description',
      users: 2,
      permissions: ['all']
    },
    {
      id: '2',
      nameKey: 'permissions.roles.predefined.accountant.name',
      descriptionKey: 'permissions.roles.predefined.accountant.description',
      users: 5,
      permissions: ['accounting', 'invoices', 'reports']
    },
    {
      id: '3',
      nameKey: 'permissions.roles.predefined.salesManager.name',
      descriptionKey: 'permissions.roles.predefined.salesManager.description',
      users: 8,
      permissions: ['sales', 'customers', 'pos', 'reports']
    },
    {
      id: '4',
      nameKey: 'permissions.roles.predefined.warehouseManager.name',
      descriptionKey: 'permissions.roles.predefined.warehouseManager.description',
      users: 4,
      permissions: ['warehouses', 'products', 'inventory']
    },
    {
      id: '5',
      nameKey: 'permissions.roles.predefined.hrEmployee.name',
      descriptionKey: 'permissions.roles.predefined.hrEmployee.description',
      users: 3,
      permissions: ['hr', 'employees', 'payroll']
    },
    {
      id: '6',
      nameKey: 'permissions.roles.predefined.salesEmployee.name',
      descriptionKey: 'permissions.roles.predefined.salesEmployee.description',
      users: 12,
      permissions: ['pos', 'sales_view']
    }
  ]);

  const [users, setUsers] = useState([
    { id: '1', name: 'أحمد محمد', email: 'ahmed@company.com', roleKey: 'permissions.roles.predefined.systemAdmin.name', status: 'active' },
    { id: '2', name: 'فاطمة علي', email: 'fatima@company.com', roleKey: 'permissions.roles.predefined.accountant.name', status: 'active' },
    { id: '3', name: 'سعيد خالد', email: 'saeed@company.com', roleKey: 'permissions.roles.predefined.salesManager.name', status: 'active' },
    { id: '4', name: 'نورة عبدالله', email: 'noura@company.com', roleKey: 'permissions.roles.predefined.hrEmployee.name', status: 'active' },
    { id: '5', name: 'محمد أحمد', email: 'mohammed@company.com', roleKey: 'permissions.roles.predefined.salesEmployee.name', status: 'suspended' }
  ]);

  const permissionKeys = [
    'dashboard', 'accounting', 'invoices', 'sales', 'purchases', 'pos',
    'customers', 'suppliers', 'warehouses', 'products', 'inventory',
    'hr', 'employees', 'payroll', 'companies', 'branches', 'reports', 'settings'
  ];

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
          <h1>{t('permissions.title')}</h1>
          <p className="text-gray-600">{t('permissions.subtitle')}</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className={`flex flex-row items-center justify-between pb-2`}>
            <CardTitle className="text-sm">{t('permissions.stats.totalUsers')}</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">34</div>
            <p className="text-xs text-gray-600 mt-1">{t('permissions.stats.activeUsers')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className={`flex flex-row items-center justify-between pb-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
            <CardTitle className="text-sm">{t('permissions.stats.definedRoles')}</CardTitle>
            <Shield className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">6</div>
            <p className="text-xs text-gray-600 mt-1">{t('permissions.stats.differentRoles')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className={`flex flex-row items-center justify-between pb-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
            <CardTitle className="text-sm">{t('permissions.stats.suspendedUsers')}</CardTitle>
            <UserCircle className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">3</div>
            <p className="text-xs text-gray-600 mt-1">{t('permissions.stats.pendingActivation')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Roles Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('permissions.roles.title')}</CardTitle>
              <CardDescription>{t('permissions.roles.subtitle')}</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('permissions.roles.addNew')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={direction}>
                <DialogHeader className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                  <DialogTitle>{t('permissions.roles.createTitle')}</DialogTitle>
                  <DialogDescription>{t('permissions.roles.createDescription')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('permissions.roles.name')}</Label>
                    <Input placeholder={t('permissions.roles.namePlaceholder')} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('permissions.roles.description')}</Label>
                    <Input placeholder={t('permissions.roles.descriptionPlaceholder')} />
                  </div>
                  <div className="space-y-3">
                    <Label>{t('permissions.roles.permissions')}</Label>
                    <div className="grid grid-cols-2 gap-3 border rounded-lg p-4 max-h-96 overflow-y-auto">
                      {permissionKeys.map((key) => (
                        <div key={key} className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <Checkbox id={key} />
                          <label
                            htmlFor={key}
                            className="text-sm cursor-pointer"
                          >
                            {t(`permissions.permissionsList.${key}`)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => toast.success(t('permissions.roles.roleCreated'))}>
                    {t('permissions.roles.saveRole')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('permissions.roles.tableHeaders.roleName')}</TableHead>
                <TableHead>{t('permissions.roles.tableHeaders.description')}</TableHead>
                <TableHead>{t('permissions.roles.tableHeaders.userCount')}</TableHead>
                <TableHead>{t('permissions.roles.tableHeaders.permissionCount')}</TableHead>
                <TableHead>{t('permissions.roles.tableHeaders.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span>{t(role.nameKey)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">{t(role.descriptionKey)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.users} {t('permissions.roles.userCount')}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {role.permissions.includes('all') ? t('permissions.roles.allPermissions') : `${role.permissions.length} ${t('permissions.roles.permissionCount')}`}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={`flex gap-2 ${direction === 'rtl' ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
                      <Button variant="ghost" size="sm">{t('permissions.roles.edit')}</Button>
                      <Button variant="ghost" size="sm">{t('permissions.roles.view')}</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Users Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('permissions.users.title')}</CardTitle>
              <CardDescription>{t('permissions.users.subtitle')}</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('permissions.users.addNew')}
                </Button>
              </DialogTrigger>
              <DialogContent dir={direction}>
                <DialogHeader className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                  <DialogTitle>{t('permissions.users.addTitle')}</DialogTitle>
                  <DialogDescription>{t('permissions.users.addDescription')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('permissions.users.linkedEmployee')} / {t('permissions.users.linkedEmployeeEn')}</Label>
                    <select className={`w-full border rounded-lg p-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <option value="">{t('permissions.users.selectEmployee')}</option>
                      <option value="1">خالد أحمد - مدير عام</option>
                      <option value="2">سارة محمد - مديرة مبيعات</option>
                      <option value="3">عبدالله حسن - محاسب</option>
                      <option value="4">هند علي - مديرة موارد بشرية</option>
                      <option value="5">يوسف عمر - مطور برمجيات</option>
                    </select>
                    <p className="text-xs text-gray-500">{t('permissions.users.linkedEmployeeNote')}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('permissions.users.username')} / {t('permissions.users.usernameEn')}</Label>
                    <Input placeholder={t('permissions.users.usernamePlaceholder')} dir="ltr" />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('permissions.users.email')}</Label>
                    <Input type="email" placeholder={t('permissions.users.emailPlaceholder')} dir="ltr" />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('permissions.users.password')} / {t('permissions.users.passwordEn')}</Label>
                    <Input type="password" placeholder={t('permissions.users.passwordPlaceholder')} dir="ltr" />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('permissions.users.role')} / {t('permissions.users.roleEn')}</Label>
                    <select className={`w-full border rounded-lg p-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {t(role.nameKey)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('permissions.users.userPermissions')} / {t('permissions.users.userPermissionsEn')}</Label>
                    <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                      {permissionKeys.slice(0, 6).map((key) => (
                        <div key={key} className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          <input type="checkbox" id={`perm_${key}`} />
                          <label htmlFor={`perm_${key}`} className="text-sm">{t(`permissions.permissionsList.${key}`)}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('permissions.users.status')} / {t('permissions.users.statusEn')}</Label>
                    <select className={`w-full border rounded-lg p-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <option value="active">{t('permissions.users.statusActive')} / {t('permissions.users.statusActiveEn')}</option>
                      <option value="suspended">{t('permissions.users.statusSuspended')} / {t('permissions.users.statusSuspendedEn')}</option>
                    </select>
                  </div>

                  <Button className="w-full" onClick={() => toast.success(t('permissions.users.userCreated'))}>
                    {t('permissions.users.saveUser')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('permissions.users.tableHeaders.name')}</TableHead>
                <TableHead>{t('permissions.users.tableHeaders.email')}</TableHead>
                <TableHead>{t('permissions.users.tableHeaders.role')}</TableHead>
                <TableHead>{t('permissions.users.tableHeaders.status')}</TableHead>
                <TableHead>{t('permissions.users.tableHeaders.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell dir="ltr">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{t(user.roleKey)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status === 'active' ? t('permissions.users.statusActive') : t('permissions.users.statusSuspended')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={`flex gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <Button variant="ghost" size="sm">{t('permissions.users.edit')}</Button>
                      <Button variant="ghost" size="sm">{t('permissions.users.disable')}</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
