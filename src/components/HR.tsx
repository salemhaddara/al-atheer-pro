import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Users2, Clock, DollarSign, Calendar as CalendarIcon, Plus, Download } from 'lucide-react';
import { toast } from 'sonner';
import { defaultShiftAssignments, defaultShiftTemplates } from '../data/shifts';
import { getAttendanceByDateRange, checkIn, checkOut, type AttendanceRecord } from '../data/attendance';
import { loadPayrollRecords, processMonthlyPayroll, markPayrollAsPaid, type PayrollRecord } from '../data/payroll';
import { loadLeaveRequests } from '../data/leaves';
import { Employee } from './Employees';
import { getAccountByEmployeeId } from '../data/accountIndex';

export function HR() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: string; name: string } | null>(null);
  const [checkInTime, setCheckInTime] = useState('');
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());

  // Mock employees - in real app, load from Employees component
  const [employees] = useState<Employee[]>([
    { id: '1', name: 'خالد أحمد', position: 'مدير عام', department: 'الإدارة', email: 'khaled@example.com', phone: '0501234567', salary: 15000, joinDate: '2020-01-15', shiftId: 'shift-1', status: 'نشط' },
    { id: '2', name: 'سارة محمد', position: 'مديرة مبيعات', department: 'المبيعات', email: 'sara@example.com', phone: '0502345678', salary: 12000, joinDate: '2021-03-20', shiftId: 'shift-4', status: 'نشط' },
    { id: '3', name: 'عبدالله حسن', position: 'محاسب', department: 'المحاسبة', email: 'abdullah@example.com', phone: '0503456789', salary: 8000, joinDate: '2021-06-10', shiftId: 'shift-2', status: 'نشط' },
    { id: '4', name: 'هند علي', position: 'مديرة موارد بشرية', department: 'الموارد البشرية', email: 'hind@example.com', phone: '0504567890', salary: 10000, joinDate: '2020-09-05', shiftId: 'shift-1', status: 'نشط' },
  ]);

  const [shifts] = useState(defaultShiftTemplates);
  const [shiftAssignments] = useState(defaultShiftAssignments);

  // Load attendance records for selected date
  useEffect(() => {
    const records = getAttendanceByDateRange(selectedDate, selectedDate);
    setAttendanceRecords(records);
  }, [selectedDate]);

  // Load payroll records
  useEffect(() => {
    const records = loadPayrollRecords();
    setPayrollRecords(records);
  }, []);

  const shiftCoverage = useMemo(() => {
    return shifts.map((shift) => {
      const assigned = shiftAssignments.filter((assignment) => assignment.shiftId === shift.id).length;
      return {
        shift,
        assigned,
        percentage: Math.min(100, Math.round((assigned / shift.maxEmployees) * 100))
      };
    });
  }, [shiftAssignments, shifts]);

  const contracts = [
    { id: '1', employee: 'أحمد محمد', type: 'دوام كامل', startDate: '2024-01-01', endDate: '2025-12-31', salary: 8000, status: 'نشط' },
    { id: '2', employee: 'فاطمة علي', type: 'دوام كامل', startDate: '2024-03-15', endDate: '2025-12-31', salary: 7500, status: 'نشط' },
    { id: '3', employee: 'سعيد خالد', type: 'دوام جزئي', startDate: '2024-06-01', endDate: '2025-05-31', salary: 4000, status: 'نشط' }
  ];

  // Statistics calculations
  const todayAttendance = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = getAttendanceByDateRange(today, today);
    return {
      present: todayRecords.filter(r => r.status === 'حاضر').length,
      total: employees.length
    };
  }, [selectedDate, employees]);

  const pendingLeaves = useMemo(() => {
    const leaves = loadLeaveRequests();
    return leaves.filter(l => l.status === 'معلق').length;
  }, []);

  const monthlyPayrollTotal = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    return payrollRecords
      .filter(p => p.year === currentYear && p.monthNumber === currentMonth)
      .reduce((sum, p) => sum + p.netSalary, 0);
  }, [payrollRecords]);

  const handleCheckIn = () => {
    if (!selectedEmployee || !checkInTime) {
      toast.error('يرجى اختيار موظف ووقت الدخول');
      return;
    }

    checkIn(selectedEmployee.id, selectedEmployee.name, selectedDate, checkInTime);
    toast.success(`تم تسجيل دخول ${selectedEmployee.name}`);
    setIsCheckInDialogOpen(false);
    setSelectedEmployee(null);
    setCheckInTime('');
    
    // Refresh attendance records
    const records = getAttendanceByDateRange(selectedDate, selectedDate);
    setAttendanceRecords(records);
  };

  const handleCheckOut = (employeeId: string, employeeName: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    checkOut(employeeId, selectedDate, timeStr);
    toast.success(`تم تسجيل خروج ${employeeName}`);
    
    // Refresh attendance records
    const records = getAttendanceByDateRange(selectedDate, selectedDate);
    setAttendanceRecords(records);
  };

  const handleProcessPayroll = () => {
    const activeEmployees = employees.filter(e => e.status === 'نشط');
    
    if (activeEmployees.length === 0) {
      toast.error('لا يوجد موظفين نشطين');
      return;
    }

    const records = processMonthlyPayroll(
      activeEmployees.map(e => ({ id: e.id, name: e.name, salary: e.salary })),
      payrollYear,
      payrollMonth
    );

    toast.success(`تم معالجة رواتب ${records.length} موظف`);
    setIsPayrollDialogOpen(false);
    
    // Refresh payroll records
    const updatedRecords = loadPayrollRecords();
    setPayrollRecords(updatedRecords);
  };

  const handleMarkPayrollPaid = (payrollId: string, employeeId: string) => {
    const account = getAccountByEmployeeId(employeeId);
    const paymentDate = new Date().toISOString().split('T')[0];
    
    markPayrollAsPaid(payrollId, paymentDate, 'نقدي', account?.accountNumber);
    toast.success('تم تسجيل دفع الراتب وإنشاء القيد المحاسبي');
    
    // Refresh payroll records
    const updatedRecords = loadPayrollRecords();
    setPayrollRecords(updatedRecords);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-right flex-1">
          <h1>الموارد البشرية</h1>
          <p className="text-gray-600">إدارة الموظفين والحضور والرواتب</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Users2 className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm">إجمالي الموظفين</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">45</div>
            <p className="text-xs text-gray-600 mt-1">موظف نشط</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Clock className="w-4 h-4 text-green-600" />
            <CardTitle className="text-sm">الحضور اليوم</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{todayAttendance.present}</div>
            <p className="text-xs text-gray-600 mt-1">من أصل {todayAttendance.total} موظف</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <DollarSign className="w-4 h-4 text-purple-600" />
            <CardTitle className="text-sm">الرواتب الشهرية</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{formatCurrency(monthlyPayrollTotal)}</div>
            <p className="text-xs text-gray-600 mt-1">هذا الشهر</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CalendarIcon className="w-4 h-4 text-orange-600" />
            <CardTitle className="text-sm">الإجازات</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{pendingLeaves}</div>
            <p className="text-xs text-gray-600 mt-1">طلب إجازة معلق</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList>
          <TabsTrigger value="attendance">الحضور والانصراف</TabsTrigger>
          <TabsTrigger value="shifts">الورديات</TabsTrigger>
          <TabsTrigger value="contracts">العقود</TabsTrigger>
          <TabsTrigger value="payroll">الرواتب</TabsTrigger>
        </TabsList>

        {/* Attendance */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        تسجيل حضور
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>تسجيل حضور</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>التاريخ</Label>
                          <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                        </div>
                        <div>
                          <Label>الموظف</Label>
                          <Select onValueChange={(value) => {
                            const emp = employees.find(e => e.id === value);
                            if (emp) setSelectedEmployee({ id: emp.id, name: emp.name });
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الموظف" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>وقت الدخول</Label>
                          <Input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} />
                        </div>
                        <Button onClick={handleCheckIn} className="w-full">تسجيل</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    تصدير
                  </Button>
                </div>
                <div className="text-right">
                  <CardTitle>سجل الحضور والانصراف</CardTitle>
                  <CardDescription>متابعة حضور الموظفين اليومي</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label>التاريخ</Label>
                <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-2" />
              </div>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الموظف</TableHead>
                      <TableHead className="text-right">تسجيل الدخول</TableHead>
                      <TableHead className="text-right">تسجيل الخروج</TableHead>
                      <TableHead className="text-right">ساعات العمل</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500">
                          لا توجد سجلات حضور لهذا التاريخ
                        </TableCell>
                      </TableRow>
                    ) : (
                      attendanceRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="text-right">{record.employeeName}</TableCell>
                          <TableCell className="text-right">{record.checkIn || '-'}</TableCell>
                          <TableCell className="text-right">{record.checkOut || '-'}</TableCell>
                          <TableCell className="text-right">{record.hours ? `${record.hours} ساعة` : '-'}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={record.status === 'حاضر' ? 'default' : record.status === 'غائب' ? 'destructive' : 'secondary'}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {record.checkIn && !record.checkOut && (
                              <Button size="sm" variant="outline" onClick={() => handleCheckOut(record.employeeId, record.employeeName)}>
                                تسجيل خروج
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shifts */}
        <TabsContent value="shifts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button size="sm" className="gap-2" onClick={() => toast.info('يمكن إدارة الورديات بالكامل من صفحة الورديات الجديدة')}>
                  <CalendarIcon className="w-4 h-4" />
                  فتح صفحة الورديات
                </Button>
                <div className="text-right">
                  <CardTitle>التغطية الحالية للورديات</CardTitle>
                  <CardDescription>تم استيراد البيانات من نظام الورديات المحدث</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الكود</TableHead>
                      <TableHead className="text-right">الوردية</TableHead>
                      <TableHead className="text-right">الفترة</TableHead>
                      <TableHead className="text-right">التعيينات / السعة</TableHead>
                      <TableHead className="text-right">نسبة التغطية</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shiftCoverage.map(({ shift, assigned, percentage }) => (
                      <TableRow key={shift.id}>
                        <TableCell className="text-right font-mono">{shift.code}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: shift.color || '#CBD5F5' }} />
                            <span>{shift.name}</span>
                            <Badge variant="outline">{shift.type}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{shift.startTime} - {shift.endTime}</TableCell>
                        <TableCell className="text-right">{assigned} / {shift.maxEmployees}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-2 rounded-full" style={{ width: `${percentage}%`, backgroundColor: shift.color || '#3b82f6' }} />
                            </div>
                            <span className="text-sm font-medium">{percentage}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts */}
        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  عقد جديد
                </Button>
                <div className="text-right">
                  <CardTitle>العقود</CardTitle>
                  <CardDescription>إدارة عقود الموظفين</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الموظف</TableHead>
                      <TableHead className="text-right">نوع العقد</TableHead>
                      <TableHead className="text-right">تاريخ البداية</TableHead>
                      <TableHead className="text-right">تاريخ النهاية</TableHead>
                      <TableHead className="text-right">الراتب</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="text-right">{contract.employee}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{contract.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{contract.startDate}</TableCell>
                        <TableCell className="text-right">{contract.endDate}</TableCell>
                        <TableCell className="text-right">{formatCurrency(contract.salary)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default">{contract.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">عرض</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll */}
        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Dialog open={isPayrollDialogOpen} onOpenChange={setIsPayrollDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      معالجة رواتب
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>معالجة رواتب الشهر</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>السنة</Label>
                          <Input type="number" value={payrollYear} onChange={(e) => setPayrollYear(Number(e.target.value))} />
                        </div>
                        <div>
                          <Label>الشهر</Label>
                          <Select value={String(payrollMonth)} onValueChange={(value) => setPayrollMonth(Number(value))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                                <SelectItem key={m} value={String(m)}>
                                  {['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][m-1]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button onClick={handleProcessPayroll} className="w-full">معالجة الرواتب</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="text-right">
                  <CardTitle>إدارة الرواتب</CardTitle>
                  <CardDescription>معالجة وصرف الرواتب</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الموظف</TableHead>
                      <TableHead className="text-right">الشهر</TableHead>
                      <TableHead className="text-right">الراتب الأساسي</TableHead>
                      <TableHead className="text-right">البدلات</TableHead>
                      <TableHead className="text-right">الخصومات</TableHead>
                      <TableHead className="text-right">صافي الراتب</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500">
                          لا توجد سجلات رواتب
                        </TableCell>
                      </TableRow>
                    ) : (
                      payrollRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="text-right">{record.employeeName}</TableCell>
                          <TableCell className="text-right">{record.month}</TableCell>
                          <TableCell className="text-right">{formatCurrency(record.basicSalary)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(record.allowances)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(record.deductions)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(record.netSalary)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={record.status === 'مدفوع' ? 'default' : record.status === 'ملغي' ? 'destructive' : 'secondary'}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {record.status === 'معلق' && (
                              <Button size="sm" variant="outline" onClick={() => handleMarkPayrollPaid(record.id, record.employeeId)}>
                                تسجيل الدفع
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
