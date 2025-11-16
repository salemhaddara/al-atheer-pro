import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Plus, Edit2, Trash2, CalendarDays, Users2, Clock3, Download, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { defaultShiftAssignments, defaultShiftTemplates, ShiftAssignment, ShiftTemplate } from '../data/shifts';

interface ShiftFormState {
    id?: string;
    code: string;
    name: string;
    type: ShiftTemplate['type'];
    startTime: string;
    endTime: string;
    durationHours: number;
    maxEmployees: number;
    location?: string;
    color?: string;
    notes?: string;
}

interface AssignmentFormState {
    employeeName: string;
    shiftId: string;
    role?: string;
    date: string;
    status: ShiftAssignment['status'];
}

export function Shifts() {
    const [shifts, setShifts] = useState<ShiftTemplate[]>(defaultShiftTemplates);
    const [assignments, setAssignments] = useState<ShiftAssignment[]>(defaultShiftAssignments);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
    const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<ShiftTemplate | null>(null);
    const [shiftForm, setShiftForm] = useState<ShiftFormState>({
        code: '',
        name: '',
        type: 'صباحية',
        startTime: '08:00',
        endTime: '16:00',
        durationHours: 8,
        maxEmployees: 10,
        location: '',
        color: '#60a5fa',
        notes: ''
    });
    const [assignmentForm, setAssignmentForm] = useState<AssignmentFormState>({
        employeeName: '',
        shiftId: shifts[0]?.id ?? '',
        role: '',
        date: new Date().toISOString().split('T')[0],
        status: 'مؤكد'
    });

    const filteredShifts = useMemo(() => {
        return shifts.filter(shift =>
            shift.name.includes(searchTerm) ||
            shift.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (shift.location?.includes(searchTerm) ?? false)
        );
    }, [searchTerm, shifts]);

    const shiftStats = useMemo(() => {
        const totalSlots = shifts.reduce((sum, shift) => sum + shift.maxEmployees, 0);
        const groupedAssignments = assignments.reduce<Record<string, number>>((acc, assignment) => {
            acc[assignment.shiftId] = (acc[assignment.shiftId] ?? 0) + 1;
            return acc;
        }, {});
        const coverage = shifts.map(shift => ({
            shiftId: shift.id,
            assigned: groupedAssignments[shift.id] ?? 0,
            capacity: shift.maxEmployees
        }));
        const coveragePercentage = coverage.length
            ? Math.round(
                coverage.reduce((sum, item) => sum + (item.assigned / item.capacity || 0), 0) / coverage.length * 100
            )
            : 0;

        return {
            totalShifts: shifts.length,
            totalSlots,
            totalAssignments: assignments.length,
            coveragePercentage
        };
    }, [assignments, shifts]);

    const weekDates = useMemo(() => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + index);
            return date.toISOString().split('T')[0];
        });
    }, []);

    const openShiftDialog = (shift?: ShiftTemplate) => {
        if (shift) {
            setEditingShift(shift);
            setShiftForm({ ...shift });
        } else {
            setEditingShift(null);
            setShiftForm({
                code: `SH-${String(shifts.length + 1).padStart(3, '0')}`,
                name: '',
                type: 'صباحية',
                startTime: '08:00',
                endTime: '16:00',
                durationHours: 8,
                maxEmployees: 10,
                location: '',
                color: '#60a5fa',
                notes: ''
            });
        }
        setIsShiftDialogOpen(true);
    };

    const handleShiftSave = () => {
        if (!shiftForm.name || !shiftForm.startTime || !shiftForm.endTime) {
            toast.error('الرجاء إدخال جميع الحقول المطلوبة');
            return;
        }
        if (editingShift) {
            setShifts(shifts.map(shift => shift.id === editingShift.id ? { ...shift, ...shiftForm } : shift));
            toast.success('تم تحديث الوردية');
        } else {
            const newShift: ShiftTemplate = {
                ...shiftForm,
                id: `shift-${Date.now()}`
            };
            setShifts([...shifts, newShift]);
            toast.success('تم إنشاء وردية جديدة');
        }
        setIsShiftDialogOpen(false);
    };

    const handleShiftDelete = (shiftId: string) => {
        if (!confirm('هل تريد حذف هذه الوردية؟ سيتم إزالة التعيينات المرتبطة بها.')) return;
        setShifts(shifts.filter(shift => shift.id !== shiftId));
        setAssignments(assignments.filter(assignment => assignment.shiftId !== shiftId));
        toast.success('تم حذف الوردية');
    };

    const openAssignmentDialog = () => {
        setAssignmentForm({
            employeeName: '',
            shiftId: shifts[0]?.id ?? '',
            role: '',
            date: new Date().toISOString().split('T')[0],
            status: 'مؤكد'
        });
        setIsAssignmentDialogOpen(true);
    };

    const handleAssignmentSave = () => {
        if (!assignmentForm.employeeName || !assignmentForm.shiftId) {
            toast.error('الرجاء إدخال اسم الموظف واختيار الوردية');
            return;
        }
        const targetShift = shifts.find(shift => shift.id === assignmentForm.shiftId);
        const currentCount = assignments.filter(a => a.shiftId === assignmentForm.shiftId && a.date === assignmentForm.date).length;
        if (targetShift && currentCount >= targetShift.maxEmployees) {
            toast.warning('تم الوصول إلى الحد الأقصى للموظفين في هذه الوردية لهذا اليوم');
        }
        const newAssignment: ShiftAssignment = {
            id: `assign-${Date.now()}`,
            ...assignmentForm
        };
        setAssignments([...assignments, newAssignment]);
        toast.success('تم تعيين الموظف في الوردية');
        setIsAssignmentDialogOpen(false);
    };

    const getShiftById = (shiftId: string) => shifts.find(shift => shift.id === shiftId);



    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">إدارة الورديات</h1>
                    <p className="text-gray-500 mt-1">تعريف الورديات، متابعة التغطية، وجدولة الموظفين</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" onClick={() => toast.info('سيتم دعم التصدير لاحقاً')}>
                        <Download className="h-4 w-4" />
                        تصدير التقرير
                    </Button>
                    <Button className="gap-2" onClick={openAssignmentDialog}>
                        <Users2 className="h-4 w-4" />
                        تعيين موظف
                    </Button>
                    <Button className="gap-2" onClick={() => openShiftDialog()}>
                        <Plus className="h-4 w-4" />
                        وردية جديدة
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">إجمالي الورديات</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-blue-500" />
                        <span className="text-2xl font-bold">{shiftStats.totalShifts}</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">الطاقة الاستيعابية</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2">
                        <Users2 className="h-5 w-5 text-indigo-500" />
                        <span className="text-2xl font-bold">{shiftStats.totalSlots}</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">التعيينات الحالية</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2">
                        <Clock3 className="h-5 w-5 text-amber-500" />
                        <span className="text-2xl font-bold">{shiftStats.totalAssignments}</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">نسبة التغطية</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2">
                        <AlertTriangle className={`h-5 w-5 ${shiftStats.coveragePercentage >= 80 ? 'text-green-500' : 'text-amber-500'}`} />
                        <span className="text-2xl font-bold">{shiftStats.coveragePercentage}%</span>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-3 max-w-3xl">
                    <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                    <TabsTrigger value="shifts">الورديات</TabsTrigger>
                    <TabsTrigger value="schedule">الجدول الأسبوعي</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>تقييم التغطية الحالية</CardTitle>
                            <CardDescription>تحليل سريع للوردية مقابل التعيينات</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {shifts.map(shift => {
                                const assigned = assignments.filter(a => a.shiftId === shift.id).length;
                                const percentage = Math.min(100, Math.round((assigned / shift.maxEmployees) * 100));
                                return (
                                    <div key={shift.id} className="p-4 border rounded-lg space-y-2" dir="rtl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: shift.color || '#CBD5F5' }} />
                                                <div>
                                                    <p className="font-medium">{shift.name}</p>
                                                    <p className="text-xs text-gray-500">{shift.startTime} - {shift.endTime}</p>
                                                </div>
                                            </div>
                                            <Badge variant={percentage >= 80 ? 'default' : 'secondary'}>{percentage}%</Badge>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="h-2 rounded-full" style={{ width: `${percentage}%`, backgroundColor: shift.color || '#3b82f6' }} />
                                        </div>
                                        <div className="text-xs text-gray-500 flex justify-between">
                                            <span>المعين: {assigned}</span>
                                            <span>السعة: {shift.maxEmployees}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="shifts" className="space-y-4" dir="rtl">
                    <Card dir="rtl">
                        <CardHeader>
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <CardTitle>قائمة الورديات</CardTitle>
                                    <CardDescription>إدارة تعريف الورديات والسعة واللون</CardDescription>
                                </div>
                                <Input
                                    placeholder="بحث باسم الوردية أو الكود أو الموقع..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="max-w-md"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="max-h-[480px]">
                                <Table dir="rtl">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>الكود</TableHead>
                                            <TableHead>اسم الوردية</TableHead>
                                            <TableHead>الفترة</TableHead>
                                            <TableHead>النوع</TableHead>
                                            <TableHead>السعة</TableHead>
                                            <TableHead>الموقع</TableHead>
                                            <TableHead>إجراءات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredShifts.map(shift => (
                                            <TableRow key={shift.id} dir="rtl">
                                                <TableCell className="font-mono">{shift.code}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: shift.color || '#CBD5F5' }} />
                                                        <div>
                                                            <p className="font-medium">{shift.name}</p>
                                                            {shift.notes && <p className="text-xs text-gray-500">{shift.notes}</p>}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{shift.type}</Badge>
                                                </TableCell>
                                                <TableCell>{shift.maxEmployees}</TableCell>
                                                <TableCell>{shift.location || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => openShiftDialog(shift)}>
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleShiftDelete(shift.id)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>تعيينات الموظفين</CardTitle>
                                    <CardDescription>مراجعة التعيينات حسب الوردية والتاريخ</CardDescription>
                                </div>
                                <Button variant="outline" className="gap-2" onClick={openAssignmentDialog}>
                                    <Users2 className="h-4 w-4" />
                                    تعيين جديد
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>التاريخ</TableHead>
                                        <TableHead>الموظف</TableHead>
                                        <TableHead>الوردية</TableHead>
                                        <TableHead>الدور</TableHead>
                                        <TableHead>الحالة</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignments.slice().reverse().map(assign => {
                                        const shift = getShiftById(assign.shiftId);
                                        return (
                                            <TableRow key={assign.id}>
                                                <TableCell>{assign.date}</TableCell>
                                                <TableCell>{assign.employeeName}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: shift?.color || '#CBD5F5' }} />
                                                        <span>{shift?.name ?? '-'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{assign.role || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={assign.status === 'مؤكد' ? 'default' : assign.status === 'معلق' ? 'secondary' : 'destructive'}>
                                                        {assign.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>الجدول الأسبوعي</CardTitle>
                            <CardDescription>توزيع الورديات على مدار الأسبوع الحالي</CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <div className="min-w-[600px]">
                                <div className="grid grid-cols-8 gap-2 text-sm font-medium text-gray-500 mb-2">
                                    <div></div>
                                    {weekDates.map(date => (
                                        <div key={date} className="text-center">
                                            <p>{new Date(date).toLocaleDateString('ar-SA', { weekday: 'short' })}</p>
                                            <p className="text-xs">{date}</p>
                                        </div>
                                    ))}
                                </div>
                                {shifts.map(shift => (
                                    <div key={shift.id} className="grid grid-cols-8 gap-2 items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: shift.color || '#CBD5F5' }} />
                                            <div>
                                                <p className="text-sm font-medium">{shift.name}</p>
                                                <p className="text-xs text-gray-500">{shift.startTime} - {shift.endTime}</p>
                                            </div>
                                        </div>
                                        {weekDates.map(date => {
                                            const assignedForShift = assignments.filter(assign => assign.shiftId === shift.id && assign.date === date);
                                            return (
                                                <div key={`${shift.id}-${date}`} className="min-h-[90px] p-2 border rounded-lg bg-gray-50">
                                                    {assignedForShift.length === 0 ? (
                                                        <p className="text-xs text-gray-400 text-center mt-6">لا تعيينات</p>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            {assignedForShift.map(assign => (
                                                                <div key={assign.id} className="p-2 rounded-lg text-xs bg-white border">
                                                                    <p className="font-medium">{assign.employeeName}</p>
                                                                    {assign.role && <p className="text-gray-500">{assign.role}</p>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingShift ? 'تعديل الوردية' : 'وردية جديدة'}</DialogTitle>
                        <DialogDescription>حدد تفاصيل الوردية المطلوبة وسعتها القصوى</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>كود الوردية</Label>
                                <Input value={shiftForm.code} onChange={(e) => setShiftForm({ ...shiftForm, code: e.target.value })} />
                            </div>
                            <div>
                                <Label>اسم الوردية</Label>
                                <Input value={shiftForm.name} onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>نوع الوردية</Label>
                                <Select value={shiftForm.type} onValueChange={(value: ShiftTemplate['type']) => setShiftForm({ ...shiftForm, type: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="صباحية">صباحية</SelectItem>
                                        <SelectItem value="مسائية">مسائية</SelectItem>
                                        <SelectItem value="ليلية">ليلية</SelectItem>
                                        <SelectItem value="مخصصة">مخصصة</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>الموقع</Label>
                                <Input value={shiftForm.location} onChange={(e) => setShiftForm({ ...shiftForm, location: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>الوقت من</Label>
                                <Input type="time" value={shiftForm.startTime} onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })} />
                            </div>
                            <div>
                                <Label>الوقت إلى</Label>
                                <Input type="time" value={shiftForm.endTime} onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })} />
                            </div>
                            <div>
                                <Label>مدة الوردية (ساعات)</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={shiftForm.durationHours}
                                    onChange={(e) => setShiftForm({ ...shiftForm, durationHours: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>الحد الأقصى للموظفين</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={shiftForm.maxEmployees}
                                    onChange={(e) => setShiftForm({ ...shiftForm, maxEmployees: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <Label>لون مميز</Label>
                                <Input type="color" value={shiftForm.color} onChange={(e) => setShiftForm({ ...shiftForm, color: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <Label>ملاحظات</Label>
                            <Input value={shiftForm.notes} onChange={(e) => setShiftForm({ ...shiftForm, notes: e.target.value })} />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => setIsShiftDialogOpen(false)}>إلغاء</Button>
                            <Button onClick={handleShiftSave}>{editingShift ? 'حفظ التغييرات' : 'إضافة الوردية'}</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تعيين موظف في وردية</DialogTitle>
                        <DialogDescription>حدد الوردية والتاريخ والوظيفة داخل الوردية</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>اسم الموظف</Label>
                            <Input value={assignmentForm.employeeName} onChange={(e) => setAssignmentForm({ ...assignmentForm, employeeName: e.target.value })} />
                        </div>
                        <div>
                            <Label>الوردية</Label>
                            <Select value={assignmentForm.shiftId} onValueChange={(value) => setAssignmentForm({ ...assignmentForm, shiftId: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر الوردية" />
                                </SelectTrigger>
                                <SelectContent>
                                    {shifts.map(shift => (
                                        <SelectItem key={shift.id} value={shift.id}>
                                            {shift.name} ({shift.startTime} - {shift.endTime})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>التاريخ</Label>
                                <Input type="date" value={assignmentForm.date} onChange={(e) => setAssignmentForm({ ...assignmentForm, date: e.target.value })} />
                            </div>
                            <div>
                                <Label>الحالة</Label>
                                <Select value={assignmentForm.status} onValueChange={(value: ShiftAssignment['status']) => setAssignmentForm({ ...assignmentForm, status: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="مؤكد">مؤكد</SelectItem>
                                        <SelectItem value="معلق">معلق</SelectItem>
                                        <SelectItem value="ملغي">ملغي</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>الدور داخل الوردية</Label>
                            <Input value={assignmentForm.role} onChange={(e) => setAssignmentForm({ ...assignmentForm, role: e.target.value })} />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>إلغاء</Button>
                            <Button onClick={handleAssignmentSave}>حفظ التعيين</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

