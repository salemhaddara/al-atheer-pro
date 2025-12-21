"use client"

import React, { useState } from "react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameDay, isToday } from "date-fns"
import { ar } from "date-fns/locale"
import { enUS } from "date-fns/locale"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface CustomDatePickerProps {
  label?: string
  date?: Date
  onChange: (date?: Date) => void
  placeholder?: string
  disabled?: boolean
}

const styles = `
  .custom-date-picker {
    width: 100%;
  }

  .custom-date-picker[dir="rtl"] {
    direction: rtl;
  }

  .custom-date-picker[dir="ltr"] {
    direction: ltr;
  }

  .custom-date-picker-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.75rem;
  }

  .custom-date-picker-container {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  .custom-date-picker-trigger-wrapper {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .custom-date-picker-trigger {
    flex: 1;
    padding: 0.75rem 1rem;
    text-align: inherit;
    border-radius: 0.5rem;
    border: 2px solid;
    background-color: white;
    transition: all 200ms;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
  }

  .custom-date-picker[dir="rtl"] .custom-date-picker-trigger {
    text-align: right;
    justify-content: flex-start;
    flex-direction: row-reverse;
  }

  .custom-date-picker[dir="ltr"] .custom-date-picker-trigger {
    text-align: left;
    justify-content: flex-start;
    flex-direction: row;
  }

  .custom-date-picker-trigger:not(:disabled):hover {
    border-color: #d1d5db;
  }

  .custom-date-picker-trigger:disabled {
    background-color: #f3f4f6;
    border-color: #d1d5db;
    cursor: not-allowed;
    opacity: 0.5;
  }

  .custom-date-picker-trigger.open {
    border-color: #3b82f6;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .custom-date-picker-trigger.closed {
    border-color: #d1d5db;
  }

  .custom-date-picker-trigger.empty {
    color: #9ca3af;
  }

  .custom-date-picker-trigger.filled {
    color: #111827;
  }

  .custom-date-picker-trigger .icon {
    font-size: 1.125rem;
    flex-shrink: 0;
  }

  .custom-date-picker-trigger .text {
    flex: 1;
  }

  .custom-date-picker-clear-btn {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: #9ca3af;
    transition: color 200ms;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 0.375rem;
  }

  .custom-date-picker-clear-btn:hover {
    color: #ef4444;
  }

  .custom-date-picker-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
  }

  .custom-date-picker-popup {
    position: absolute;
    top: 100%;
    margin-top: 0.5rem;
    background-color: white;
    border: 2px solid #d1d5db;
    border-radius: 0.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    z-index: 50;
    width: 320px;
    overflow: hidden;
  }

  .custom-date-picker[dir="rtl"] .custom-date-picker-popup {
    right: 0;
  }

  .custom-date-picker[dir="ltr"] .custom-date-picker-popup {
    left: 0;
  }

  .custom-date-picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: linear-gradient(to left, #eff6ff 0%, #f0f9ff 100%);
    border-bottom: 2px solid #e5e7eb;
  }

  .custom-date-picker[dir="ltr"] .custom-date-picker-header {
    background: linear-gradient(to right, #eff6ff 0%, #f0f9ff 100%);
  }

  .custom-date-picker-header button {
    padding: 0.5rem;
    background-color: transparent;
    border: none;
    cursor: pointer;
    border-radius: 0.375rem;
    transition: background-color 200ms;
    color: #374151;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .custom-date-picker-header button:hover {
    background-color: #dbeafe;
  }

  .custom-date-picker-header h2 {
    font-size: 1rem;
    font-weight: 700;
    color: #111827;
    flex: 1;
    text-align: center;
    margin: 0;
  }

  .custom-date-picker-body {
    padding: 1rem;
  }

  .custom-date-picker-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .custom-date-picker-weekday {
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .custom-date-picker-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);

  }

  .custom-date-picker-day {
    aspect-ratio: 1 / 1;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 150ms;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    color: #374151;
    min-height: 2.5rem;
  }

  .custom-date-picker-day:disabled {
    color: #d1d5db;
    cursor: default;
  }

  .custom-date-picker-day.other-month {
    color: #d1d5db;
  }

  .custom-date-picker-day.other-month:disabled {
    cursor: default;
  }

  .custom-date-picker-day.selectable:hover {
    background-color: #f3f4f6;
  }

  .custom-date-picker-day.today {
    background-color: #dbeafe;
    color: #2563eb;
    border: 2px solid #3b82f6;
    font-weight: 700;
  }

  .custom-date-picker-day.selected {
    background-color: #2563eb;
    color: white;
    font-weight: 600;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .custom-date-picker-day.selected:hover {
    background-color: #1d4ed8;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .custom-date-picker-footer {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    border-top: 2px solid #e5e7eb;
    background-color: #f9fafb;
    border-radius: 0 0 0.5rem 0.5rem;
  }

  .custom-date-picker-footer button {
    flex: 1;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background-color 200ms;
    border: 2px solid;
    background-color: white;
    font-family: inherit;
  }

  .custom-date-picker-footer .close-btn {
    color: #374151;
    border-color: #d1d5db;
  }

  .custom-date-picker-footer .close-btn:hover {
    background-color: #f3f4f6;
  }

  .custom-date-picker-footer .clear-btn {
    color: #dc2626;
    border-color: #fca5a5;
  }

  .custom-date-picker-footer .clear-btn:hover {
    background-color: #fef2f2;
  }
`

export default function CustomDatePicker({
  label,
  date,
  onChange,
  placeholder,
  disabled = false,
}: CustomDatePickerProps) {
  const { language, direction } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(date || new Date())

  // Language configuration
  const isArabic = language === "ar"
  const dateLocale = isArabic ? ar : enUS
  const isRTL = direction === "rtl"

  // Translations
  const translations = {
    close: isArabic ? "إغلاق" : "Close",
    clear: isArabic ? "مسح" : "Clear",
    weekdaysShort: isArabic
      ? ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
      : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
  }

  const defaultPlaceholder = isArabic ? "اختر التاريخ" : "Select date"
  const displayPlaceholder = placeholder || defaultPlaceholder

  // Generate calendar days
  const getDaysInCalendar = () => {
    const firstDay = startOfMonth(currentMonth)
    const lastDay = endOfMonth(currentMonth)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days: Date[] = []
    const current = new Date(startDate)

    while (days.length < 42) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const calendarDays = getDaysInCalendar()
  const monthStart = startOfMonth(currentMonth)

  // Event handlers
  const handleSelectDate = (day: Date) => {
    onChange(day)
    setIsOpen(false)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined)
  }

  // Utility functions
  const isSelected = (day: Date) => {
    return date ? isSameDay(date, day) : false
  }

  const isToday_ = (day: Date) => {
    return isToday(day)
  }

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === monthStart.getMonth()
  }

  return (
    <>
      <style>{styles}</style>
      <div className="custom-date-picker" dir={direction}>
        {label && <label className="custom-date-picker-label">{label}</label>}

        <div className="custom-date-picker-container">
          {/* Trigger Button Wrapper */}
          <div className="custom-date-picker-trigger-wrapper">
            <button
              onClick={() => !disabled && setIsOpen(!isOpen)}
              disabled={disabled}
              type="button"
              className={`custom-date-picker-trigger ${isOpen ? "open" : "closed"} ${
                date ? "filled" : "empty"
              }`}
            >
              <span className="icon">📅</span>
              <span className="text">
                {date ? format(date, "yyyy/MM/dd") : displayPlaceholder}
              </span>
            </button>
            {date && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="custom-date-picker-clear-btn"
                title={translations.clear}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Calendar Dropdown */}
          {isOpen && (
            <>
              {/* Overlay */}
              <div
                className="custom-date-picker-overlay"
                onClick={() => setIsOpen(false)}
              />

              {/* Calendar Panel */}
              <div className="custom-date-picker-popup">
                {/* Month Header */}
                <div className="custom-date-picker-header">
                  <button
                    type="button"
                    onClick={isRTL ? handleNextMonth : handlePrevMonth}
                  >
                    {isRTL ? (
                      <ChevronRight size={20} />
                    ) : (
                      <ChevronLeft size={20} />
                    )}
                  </button>

                  <h2>
                    {format(currentMonth, "MMMM yyyy", {
                      locale: dateLocale,
                    })}
                  </h2>

                  <button
                    type="button"
                    onClick={isRTL ? handlePrevMonth : handleNextMonth}
                  >
                    {isRTL ? (
                      <ChevronLeft size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="custom-date-picker-body">
                  {/* Weekday Names */}
                  <div className="custom-date-picker-weekdays">
                    {translations.weekdaysShort.map((day, idx) => (
                      <div key={idx} className="custom-date-picker-weekday">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days Grid */}
                  <div className="custom-date-picker-days">
                    {calendarDays.map((day, idx) => {
                      const selected = isSelected(day)
                      const today = isToday_(day)
                      const inMonth = isCurrentMonth(day)

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => inMonth && handleSelectDate(day)}
                          disabled={!inMonth}
                          className={`custom-date-picker-day ${
                            !inMonth ? "other-month" : "selectable"
                          } ${selected ? "selected" : ""} ${
                            today && inMonth ? "today" : ""
                          }`}
                        >
                          {day.getDate()}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="custom-date-picker-footer">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="close-btn"
                  >
                    {translations.close}
                  </button>
                  {date && (
                    <button
                      type="button"
                      onClick={(e) => {
                        handleClear(e)
                        setIsOpen(false)
                      }}
                      className="clear-btn"
                    >
                      {translations.clear}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}