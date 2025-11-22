/**
 * Employee Leaves Management
 * This file manages employee leave requests and balances
 */

import { dataCache } from '../utils/dataCache';
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

// Load leave requests from cache/localStorage
export const loadLeaveRequests = (): LeaveRequest[] => {
  return dataCache.getFromLocalStorage(LEAVES_STORAGE_KEY, []);
};

// Save leave requests to localStorage and update cache
export const saveLeaveRequests = (requests: LeaveRequest[]): void => {
  dataCache.saveToLocalStorage(LEAVES_STORAGE_KEY, requests);
};

// Load leave balances from cache/localStorage
export const loadLeaveBalances = (): LeaveBalance[] => {
  return dataCache.getFromLocalStorage(BALANCE_STORAGE_KEY, []);
};

// Save leave balances to localStorage and update cache
export const saveLeaveBalances = (balances: LeaveBalance[]): void => {
  dataCache.saveToLocalStorage(BALANCE_STORAGE_KEY, balances);
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

