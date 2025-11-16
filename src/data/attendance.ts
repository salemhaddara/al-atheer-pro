/**
 * Employee Attendance Management
 * This file manages employee check-in/check-out records
 */

export interface AttendanceRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string; // YYYY-MM-DD format
    checkIn?: string; // HH:mm format
    checkOut?: string; // HH:mm format
    hours?: number; // Calculated working hours
    status: 'حاضر' | 'غائب' | 'إجازة' | 'متأخر' | 'مبكر';
    notes?: string;
    createdAt: string;
}

// Storage key for localStorage
const STORAGE_KEY = 'employee_attendance';

// Load attendance records from localStorage
export const loadAttendanceRecords = (): AttendanceRecord[] => {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading attendance records:', error);
    }

    return [];
};

// Save attendance records to localStorage
export const saveAttendanceRecords = (records: AttendanceRecord[]): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
        console.error('Error saving attendance records:', error);
    }
};

/**
 * Calculate working hours between check-in and check-out
 */
export const calculateWorkingHours = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 0;

    const [inHour, inMin] = checkIn.split(':').map(Number);
    const [outHour, outMin] = checkOut.split(':').map(Number);

    const inTime = inHour * 60 + inMin;
    const outTime = outHour * 60 + outMin;

    const diffMinutes = outTime - inTime;
    return Math.round((diffMinutes / 60) * 10) / 10; // Round to 1 decimal
};

/**
 * Check in employee
 */
export const checkIn = (employeeId: string, employeeName: string, date: string, checkInTime: string): AttendanceRecord => {
    const records = loadAttendanceRecords();

    // Check if record already exists for this date
    const existingIndex = records.findIndex(r => r.employeeId === employeeId && r.date === date);

    const record: AttendanceRecord = {
        id: `ATT-${Date.now()}`,
        employeeId,
        employeeName,
        date,
        checkIn: checkInTime,
        status: 'حاضر',
        hours: 0,
        createdAt: new Date().toISOString()
    };

    if (existingIndex !== -1) {
        records[existingIndex] = { ...records[existingIndex], checkIn: checkInTime, status: 'حاضر' };
    } else {
        records.push(record);
    }

    saveAttendanceRecords(records);
    return existingIndex !== -1 ? records[existingIndex] : record;
};

/**
 * Check out employee
 */
export const checkOut = (employeeId: string, date: string, checkOutTime: string): AttendanceRecord | null => {
    const records = loadAttendanceRecords();
    const index = records.findIndex(r => r.employeeId === employeeId && r.date === date);

    if (index === -1 || !records[index].checkIn) {
        return null; // No check-in record found
    }

    const hours = calculateWorkingHours(records[index].checkIn!, checkOutTime);
    records[index].checkOut = checkOutTime;
    records[index].hours = hours;

    saveAttendanceRecords(records);
    return records[index];
};

/**
 * Get attendance records by employee ID
 */
export const getAttendanceByEmployeeId = (employeeId: string, startDate?: string, endDate?: string): AttendanceRecord[] => {
    const records = loadAttendanceRecords();
    let filtered = records.filter(r => r.employeeId === employeeId);

    if (startDate) {
        filtered = filtered.filter(r => r.date >= startDate);
    }

    if (endDate) {
        filtered = filtered.filter(r => r.date <= endDate);
    }

    return filtered.sort((a, b) => b.date.localeCompare(a.date));
};

/**
 * Get attendance records by date range
 */
export const getAttendanceByDateRange = (startDate: string, endDate: string): AttendanceRecord[] => {
    const records = loadAttendanceRecords();
    return records.filter(r => r.date >= startDate && r.date <= endDate)
        .sort((a, b) => {
            const dateCompare = b.date.localeCompare(a.date);
            if (dateCompare !== 0) return dateCompare;
            return a.employeeName.localeCompare(b.employeeName);
        });
};

/**
 * Mark employee as absent
 */
export const markAbsent = (employeeId: string, employeeName: string, date: string, reason?: string): AttendanceRecord => {
    const records = loadAttendanceRecords();

    const existingIndex = records.findIndex(r => r.employeeId === employeeId && r.date === date);

    const record: AttendanceRecord = {
        id: `ATT-${Date.now()}`,
        employeeId,
        employeeName,
        date,
        status: 'غائب',
        hours: 0,
        notes: reason,
        createdAt: new Date().toISOString()
    };

    if (existingIndex !== -1) {
        records[existingIndex] = { ...records[existingIndex], status: 'غائب', notes: reason };
    } else {
        records.push(record);
    }

    saveAttendanceRecords(records);
    return existingIndex !== -1 ? records[existingIndex] : record;
};

/**
 * Mark employee as on leave
 */
export const markOnLeave = (employeeId: string, employeeName: string, date: string): AttendanceRecord => {
    const records = loadAttendanceRecords();

    const existingIndex = records.findIndex(r => r.employeeId === employeeId && r.date === date);

    const record: AttendanceRecord = {
        id: `ATT-${Date.now()}`,
        employeeId,
        employeeName,
        date,
        status: 'إجازة',
        hours: 0,
        createdAt: new Date().toISOString()
    };

    if (existingIndex !== -1) {
        records[existingIndex] = { ...records[existingIndex], status: 'إجازة' };
    } else {
        records.push(record);
    }

    saveAttendanceRecords(records);
    return existingIndex !== -1 ? records[existingIndex] : record;
};

/**
 * Get attendance statistics for employee
 */
export const getAttendanceStats = (employeeId: string, startDate: string, endDate: string) => {
    const records = getAttendanceByEmployeeId(employeeId, startDate, endDate);

    const presentDays = records.filter(r => r.status === 'حاضر').length;
    const absentDays = records.filter(r => r.status === 'غائب').length;
    const leaveDays = records.filter(r => r.status === 'إجازة').length;
    const totalHours = records
        .filter(r => r.status === 'حاضر' && r.hours)
        .reduce((sum, r) => sum + (r.hours || 0), 0);

    return {
        presentDays,
        absentDays,
        leaveDays,
        totalHours: Math.round(totalHours * 10) / 10,
        totalDays: records.length
    };
};

