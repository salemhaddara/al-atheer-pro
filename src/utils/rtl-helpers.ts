/**
 * RTL (Right-to-Left) Helper Utilities
 * 
 * This module provides utility functions to help with RTL layout support
 * in a bilingual application (Arabic/English).
 */

export type Direction = 'rtl' | 'ltr';

/**
 * Returns the appropriate margin class based on direction
 */
export const getMarginStart = (size: number, direction: Direction) => {
    return direction === 'rtl' ? `ml-${size}` : `mr-${size}`;
};

export const getMarginEnd = (size: number, direction: Direction) => {
    return direction === 'rtl' ? `mr-${size}` : `ml-${size}`;
};

/**
 * Returns the appropriate padding class based on direction
 */
export const getPaddingStart = (size: number, direction: Direction) => {
    return direction === 'rtl' ? `pl-${size}` : `pr-${size}`;
};

export const getPaddingEnd = (size: number, direction: Direction) => {
    return direction === 'rtl' ? `pr-${size}` : `pl-${size}`;
};

/**
 * Returns the appropriate text alignment based on direction
 */
export const getTextAlign = (direction: Direction) => {
    return direction === 'rtl' ? 'text-right' : 'text-left';
};

/**
 * Returns the appropriate flex direction for rows based on direction
 */
export const getFlexDirection = (direction: Direction, reverse = false) => {
    if (reverse) {
        return direction === 'rtl' ? 'flex-row' : 'flex-row-reverse';
    }
    return direction === 'rtl' ? 'flex-row-reverse' : 'flex-row';
};

/**
 * Returns the appropriate position class based on direction
 */
export const getPositionStart = (direction: Direction) => {
    return direction === 'rtl' ? 'right' : 'left';
};

export const getPositionEnd = (direction: Direction) => {
    return direction === 'rtl' ? 'left' : 'right';
};

/**
 * Conditionally applies classes based on direction
 */
export const directionClasses = (rtlClass: string, ltrClass: string, direction: Direction) => {
    return direction === 'rtl' ? rtlClass : ltrClass;
};

