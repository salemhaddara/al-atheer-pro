import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Search, Edit, Trash2, Mail, Phone, Briefcase, CalendarClock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { defaultShiftTemplates } from '../data/shifts';
import {
  getInstitutions,
  getInstitutionEmployees,
  getInstitutionRoles,
  getUsers,
  createInstitutionEmployee,
  type Institution,
  type InstitutionEmployee as ApiInstitutionEmployee,
  type InstitutionRole,
  type User,
} from '../lib/api';

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  salary: number;
  joinDate: string;
  shiftId?: string;
  // Basic Information
  accountNumber?: string;
  nationality?: string;
  maritalStatus?: 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل';
  birthDate?: string;
  gender?: 'ذكر' | 'أنثى';
  // Work Information
  status?: 'نشط' | 'غير نشط';
  shiftIds?: string[]; // Multiple shifts support
  branchIds?: string[]; // Multiple branches support
  // Permissions & Access
  role?: 'admin' | 'employee'; // دور الموظف: إدارة أو موظف عادي
  assignedWarehouseId?: string; // المستودع المخصص للموظف
  institutionId?: number; // المؤسسة التابع لها الموظف
  userId?: number; // معرف المستخدم في النظام
  institutionRoleId?: number; // معرف دور المؤسسة
}

interface EmployeesProps {
  onViewEmployee?: (employeeId: string) => void;
}

type EmployeeFormData = {
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  salary: number;
  joinDate: string;
  shiftId: string;
  role: 'admin' | 'employee';
  assignedWarehouseId: string;
  institutionId: number | '';
};

export function Employees({ onViewEmployee }: EmployeesProps) {
  const [shiftTemplates] = useState(defaultShiftTemplates);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    salary: 0,
    joinDate: '',
    shiftId: '',
    role: 'employee' as 'admin' | 'employee',
    assignedWarehouseId: '',
    institutionId: ''
  });
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | null>(null);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [institutionRoles, setInstitutionRoles] = useState<InstitutionRole[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  const formatDate = (value: string) => {
    if (!value) return '';
    // Try to parse full ISO and fall back to simple split
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      // عرض التاريخ بصيغة يوم/شهر/سنة عربية
      return parsed.toLocaleDateString('ar-SA');
    }
    return value.split('T')[0] || value;
  };

  const mapApiEmployeeToEmployee = (apiEmployee: ApiInstitutionEmployee): Employee => {
    const user = apiEmployee.user;
    const nameFromUser =
      user?.full_name ||
      [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();

    return {
      id: String(apiEmployee.id),
      name: nameFromUser || 'بدون اسم',
      position: apiEmployee.position || '',
      department: apiEmployee.department || '',
      email: user?.email || '',
      phone: user?.phone_number || '',
      salary: Number(apiEmployee.salary ?? 0),
      // نأخذ فقط جزء التاريخ بدون الوقت ليتناسب مع حقل التاريخ والعرض
      joinDate: apiEmployee.join_date ? apiEmployee.join_date.substring(0, 10) : '',
      shiftId: apiEmployee.shift_id || undefined,
      status: apiEmployee.status === 'active' ? 'نشط' : 'غير نشط',
      assignedWarehouseId: apiEmployee.assigned_warehouse_id
        ? String(apiEmployee.assigned_warehouse_id)
        : undefined,
      institutionId: apiEmployee.institution_id,
      userId: apiEmployee.user_id,
      institutionRoleId: apiEmployee.institution_role_id,
    };
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const [institutionsResult, usersResult] = await Promise.all([
        getInstitutions({ per_page: 100 }),
        getUsers({ per_page: 100 }),
      ]);

      if (institutionsResult.success) {
        const list = institutionsResult.data.institutions;
        const institutionsArray = Array.isArray(list) ? list : list.data;
        setInstitutions(institutionsArray || []);

        // If there is at least one institution, select it and load its employees
        if (institutionsArray && institutionsArray.length > 0) {
          const firstInstitutionId = institutionsArray[0].id;
          setSelectedInstitutionId(firstInstitutionId);
          void loadInstitutionEmployees(firstInstitutionId);
        }
      } else {
        toast.error(institutionsResult.message || 'فشل في تحميل المؤسسات');
      }

      if (usersResult.success) {
        setUsers(usersResult.data.users);
      } else {
        toast.error(usersResult.message || 'فشل في تحميل المستخدمين');
      }
    };

    loadInitialData();
  }, []);

  // Load roles when institution changes in the form
  useEffect(() => {
    if (typeof formData.institutionId === 'number') {
      getInstitutionRoles(formData.institutionId).then((result) => {
        if (result.success) {
          setInstitutionRoles(result.data.roles);
        } else {
          toast.error(result.message || 'فشل في تحميل أدوار المؤسسة');
        }
      });
    } else {
      setInstitutionRoles([]);
    }
  }, [formData.institutionId]);

  const loadInstitutionEmployees = async (institutionId: number) => {
    setIsLoadingEmployees(true);
    try {
      const result = await getInstitutionEmployees(institutionId);
      if (result.success) {
        const apiEmployees = result.data.employees || [];
        const mapped = apiEmployees.map(mapApiEmployeeToEmployee);
        setEmployees(mapped);
      } else {
        toast.error(result.message || 'فشل في تحميل الموظفين');
      }
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const getShiftInfo = (shiftId?: string) => shiftTemplates.find((shift) => shift.id === shiftId);

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;
      const shift = getShiftInfo(employee.shiftId);
      const searchable = [
        employee.name,
        employee.position,
        employee.department,
        shift?.name ?? ''
      ].join(' ').toLowerCase();
      return searchable.includes(term);
    });
  }, [employees, searchTerm, shiftTemplates]);

  const handleDelete = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
    toast.success('تم حذف الموظف بنجاح');
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name || '',
      position: employee.position || '',
      department: employee.department || '',
      email: employee.email || '',
      phone: employee.phone || '',
      salary: employee.salary || 0,
      joinDate: employee.joinDate || '',
      shiftId: employee.shiftId || '',
      role: employee.role || 'employee',
      assignedWarehouseId: employee.assignedWarehouseId || '',
      institutionId: employee.institutionId ?? ''
    });
    setSelectedInstitutionId(employee.institutionId ?? null);
    setSelectedUserId(employee.userId ?? null);
    setSelectedRoleId(employee.institutionRoleId ?? null);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      position: '',
      department: '',
      email: '',
      phone: '',
      salary: 0,
      joinDate: '',
      shiftId: '',
      role: 'employee',
      assignedWarehouseId: '',
      institutionId: (selectedInstitutionId ?? '') as number | ''
    });
    setSelectedUserId(null);
    setSelectedRoleId(null);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('يرجى إدخال الاسم الكامل');
      return;
    }
    if (!formData.position.trim()) {
      toast.error('يرجى إدخال المسمى الوظيفي');
      return;
    }
    if (!formData.department) {
      toast.error('يرجى اختيار القسم');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('يرجى إدخال البريد الإلكتروني');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('يرجى إدخال رقم الهاتف');
      return;
    }
    if (!formData.joinDate) {
      toast.error('يرجى إدخال تاريخ التعيين');
      return;
    }
    if (typeof formData.institutionId !== 'number') {
      toast.error('يرجى اختيار المؤسسة');
      return;
    }
    if (!selectedUserId) {
      toast.error('يرجى اختيار المستخدم');
      return;
    }
    if (!selectedRoleId) {
      toast.error('يرجى اختيار دور المؤسسة');
      return;
    }

    const save = async () => {
      if (editingEmployee) {
        // For now, update only locally - backend update endpoint is not defined
        setEmployees(employees.map(emp =>
          emp.id === editingEmployee.id
            ? {
              ...emp,
              name: formData.name.trim(),
              position: formData.position.trim(),
              department: formData.department,
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              salary: Number(formData.salary),
              joinDate: formData.joinDate,
              shiftId: formData.shiftId || undefined,
              role: formData.role,
              assignedWarehouseId: formData.assignedWarehouseId || undefined,
              institutionId: formData.institutionId as number,
              userId: selectedUserId,
              institutionRoleId: selectedRoleId,
            }
            : emp
        ));
        toast.success('تم تحديث الموظف (محليًا)');
      } else {
        // Add new employee via backend
        const result = await createInstitutionEmployee(formData.institutionId as number, {
          user_id: selectedUserId!,
          institution_role_id: selectedRoleId!,
          position: formData.position.trim(),
          department: formData.department,
          salary: Number(formData.salary),
          join_date: formData.joinDate,
          status: 'active',
          shift_id: formData.shiftId || null,
          assigned_warehouse_id: formData.assignedWarehouseId
            ? Number(formData.assignedWarehouseId)
            : null,
        });

        if (result.success) {
          const created = mapApiEmployeeToEmployee(result.data.employee);
          setEmployees([...employees, created]);
          toast.success(result.message || 'تم إضافة الموظف بنجاح');
        } else {
          toast.error(result.message || 'فشل في إضافة الموظف');
          return;
        }
      }

      setIsDialogOpen(false);
    };

    void save();
  };

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div className="text-right flex-1">
          <h1>إدارة الموظفين</h1>
          <p className="text-gray-600">عرض وإدارة جميع الموظفين</p>
        </div>
        <div className="flex items-center gap-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew} className="gap-2 shrink-0">
                <Plus className="w-4 h-4" />
                إضافة موظف جديد
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader className="text-right">
                <DialogTitle>{editingEmployee ? 'تعديل الموظف' : 'إضافة موظف جديد'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
              <div>
                <Label>الاسم الكامل *</Label>
                <Input
                  placeholder="أدخل الاسم الكامل"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>المسمى الوظيفي *</Label>
                  <Input
                    placeholder="مثال: مدير مبيعات"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>
                <div>
                  <Label>القسم *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="الإدارة">الإدارة</SelectItem>
                      <SelectItem value="المبيعات">المبيعات</SelectItem>
                      <SelectItem value="المحاسبة">المحاسبة</SelectItem>
                      <SelectItem value="الموارد البشرية">الموارد البشرية</SelectItem>
                      <SelectItem value="تقنية المعلومات">تقنية المعلومات</SelectItem>
                      <SelectItem value="التسويق">التسويق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>المؤسسة *</Label>
                  <Select
                    value={formData.institutionId ? String(formData.institutionId) : ''}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        institutionId: Number(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المؤسسة" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.map((institution) => (
                        <SelectItem key={institution.id} value={String(institution.id)}>
                          {institution.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>المستخدم *</Label>
                  <Select
                    value={selectedUserId ? String(selectedUserId) : ''}
                    onValueChange={(value) => setSelectedUserId(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستخدم" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>دور المؤسسة *</Label>
                  <Select
                    value={selectedRoleId ? String(selectedRoleId) : ''}
                    onValueChange={(value) => setSelectedRoleId(Number(value))}
                    disabled={institutionRoles.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutionRoles.map((role) => (
                        <SelectItem key={role.id} value={String(role.id)}>
                          {role.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>البريد الإلكتروني *</Label>
                <Input
                  type="email"
                  placeholder="example@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label>رقم الهاتف *</Label>
                <Input
                  placeholder="05xxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الراتب (ر.س) *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.salary || ''}
                    onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>تاريخ التعيين *</Label>
                  <Input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>الوردية المرتبطة</Label>
                <Select
                  value={formData.shiftId || undefined}
                  onValueChange={(value) => setFormData({ ...formData, shiftId: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="حدد الوردية" />
                  </SelectTrigger>
                  <SelectContent>
                    {shiftTemplates.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {shift.name} ({shift.startTime} - {shift.endTime})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الدور / الصلاحيات</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'admin' | 'employee') => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">إدارة (صلاحيات كاملة)</SelectItem>
                      <SelectItem value="employee">موظف (صلاحيات محدودة)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>المستودع المخصص (للموظفين فقط)</Label>
                  <Select
                    value={formData.assignedWarehouseId || undefined}
                    onValueChange={(value) => setFormData({ ...formData, assignedWarehouseId: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستودع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">المستودع الرئيسي</SelectItem>
                      <SelectItem value="2">مستودع الفرع الشمالي</SelectItem>
                      <SelectItem value="3">مستودع الفرع الجنوبي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={handleSave}>
                    {editingEmployee ? 'تحديث' : 'إضافة'}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="البحث عن موظف بالاسم، المسمى الوظيفي أو القسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-right"
              dir="rtl"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewEmployee?.(employee.id)}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="عرض التفاصيل"
                  >
                    <Eye className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleEdit(employee)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <h3 className="mb-1">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-lg">
                    {employee.name.charAt(0)}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm justify-end">
                  <span className="text-gray-600">{employee.department}</span>
                  <Briefcase className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2 text-sm justify-end">
                  <span className="text-gray-600">{employee.email}</span>
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2 text-sm justify-end">
                  <span className="text-gray-600">{employee.phone}</span>
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">تاريخ التعيين</p>
                      <p className="text-sm">{formatDate(employee.joinDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">الراتب</p>
                      <p className="text-green-600">{employee.salary.toLocaleString()} ر.س</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3 bg-gray-50">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">الوردية الحالية</p>
                      {getShiftInfo(employee.shiftId) ? (
                        <>
                          <p className="text-sm font-medium">{getShiftInfo(employee.shiftId)?.name}</p>
                          <p className="text-xs text-gray-500">
                            {getShiftInfo(employee.shiftId)?.startTime} - {getShiftInfo(employee.shiftId)?.endTime}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">غير محدد</p>
                      )}
                    </div>
                    <div className="p-2 rounded-full bg-white border">
                      <CalendarClock className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
