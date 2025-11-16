/**
 * Employee Leaves Management
 * This file manages employee leave requests and balances
 */

import { markOnLeave } from './attendance';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'سنوية' | 'مرضية' | 'طارئة' | 'أمومة' | 'حج' | 'أخرى';
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: 'معلق' | 'موافق' | 'مرفوض';
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
}

export interface LeaveBalance {
  employeeId: string;
  annualLeave: number; // رصيد الإجازة السنوية
  sickLeave: number; // رصيد الإجازة المرضية
  emergencyLeave: number; // رصيد الإجازة الطارئة
  usedAnnualLeave: number;
  usedSickLeave: number;
  usedEmergencyLeave: number;
}

// Storage key for localStorage
const LEAVES_STORAGE_KEY = 'employee_leaves';
const BALANCE_STORAGE_KEY = 'employee_leave_balances';

// Load leave requests from localStorage
export const loadLeaveRequests = (): LeaveRequest[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(LEAVES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading leave requests:', error);
  }
  
  return [];
};

// Save leave requests to localStorage
export const saveLeaveRequests = (requests: LeaveRequest[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LEAVES_STORAGE_KEY, JSON.stringify(requests));
  } catch (error) {
    console.error('Error saving leave requests:', error);
  }
};

// Load leave balances from localStorage
export const loadLeaveBalances = (): LeaveBalance[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(BALANCE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading leave balances:', error);
  }
  
  return [];
};

// Save leave balances to localStorage
export const saveLeaveBalances = (balances: LeaveBalance[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(BALANCE_STORAGE_KEY, JSON.stringify(balances));
  } catch (error) {
    console.error('Error saving leave balances:', error);
  }
};

/**
 * Create a new leave request
 */
export const createLeaveRequest = (request: Omit<LeaveRequest, 'id' | 'requestedDate' | 'status'>): LeaveRequest => {
  const requests = loadLeaveRequests();
  const newRequest: LeaveRequest = {
    ...request,
    id: `LEAVE-${Date.now()}`,
    requestedDate: new Date().toISOString(),
    status: 'معلق'
  };
  
  requests.push(newRequest);
  saveLeaveRequests(requests);
  return newRequest;
};

/**
 * Get leave requests by employee ID
 */
export const getLeaveRequestsByEmployeeId = (employeeId: string): LeaveRequest[] => {
  const requests = loadLeaveRequests();
  return requests.filter(r => r.employeeId === employeeId);
};

/**
 * Approve leave request
 */
export const approveLeaveRequest = (requestId: string, approvedBy: string): boolean => {
  const requests = loadLeaveRequests();
  const index = requests.findIndex(r => r.id === requestId);
  
  if (index === -1) return false;
  
  requests[index].status = 'موافق';
  requests[index].approvedBy = approvedBy;
  requests[index].approvedDate = new Date().toISOString();
  
  // Update attendance records for leave days
  const startDate = new Date(requests[index].startDate);
  const endDate = new Date(requests[index].endDate);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    markOnLeave(requests[index].employeeId, requests[index].employeeName, dateStr);
  }
  
  // Update leave balance
  const balances = loadLeaveBalances();
  const balanceIndex = balances.findIndex(b => b.employeeId === requests[index].employeeId);
  
  if (balanceIndex !== -1) {
    const balance = balances[balanceIndex];
    if (requests[index].leaveType === 'سنوية') {
      balance.usedAnnualLeave += requests[index].days;
    } else if (requests[index].leaveType === 'مرضية') {
      balance.usedSickLeave += requests[index].days;
    } else if (requests[index].leaveType === 'طارئة') {
      balance.usedEmergencyLeave += requests[index].days;
    }
    balances[balanceIndex] = balance;
  } else {
    // Create new balance if doesn't exist
    const newBalance: LeaveBalance = {
      employeeId: requests[index].employeeId,
      annualLeave: 30,
      sickLeave: 30,
      emergencyLeave: 5,
      usedAnnualLeave: requests[index].leaveType === 'سنوية' ? requests[index].days : 0,
      usedSickLeave: requests[index].leaveType === 'مرضية' ? requests[index].days : 0,
      usedEmergencyLeave: requests[index].leaveType === 'طارئة' ? requests[index].days : 0
    };
    balances.push(newBalance);
  }
  
  saveLeaveBalances(balances);
  saveLeaveRequests(requests);
  return true;
};

/**
 * Reject leave request
 */
export const rejectLeaveRequest = (requestId: string, rejectionReason: string): boolean => {
  const requests = loadLeaveRequests();
  const index = requests.findIndex(r => r.id === requestId);
  
  if (index === -1) return false;
  
  requests[index].status = 'مرفوض';
  requests[index].rejectionReason = rejectionReason;
  
  saveLeaveRequests(requests);
  return true;
};

/**
 * Get leave balance for employee
 */
export const getLeaveBalance = (employeeId: string): LeaveBalance | null => {
  const balances = loadLeaveBalances();
  const balance = balances.find(b => b.employeeId === employeeId);
  
  if (balance) {
    return balance;
  }
  
  // Return default balance if not found
  return {
    employeeId,
    annualLeave: 30,
    sickLeave: 30,
    emergencyLeave: 5,
    usedAnnualLeave: 0,
    usedSickLeave: 0,
    usedEmergencyLeave: 0
  };
};

