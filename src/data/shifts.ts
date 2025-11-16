export interface ShiftTemplate {
    id: string;
    code: string;
    name: string;
    type: 'صباحية' | 'مسائية' | 'ليلية' | 'مخصصة';
    startTime: string;
    endTime: string;
    durationHours: number;
    maxEmployees: number;
    location?: string;
    color?: string;
    notes?: string;
}

export interface ShiftAssignment {
    id: string;
    shiftId: string;
    employeeName: string;
    employeeId?: string;
    role?: string;
    date: string;
    status: 'مؤكد' | 'معلق' | 'ملغي';
}

export const defaultShiftTemplates: ShiftTemplate[] = [
    {
        id: 'shift-1',
        code: 'SH-001',
        name: 'الوردية الصباحية',
        type: 'صباحية',
        startTime: '08:00',
        endTime: '16:00',
        durationHours: 8,
        maxEmployees: 15,
        location: 'المقر الرئيسي',
        color: '#60a5fa',
        notes: 'تشمل ساعة راحة واحدة'
    },
    {
        id: 'shift-2',
        code: 'SH-002',
        name: 'الوردية المسائية',
        type: 'مسائية',
        startTime: '16:00',
        endTime: '00:00',
        durationHours: 8,
        maxEmployees: 10,
        location: 'المقر الرئيسي',
        color: '#f97316'
    },
    {
        id: 'shift-3',
        code: 'SH-003',
        name: 'الوردية الليلية',
        type: 'ليلية',
        startTime: '00:00',
        endTime: '08:00',
        durationHours: 8,
        maxEmployees: 6,
        location: 'مستودع الفرع الشمالي',
        color: '#a855f7'
    },
    {
        id: 'shift-4',
        code: 'SH-004',
        name: 'ورديّة نهاية الأسبوع',
        type: 'مخصصة',
        startTime: '09:00',
        endTime: '15:00',
        durationHours: 6,
        maxEmployees: 8,
        location: 'مركز الخدمة',
        color: '#34d399'
    }
];

export const defaultShiftAssignments: ShiftAssignment[] = [
    {
        id: 'assign-1',
        shiftId: 'shift-1',
        employeeName: 'أحمد محمد',
        employeeId: '1',
        role: 'مدير صالة',
        date: '2025-02-01',
        status: 'مؤكد'
    },
    {
        id: 'assign-2',
        shiftId: 'shift-1',
        employeeName: 'سارة العتيبي',
        employeeId: '7',
        role: 'خدمة عملاء',
        date: '2025-02-01',
        status: 'مؤكد'
    },
    {
        id: 'assign-3',
        shiftId: 'shift-2',
        employeeName: 'عبدالله حسن',
        employeeId: '3',
        role: 'محاسب',
        date: '2025-02-01',
        status: 'مؤكد'
    },
    {
        id: 'assign-4',
        shiftId: 'shift-3',
        employeeName: 'ريما سعيد',
        employeeId: '6',
        role: 'مراقب مستودع',
        date: '2025-02-01',
        status: 'معلق'
    }
];

