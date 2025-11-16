import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Edit, Save, Calendar, Plus, Check, XCircle, Download, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Employee } from './Employees';
import { defaultShiftTemplates } from '../data/shifts';
import { getAccountByEmployeeId, createEmployeeAccount } from '../data/accountIndex';
import { getLeaveRequestsByEmployeeId, getLeaveBalance, createLeaveRequest, approveLeaveRequest, rejectLeaveRequest, type LeaveRequest } from '../data/leaves';
import { getAttendanceByEmployeeId, getAttendanceStats, type AttendanceRecord } from '../data/attendance';
import { getPayrollByEmployeeId, type PayrollRecord } from '../data/payroll';

interface EmployeeDetailsProps {
    employeeId: string;
    onBack: () => void;
}

export function EmployeeDetails({ employeeId, onBack }: EmployeeDetailsProps) {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [leaveBalance, setLeaveBalance] = useState<any>(null);
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
    const [newLeaveRequest, setNewLeaveRequest] = useState({
        leaveType: 'سنوية' as LeaveRequest['leaveType'],
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [reportDateRange, setReportDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    // Load real attendance and payroll data
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
    const [attendanceStats, setAttendanceStats] = useState<any>(null);

    // Mock employees data - in real app, this would come from a data store
    const [employees] = useState<Employee[]>([
        { id: '1', name: 'خالد أحمد', position: 'مدير عام', department: 'الإدارة', email: 'khaled@example.com', phone: '0501234567', salary: 15000, joinDate: '2020-01-15', shiftId: 'shift-1', status: 'نشط', nationality: 'سعودي', maritalStatus: 'متزوج', birthDate: '1985-05-10', gender: 'ذكر', branchIds: ['1'], accountNumber: 'EMP-2025-0001' },
        { id: '2', name: 'سارة محمد', position: 'مديرة مبيعات', department: 'المبيعات', email: 'sara@example.com', phone: '0502345678', salary: 12000, joinDate: '2021-03-20', shiftId: 'shift-4', status: 'نشط', nationality: 'سعودي', maritalStatus: 'متزوج', birthDate: '1990-08-15', gender: 'أنثى', branchIds: ['1', '2'], accountNumber: 'EMP-2025-0002' },
        { id: '3', name: 'عبدالله حسن', position: 'محاسب', department: 'المحاسبة', email: 'abdullah@example.com', phone: '0503456789', salary: 8000, joinDate: '2021-06-10', shiftId: 'shift-2', status: 'نشط', nationality: 'سعودي', maritalStatus: 'أعزب', birthDate: '1995-12-20', gender: 'ذكر', branchIds: ['1'], accountNumber: 'EMP-2025-0003' },
        { id: '4', name: 'هند علي', position: 'مديرة موارد بشرية', department: 'الموارد البشرية', email: 'hind@example.com', phone: '0504567890', salary: 10000, joinDate: '2020-09-05', shiftId: 'shift-1', status: 'نشط', nationality: 'سعودي', maritalStatus: 'متزوج', birthDate: '1988-03-25', gender: 'أنثى', branchIds: ['1'], accountNumber: 'EMP-2025-0004' },
        { id: '5', name: 'يوسف عمر', position: 'مطور برمجيات', department: 'تقنية المعلومات', email: 'youssef@example.com', phone: '0505678901', salary: 11000, joinDate: '2022-02-14', shiftId: 'shift-2', status: 'نشط', nationality: 'سعودي', maritalStatus: 'أعزب', birthDate: '1993-07-08', gender: 'ذكر', branchIds: ['1'], accountNumber: 'EMP-2025-0005' },
        { id: '6', name: 'ريم سعيد', position: 'مسؤولة تسويق', department: 'التسويق', email: 'reem@example.com', phone: '0506789012', salary: 9000, joinDate: '2022-05-22', shiftId: 'shift-3', status: 'نشط', nationality: 'سعودي', maritalStatus: 'أعزب', birthDate: '1996-11-12', gender: 'أنثى', branchIds: ['2'], accountNumber: 'EMP-2025-0006' },
    ]);

    const [branches] = useState([
        { id: '1', name: 'الفرع الرئيسي' },
        { id: '2', name: 'فرع الشمال' },
        { id: '3', name: 'فرع جدة' }
    ]);

    useEffect(() => {
        const found = employees.find(e => e.id === employeeId);
        if (found) {
            setEmployee(found);
            // Ensure account exists
            let account = getAccountByEmployeeId(employeeId);
            if (!account) {
                account = createEmployeeAccount(employeeId, found.name);
            }
            if (!found.accountNumber) {
                setEmployee({ ...found, accountNumber: account.accountNumber });
            }
        }
    }, [employeeId]);

    useEffect(() => {
        if (employeeId) {
            const requests = getLeaveRequestsByEmployeeId(employeeId);
            setLeaveRequests(requests);
            const balance = getLeaveBalance(employeeId);
            setLeaveBalance(balance);

            // Load attendance records
            const attendance = getAttendanceByEmployeeId(employeeId);
            setAttendanceRecords(attendance);

            // Load payroll records
            const payroll = getPayrollByEmployeeId(employeeId);
            setPayrollRecords(payroll);
        }
    }, [employeeId]);

    useEffect(() => {
        if (employeeId && reportDateRange.startDate && reportDateRange.endDate) {
            // Update attendance stats when date range changes
            const stats = getAttendanceStats(employeeId, reportDateRange.startDate, reportDateRange.endDate);
            setAttendanceStats(stats);

            // Reload attendance records for date range
            const attendance = getAttendanceByEmployeeId(employeeId, reportDateRange.startDate, reportDateRange.endDate);
            setAttendanceRecords(attendance);

            // Reload payroll records for date range
            const payroll = getPayrollByEmployeeId(employeeId, reportDateRange.startDate, reportDateRange.endDate);
            setPayrollRecords(payroll);
        }
    }, [employeeId, reportDateRange]);

    const shiftTemplates = defaultShiftTemplates;
    const getShiftInfo = (shiftId?: string) => shiftTemplates.find(s => s.id === shiftId);

    const calculateDays = (startDate: string, endDate: string): number => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const handleSaveLeaveRequest = () => {
        if (!employee) return;

        const days = calculateDays(newLeaveRequest.startDate, newLeaveRequest.endDate);
        if (days <= 0) {
            toast.error('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
            return;
        }

        createLeaveRequest({
            employeeId: employee.id,
            employeeName: employee.name,
            leaveType: newLeaveRequest.leaveType,
            startDate: newLeaveRequest.startDate,
            endDate: newLeaveRequest.endDate,
            days,
            reason: newLeaveRequest.reason
        });

        toast.success('تم إرسال طلب الإجازة بنجاح');
        setIsLeaveDialogOpen(false);
        setNewLeaveRequest({ leaveType: 'سنوية', startDate: '', endDate: '', reason: '' });

        // Refresh leave requests
        const requests = getLeaveRequestsByEmployeeId(employeeId);
        setLeaveRequests(requests);
    };

    const handleApproveLeave = (requestId: string) => {
        if (approveLeaveRequest(requestId, 'المدير العام')) {
            toast.success('تم الموافقة على طلب الإجازة');
            const requests = getLeaveRequestsByEmployeeId(employeeId);
            setLeaveRequests(requests);
            const balance = getLeaveBalance(employeeId);
            setLeaveBalance(balance);
        }
    };

    const handleRejectLeave = (requestId: string) => {
        const reason = prompt('سبب الرفض:');
        if (reason && rejectLeaveRequest(requestId, reason)) {
            toast.success('تم رفض طلب الإجازة');
            const requests = getLeaveRequestsByEmployeeId(employeeId);
            setLeaveRequests(requests);
        }
    };

    if (!employee) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">جاري تحميل بيانات الموظف...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={onBack} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        العودة
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{employee.name}</h1>
                        <p className="text-gray-600">{employee.position} - {employee.department}</p>
                    </div>
                </div>
                <Button onClick={() => setIsEditing(!isEditing)} className="gap-2">
                    {isEditing ? (
                        <>
                            <Save className="w-4 h-4" />
                            حفظ
                        </>
                    ) : (
                        <>
                            <Edit className="w-4 h-4" />
                            تعديل
                        </>
                    )}
                </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
                    <TabsTrigger value="work">البيانات الوظيفية</TabsTrigger>
                    <TabsTrigger value="leaves">الإجازات</TabsTrigger>
                    <TabsTrigger value="reports">التقارير</TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>البيانات الأساسية</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>اسم الموظف</Label>
                                    <Input value={employee.name} disabled={!isEditing} />
                                </div>
                                <div>
                                    <Label>رقم الحساب</Label>
                                    <Input value={employee.accountNumber || 'غير محدد'} disabled />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>الجنسية</Label>
                                    <Input value={employee.nationality || ''} disabled={!isEditing} placeholder="أدخل الجنسية" />
                                </div>
                                <div>
                                    <Label>الحالة الاجتماعية</Label>
                                    <Select value={employee.maritalStatus || ''} disabled={!isEditing}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر الحالة الاجتماعية" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="أعزب">أعزب</SelectItem>
                                            <SelectItem value="متزوج">متزوج</SelectItem>
                                            <SelectItem value="مطلق">مطلق</SelectItem>
                                            <SelectItem value="أرمل">أرمل</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>تاريخ الميلاد</Label>
                                    <Input type="date" value={employee.birthDate || ''} disabled={!isEditing} />
                                </div>
                                <div>
                                    <Label>الجنس</Label>
                                    <Select value={employee.gender || ''} disabled={!isEditing}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر الجنس" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ذكر">ذكر</SelectItem>
                                            <SelectItem value="أنثى">أنثى</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>البريد الإلكتروني</Label>
                                    <Input type="email" value={employee.email} disabled={!isEditing} />
                                </div>
                                <div>
                                    <Label>رقم الهاتف</Label>
                                    <Input value={employee.phone} disabled={!isEditing} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Work Information Tab */}
                <TabsContent value="work" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>البيانات الوظيفية</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>الإدارة</Label>
                                    <Input value={employee.department} disabled={!isEditing} />
                                </div>
                                <div>
                                    <Label>القسم</Label>
                                    <Input value={employee.department} disabled={!isEditing} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>الوظيفة</Label>
                                    <Input value={employee.position} disabled={!isEditing} />
                                </div>
                                <div>
                                    <Label>الحالة</Label>
                                    <Select value={employee.status || 'نشط'} disabled={!isEditing}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="نشط">نشط</SelectItem>
                                            <SelectItem value="غير نشط">غير نشط</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>تاريخ التعيين</Label>
                                    <Input type="date" value={employee.joinDate} disabled={!isEditing} />
                                </div>
                                <div>
                                    <Label>الراتب (ر.س)</Label>
                                    <Input type="number" value={employee.salary} disabled={!isEditing} />
                                </div>
                            </div>
                            <div>
                                <Label>الورديات</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {employee.shiftId && (
                                        <Badge variant="outline">
                                            {getShiftInfo(employee.shiftId)?.name || 'غير محدد'}
                                        </Badge>
                                    )}
                                    {employee.shiftIds?.map(shiftId => (
                                        <Badge key={shiftId} variant="outline">
                                            {getShiftInfo(shiftId)?.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label>الفروع</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {employee.branchIds?.map(branchId => {
                                        const branch = branches.find(b => b.id === branchId);
                                        return branch ? (
                                            <Badge key={branchId} variant="outline">
                                                {branch.name}
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Leaves Tab */}
                <TabsContent value="leaves" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>إدارة الإجازات</CardTitle>
                            <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        طلب إجازة جديدة
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>طلب إجازة جديدة</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div>
                                            <Label>نوع الإجازة</Label>
                                            <Select value={newLeaveRequest.leaveType} onValueChange={(value: any) => setNewLeaveRequest({ ...newLeaveRequest, leaveType: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="سنوية">سنوية</SelectItem>
                                                    <SelectItem value="مرضية">مرضية</SelectItem>
                                                    <SelectItem value="طارئة">طارئة</SelectItem>
                                                    <SelectItem value="أمومة">أمومة</SelectItem>
                                                    <SelectItem value="حج">حج</SelectItem>
                                                    <SelectItem value="أخرى">أخرى</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>تاريخ البداية</Label>
                                                <Input type="date" value={newLeaveRequest.startDate} onChange={(e) => setNewLeaveRequest({ ...newLeaveRequest, startDate: e.target.value })} />
                                            </div>
                                            <div>
                                                <Label>تاريخ النهاية</Label>
                                                <Input type="date" value={newLeaveRequest.endDate} onChange={(e) => setNewLeaveRequest({ ...newLeaveRequest, endDate: e.target.value })} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>السبب (اختياري)</Label>
                                            <Textarea value={newLeaveRequest.reason} onChange={(e) => setNewLeaveRequest({ ...newLeaveRequest, reason: e.target.value })} />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleSaveLeaveRequest} className="flex-1">إرسال الطلب</Button>
                                            <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)} className="flex-1">إلغاء</Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            {/* Leave Balance */}
                            {leaveBalance && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-semibold mb-3">رصيد الإجازات</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">الإجازة السنوية</p>
                                            <p className="text-lg font-bold">{leaveBalance.annualLeave - leaveBalance.usedAnnualLeave} / {leaveBalance.annualLeave} يوم</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">الإجازة المرضية</p>
                                            <p className="text-lg font-bold">{leaveBalance.sickLeave - leaveBalance.usedSickLeave} / {leaveBalance.sickLeave} يوم</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">الإجازة الطارئة</p>
                                            <p className="text-lg font-bold">{leaveBalance.emergencyLeave - leaveBalance.usedEmergencyLeave} / {leaveBalance.emergencyLeave} يوم</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Leave Requests Table */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>نوع الإجازة</TableHead>
                                        <TableHead>تاريخ البداية</TableHead>
                                        <TableHead>تاريخ النهاية</TableHead>
                                        <TableHead>عدد الأيام</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead>الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaveRequests.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-gray-500">
                                                لا توجد طلبات إجازة
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        leaveRequests.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell>{request.leaveType}</TableCell>
                                                <TableCell>{request.startDate}</TableCell>
                                                <TableCell>{request.endDate}</TableCell>
                                                <TableCell>{request.days} يوم</TableCell>
                                                <TableCell>
                                                    <Badge variant={request.status === 'موافق' ? 'default' : request.status === 'مرفوض' ? 'destructive' : 'secondary'}>
                                                        {request.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {request.status === 'معلق' && (
                                                        <div className="flex gap-2">
                                                            <Button size="sm" variant="outline" onClick={() => handleApproveLeave(request.id)}>
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => handleRejectLeave(request.id)}>
                                                                <XCircle className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reports Tab */}
                <TabsContent value="reports" className="space-y-4">
                    {/* Date Range Filter */}
                    <Card>
                        <CardHeader>
                            <CardTitle>التقارير</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 items-end mb-6">
                                <div className="flex-1">
                                    <Label>من تاريخ</Label>
                                    <Input
                                        type="date"
                                        value={reportDateRange.startDate}
                                        onChange={(e) => setReportDateRange({ ...reportDateRange, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label>إلى تاريخ</Label>
                                    <Input
                                        type="date"
                                        value={reportDateRange.endDate}
                                        onChange={(e) => setReportDateRange({ ...reportDateRange, endDate: e.target.value })}
                                    />
                                </div>
                                <Button className="gap-2">
                                    <Download className="w-4 h-4" />
                                    تصدير التقرير
                                </Button>
                            </div>

                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">أيام الحضور</p>
                                                <p className="text-2xl font-bold">
                                                    {attendanceStats?.presentDays || 0}
                                                </p>
                                            </div>
                                            <Clock className="w-8 h-8 text-blue-500" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">ساعات العمل</p>
                                                <p className="text-2xl font-bold">
                                                    {attendanceStats?.totalHours?.toFixed(1) || '0.0'}
                                                </p>
                                            </div>
                                            <TrendingUp className="w-8 h-8 text-green-500" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">الإجازات المستخدمة</p>
                                                <p className="text-2xl font-bold">
                                                    {leaveRequests
                                                        .filter(l => l.status === 'موافق' &&
                                                            l.startDate >= reportDateRange.startDate &&
                                                            l.endDate <= reportDateRange.endDate)
                                                        .reduce((sum, l) => sum + l.days, 0)}
                                                </p>
                                            </div>
                                            <Calendar className="w-8 h-8 text-orange-500" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">إجمالي الرواتب</p>
                                                <p className="text-2xl font-bold">
                                                    {payrollRecords
                                                        .filter(p => {
                                                            const monthDate = new Date(p.month.split(' ')[1] + '-' + (p.month.split(' ')[0] === 'يناير' ? '01' : p.month.split(' ')[0] === 'ديسمبر' ? '12' : '11') + '-01');
                                                            return monthDate >= new Date(reportDateRange.startDate) && monthDate <= new Date(reportDateRange.endDate);
                                                        })
                                                        .reduce((sum, p) => sum + p.netSalary, 0).toLocaleString()} ر.س
                                                </p>
                                            </div>
                                            <DollarSign className="w-8 h-8 text-purple-500" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Attendance Report */}
                            <Card className="mb-4">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        تقرير الحضور والانصراف
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>التاريخ</TableHead>
                                                <TableHead>تسجيل الدخول</TableHead>
                                                <TableHead>تسجيل الخروج</TableHead>
                                                <TableHead>ساعات العمل</TableHead>
                                                <TableHead>الحالة</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {attendanceRecords.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center text-gray-500">
                                                        لا توجد سجلات حضور في هذه الفترة
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                attendanceRecords.map((record) => (
                                                    <TableRow key={record.id}>
                                                        <TableCell>{record.date}</TableCell>
                                                        <TableCell>{record.checkIn || '-'}</TableCell>
                                                        <TableCell>{record.checkOut || '-'}</TableCell>
                                                        <TableCell>{record.hours ? `${record.hours} ساعة` : '-'}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={record.status === 'حاضر' ? 'default' : record.status === 'غائب' ? 'destructive' : 'secondary'}>
                                                                {record.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Leaves Report */}
                            <Card className="mb-4">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        تقرير الإجازات
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>نوع الإجازة</TableHead>
                                                <TableHead>تاريخ البداية</TableHead>
                                                <TableHead>تاريخ النهاية</TableHead>
                                                <TableHead>عدد الأيام</TableHead>
                                                <TableHead>الحالة</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {leaveRequests
                                                .filter(l => l.startDate >= reportDateRange.startDate && l.endDate <= reportDateRange.endDate)
                                                .map((request) => (
                                                    <TableRow key={request.id}>
                                                        <TableCell>{request.leaveType}</TableCell>
                                                        <TableCell>{request.startDate}</TableCell>
                                                        <TableCell>{request.endDate}</TableCell>
                                                        <TableCell>{request.days} يوم</TableCell>
                                                        <TableCell>
                                                            <Badge variant={request.status === 'موافق' ? 'default' : request.status === 'مرفوض' ? 'destructive' : 'secondary'}>
                                                                {request.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Payroll Report */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5" />
                                        تقرير الرواتب
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>الشهر</TableHead>
                                                <TableHead>الراتب الأساسي</TableHead>
                                                <TableHead>البدلات</TableHead>
                                                <TableHead>الخصومات</TableHead>
                                                <TableHead>صافي الراتب</TableHead>
                                                <TableHead>تاريخ الدفع</TableHead>
                                                <TableHead>الحالة</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payrollRecords.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center text-gray-500">
                                                        لا توجد سجلات رواتب في هذه الفترة
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                payrollRecords.map((record) => (
                                                    <TableRow key={record.id}>
                                                        <TableCell>{record.month}</TableCell>
                                                        <TableCell>{record.basicSalary.toLocaleString()} ر.س</TableCell>
                                                        <TableCell>{record.allowances.toLocaleString()} ر.س</TableCell>
                                                        <TableCell>{record.deductions.toLocaleString()} ر.س</TableCell>
                                                        <TableCell className="font-semibold">{record.netSalary.toLocaleString()} ر.س</TableCell>
                                                        <TableCell>{record.paymentDate || '-'}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={record.status === 'مدفوع' ? 'default' : record.status === 'ملغي' ? 'destructive' : 'secondary'}>
                                                                {record.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

