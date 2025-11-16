/**
 * Employee Payroll Management
 * This file manages employee payroll processing and records
 */

import { getAttendanceStats } from './attendance';
import { addJournalEntry, generateEntryId } from './journalEntries';

export interface PayrollRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    month: string; // Format: "YYYY-MM" or "يناير 2025"
    year: number;
    monthNumber: number; // 1-12
    basicSalary: number;
    allowances: number; // بدلات
    deductions: number; // خصومات
    overtimeHours?: number;
    overtimePay?: number;
    absentDays?: number;
    leaveDays?: number;
    netSalary: number;
    status: 'مدفوع' | 'معلق' | 'ملغي';
    paymentDate?: string;
    paymentMethod?: 'نقدي' | 'تحويل' | 'شيك';
    notes?: string;
    createdAt: string;
}

export interface PayrollAllowance {
    id: string;
    name: string;
    amount: number;
    type: 'fixed' | 'percentage'; // fixed amount or percentage of basic salary
}

export interface PayrollDeduction {
    id: string;
    name: string;
    amount: number;
    type: 'fixed' | 'percentage';
}

// Storage key for localStorage
const STORAGE_KEY = 'employee_payroll';

// Load payroll records from localStorage
export const loadPayrollRecords = (): PayrollRecord[] => {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading payroll records:', error);
    }

    return [];
};

// Save payroll records to localStorage
export const savePayrollRecords = (records: PayrollRecord[]): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
        console.error('Error saving payroll records:', error);
    }
};

/**
 * Get Arabic month name
 */
const getArabicMonthName = (monthNumber: number): string => {
    const months = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return months[monthNumber - 1] || '';
};

/**
 * Calculate net salary
 */
export const calculateNetSalary = (
    basicSalary: number,
    allowances: number,
    deductions: number,
    overtimePay: number = 0
): number => {
    return basicSalary + allowances + overtimePay - deductions;
};

/**
 * Create payroll record for employee
 */
export const createPayrollRecord = (
    employeeId: string,
    employeeName: string,
    year: number,
    monthNumber: number,
    basicSalary: number,
    allowances: number = 0,
    deductions: number = 0,
    overtimeHours: number = 0,
    overtimeRate: number = 0, // Rate per hour
    absentDays: number = 0,
    leaveDays: number = 0,
    absentDeductionRate: number = 0, // Deduction per absent day
    notes?: string
): PayrollRecord => {
    const records = loadPayrollRecords();

    // Check if record already exists
    const existing = records.find(
        r => r.employeeId === employeeId && r.year === year && r.monthNumber === monthNumber
    );

    if (existing) {
        return existing; // Return existing record
    }

    const overtimePay = overtimeHours * overtimeRate;
    const absentDeduction = absentDays * absentDeductionRate;
    const totalDeductions = deductions + absentDeduction;

    const netSalary = calculateNetSalary(basicSalary, allowances, totalDeductions, overtimePay);

    const record: PayrollRecord = {
        id: `PAY-${Date.now()}`,
        employeeId,
        employeeName,
        month: `${getArabicMonthName(monthNumber)} ${year}`,
        year,
        monthNumber,
        basicSalary,
        allowances,
        deductions: totalDeductions,
        overtimeHours,
        overtimePay,
        absentDays,
        leaveDays,
        netSalary,
        status: 'معلق',
        notes,
        createdAt: new Date().toISOString()
    };

    records.push(record);
    savePayrollRecords(records);
    return record;
};

/**
 * Get payroll records by employee ID
 */
export const getPayrollByEmployeeId = (
    employeeId: string,
    startDate?: string,
    endDate?: string
): PayrollRecord[] => {
    const records = loadPayrollRecords();
    let filtered = records.filter(r => r.employeeId === employeeId);

    if (startDate) {
        const [startYear, startMonth] = startDate.split('-').map(Number);
        filtered = filtered.filter(r => {
            if (r.year < startYear) return false;
            if (r.year === startYear && r.monthNumber < startMonth) return false;
            return true;
        });
    }

    if (endDate) {
        const [endYear, endMonth] = endDate.split('-').map(Number);
        filtered = filtered.filter(r => {
            if (r.year > endYear) return false;
            if (r.year === endYear && r.monthNumber > endMonth) return false;
            return true;
        });
    }

    return filtered.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.monthNumber - a.monthNumber;
    });
};

/**
 * Mark payroll as paid and create journal entry
 */
export const markPayrollAsPaid = (
    payrollId: string,
    paymentDate: string,
    paymentMethod: 'نقدي' | 'تحويل' | 'شيك' = 'نقدي',
    employeeAccountNumber?: string
): boolean => {
    const records = loadPayrollRecords();
    const index = records.findIndex(r => r.id === payrollId);

    if (index === -1) return false;

    records[index].status = 'مدفوع';
    records[index].paymentDate = paymentDate;
    records[index].paymentMethod = paymentMethod;

    // Create journal entry for payroll payment
    const journalEntry = {
        id: generateEntryId('auto'),
        date: paymentDate,
        description: `صرف راتب ${records[index].employeeName} - ${records[index].month}`,
        debitAccount: employeeAccountNumber || `حساب ${records[index].employeeName}`,
        creditAccount: paymentMethod === 'نقدي' ? 'الصندوق' : paymentMethod === 'تحويل' ? 'البنك' : 'الصندوق',
        amount: records[index].netSalary,
        reference: `PAY-${payrollId}`,
        status: 'مُعتمد' as const,
        type: 'auto' as const,
        operationType: 'سند_صرف' as const,
        sourceReference: payrollId,
        createdAt: new Date().toISOString()
    };

    addJournalEntry(journalEntry);

    savePayrollRecords(records);
    return true;
};

/**
 * Process payroll for all active employees for a specific month
 * Automatically calculates attendance stats from attendance system
 */
export const processMonthlyPayroll = (
    employees: Array<{ id: string; name: string; salary: number }>,
    year: number,
    monthNumber: number,
    allowances: Record<string, number> = {},
    deductions: Record<string, number> = {},
    overtimeRate: number = 0,
    absentDeductionRate: number = 0
): PayrollRecord[] => {
    const createdRecords: PayrollRecord[] = [];

    // Calculate date range for the month
    const startDate = `${year}-${String(monthNumber).padStart(2, '0')}-01`;
    const lastDay = new Date(year, monthNumber, 0).getDate();
    const endDate = `${year}-${String(monthNumber).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    employees.forEach(employee => {
        // Get attendance stats automatically
        const stats = getAttendanceStats(employee.id, startDate, endDate);

        const record = createPayrollRecord(
            employee.id,
            employee.name,
            year,
            monthNumber,
            employee.salary,
            allowances[employee.id] || 0,
            deductions[employee.id] || 0,
            stats.totalHours > (stats.presentDays * 8) ? stats.totalHours - (stats.presentDays * 8) : 0, // Overtime calculation
            overtimeRate,
            stats.absentDays,
            stats.leaveDays,
            absentDeductionRate
        );

        createdRecords.push(record);
    });

    return createdRecords;
};

