import { useMemo, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Search, Edit, Trash2, Mail, Phone, Briefcase, CalendarClock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { defaultShiftTemplates } from '../data/shifts';

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
}

interface EmployeesProps {
  onViewEmployee?: (employeeId: string) => void;
}

export function Employees({ onViewEmployee }: EmployeesProps) {
  const [shiftTemplates] = useState(defaultShiftTemplates);
  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', name: 'خالد أحمد', position: 'مدير عام', department: 'الإدارة', email: 'khaled@example.com', phone: '0501234567', salary: 15000, joinDate: '2020-01-15', shiftId: 'shift-1', status: 'نشط', nationality: 'سعودي', maritalStatus: 'متزوج', birthDate: '1985-05-10', gender: 'ذكر', branchIds: ['1'], role: 'admin' },
    { id: '2', name: 'سارة محمد', position: 'مديرة مبيعات', department: 'المبيعات', email: 'sara@example.com', phone: '0502345678', salary: 12000, joinDate: '2021-03-20', shiftId: 'shift-4', status: 'نشط', nationality: 'سعودي', maritalStatus: 'متزوج', birthDate: '1990-08-15', gender: 'أنثى', branchIds: ['1', '2'], role: 'admin' },
    { id: '3', name: 'عبدالله حسن', position: 'محاسب', department: 'المحاسبة', email: 'abdullah@example.com', phone: '0503456789', salary: 8000, joinDate: '2021-06-10', shiftId: 'shift-2', status: 'نشط', nationality: 'سعودي', maritalStatus: 'أعزب', birthDate: '1995-12-20', gender: 'ذكر', branchIds: ['1'], role: 'admin' },
    { id: '4', name: 'هند علي', position: 'مديرة موارد بشرية', department: 'الموارد البشرية', email: 'hind@example.com', phone: '0504567890', salary: 10000, joinDate: '2020-09-05', shiftId: 'shift-1', status: 'نشط', nationality: 'سعودي', maritalStatus: 'متزوج', birthDate: '1988-03-25', gender: 'أنثى', branchIds: ['1'], role: 'admin' },
    { id: '5', name: 'يوسف عمر', position: 'مطور برمجيات', department: 'تقنية المعلومات', email: 'youssef@example.com', phone: '0505678901', salary: 11000, joinDate: '2022-02-14', shiftId: 'shift-2', status: 'نشط', nationality: 'سعودي', maritalStatus: 'أعزب', birthDate: '1993-07-08', gender: 'ذكر', branchIds: ['1'], role: 'admin' },
    { id: '6', name: 'ريم سعيد', position: 'مسؤولة تسويق', department: 'التسويق', email: 'reem@example.com', phone: '0506789012', salary: 9000, joinDate: '2022-05-22', shiftId: 'shift-3', status: 'نشط', nationality: 'سعودي', maritalStatus: 'أعزب', birthDate: '1996-11-12', gender: 'أنثى', branchIds: ['2'], role: 'admin' },
    { id: '7', name: 'محمد الكاشير', position: 'كاشير', department: 'المبيعات', email: 'cashier1@example.com', phone: '0501111111', salary: 5000, joinDate: '2023-01-01', shiftId: 'shift-1', status: 'نشط', nationality: 'سعودي', maritalStatus: 'أعزب', birthDate: '1998-01-01', gender: 'ذكر', branchIds: ['1'], role: 'employee', assignedWarehouseId: '1' },
    { id: '8', name: 'فاطمة الكاشيرة', position: 'كاشيرة', department: 'المبيعات', email: 'cashier2@example.com', phone: '0502222222', salary: 5000, joinDate: '2023-02-01', shiftId: 'shift-2', status: 'نشط', nationality: 'سعودي', maritalStatus: 'أعزب', birthDate: '1999-01-01', gender: 'أنثى', branchIds: ['2'], role: 'employee', assignedWarehouseId: '2' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

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
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="text-right flex-1">
          <h1>إدارة الموظفين</h1>
          <p className="text-gray-600">عرض وإدارة جميع الموظفين</p>
        </div>
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
                <Label>الاسم الكامل</Label>
                <Input placeholder="أدخل الاسم الكامل" defaultValue={editingEmployee?.name} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>المسمى الوظيفي</Label>
                  <Input placeholder="مثال: مدير مبيعات" defaultValue={editingEmployee?.position} />
                </div>
                <div>
                  <Label>القسم</Label>
                  <Select defaultValue={editingEmployee?.department}>
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
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input type="email" placeholder="example@domain.com" defaultValue={editingEmployee?.email} />
              </div>
              <div>
                <Label>رقم الهاتف</Label>
                <Input placeholder="05xxxxxxxx" defaultValue={editingEmployee?.phone} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الراتب (ر.س)</Label>
                  <Input type="number" placeholder="0" defaultValue={editingEmployee?.salary} />
                </div>
                <div>
                  <Label>تاريخ التعيين</Label>
                  <Input type="date" defaultValue={editingEmployee?.joinDate} />
                </div>
              </div>
              <div>
                <Label>الوردية المرتبطة</Label>
                <Select defaultValue={editingEmployee?.shiftId}>
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
                  <Select defaultValue={editingEmployee?.role || 'employee'}>
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
                  <Select defaultValue={editingEmployee?.assignedWarehouseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستودع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">لا يوجد</SelectItem>
                      <SelectItem value="1">المستودع الرئيسي</SelectItem>
                      <SelectItem value="2">مستودع الفرع الشمالي</SelectItem>
                      <SelectItem value="3">مستودع الفرع الجنوبي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={() => {
                  toast.success(editingEmployee ? 'تم تحديث الموظف بنجاح' : 'تم إضافة الموظف بنجاح');
                  setIsDialogOpen(false);
                }}>
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
                      <p className="text-sm">{employee.joinDate}</p>
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
